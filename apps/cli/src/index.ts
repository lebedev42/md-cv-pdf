#!/usr/bin/env node

import { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, basename } from 'path';
import { spawn, exec } from 'child_process';
import { createServer } from 'net';
import { generatePdf } from '@cv/resume-parser';

type Language = 'en' | 'ru';
type Template = 'v1' | 'v2' | 'v3' | 'v4';

const API_PORT = 3001;
const WEB_PORT = 5173;

function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

function killPort(port: number): Promise<void> {
  return new Promise((resolve) => {
    const cmd =
      process.platform === 'win32'
        ? `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /PID %a /F`
        : `lsof -ti:${port} | xargs kill -9 2>/dev/null || true`;

    exec(cmd, () => resolve());
  });
}

function openBrowser(url: string): void {
  const cmd =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';

  exec(`${cmd} ${url}`);
}

async function startDevServers(): Promise<void> {
  console.log('\n🚀 Starting web application...\n');

  // Check and free API port if needed
  const apiPortInUse = await isPortInUse(API_PORT);
  if (apiPortInUse) {
    console.log(`⚠️  Port ${API_PORT} is in use, freeing it...`);
    await killPort(API_PORT);
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Check and free web port if needed
  const webPortInUse = await isPortInUse(WEB_PORT);
  if (webPortInUse) {
    console.log(`⚠️  Port ${WEB_PORT} is in use, freeing it...`);
    await killPort(WEB_PORT);
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log('⏳ Starting servers (this may take a moment)...\n');

  const turbo = spawn('pnpm', ['turbo', 'run', 'dev', '--filter=@cv/api', '--filter=@cv/web'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: process.cwd(),
  });

  let serversReady = { api: false, web: false };
  let urlPrinted = false;

  function checkAndPrintUrl(): void {
    if (serversReady.api && serversReady.web && !urlPrinted) {
      urlPrinted = true;
      const url = `http://localhost:${WEB_PORT}`;
      console.log('✅ Servers started successfully!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`\n   🌐 Open in browser: \x1b[36m\x1b[4m${url}\x1b[0m\n`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n   Press Ctrl+C to stop servers\n');

      // Auto-open browser
      setTimeout(() => openBrowser(url), 500);
    }
  }

  turbo.stdout?.on('data', (data: Buffer) => {
    const output = data.toString();

    // Detect API server ready
    if (output.includes('Nest application successfully started') || output.includes(':3001')) {
      serversReady.api = true;
      checkAndPrintUrl();
    }

    // Detect Web server ready
    if (output.includes('Local:') && output.includes('5173')) {
      serversReady.web = true;
      checkAndPrintUrl();
    }
  });

  turbo.stderr?.on('data', (data: Buffer) => {
    const output = data.toString();
    // Only show actual errors, not warnings
    if (output.includes('error') && !output.includes('warning')) {
      console.error(output);
    }
  });

  turbo.on('error', (err) => {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  });

  // Timeout fallback - if we can't detect ready state, show URL after 10s
  setTimeout(() => {
    if (!urlPrinted) {
      serversReady = { api: true, web: true };
      checkAndPrintUrl();
    }
  }, 10000);
}

const TEMPLATES: Record<Template, string> = {
  v1: 'Standard (grid layout)',
  v2: 'Classic (serif typography)',
  v3: 'Modern (sidebar layout)',
  v4: 'Compact (dense minimal)',
};

async function interactiveGenerate(): Promise<void> {
  const projectRoot = process.cwd();

  // Select template
  const template = (await select({
    message: 'Select template style:',
    choices: [
      { name: '📋 Standard (grid layout with experience badge)', value: 'v1' },
      { name: '📜 Classic (elegant serif typography)', value: 'v2' },
      { name: '🎨 Modern (sidebar with teal accent)', value: 'v3' },
      { name: '📑 Compact (dense minimalist)', value: 'v4' },
    ],
  })) as Template;

  // Select language
  const language = (await select({
    message: 'Select language:',
    choices: [
      { name: '🇬🇧 English', value: 'en' },
      { name: '🇷🇺 Russian', value: 'ru' },
    ],
  })) as Language;

  // File input loop with retry
  let success = false;
  while (!success) {
    const inputPath = await input({
      message: 'Enter path to Markdown file:',
      default: './cv.md',
      validate: (value) => {
        if (!value.trim()) return 'Path cannot be empty';
        return true;
      },
    });

    const inputFile = resolve(inputPath);

    // Check if file exists
    if (!existsSync(inputFile)) {
      console.log(`\n❌ File not found: ${inputFile}\n`);
      continue;
    }

    // Check if it's a markdown file
    if (!inputFile.endsWith('.md')) {
      console.log(`\n❌ File must be a Markdown (.md) file\n`);
      continue;
    }

    const templatePath = join(projectRoot, 'templates', template, language, 'resume.ejs');
    const cssPath = join(projectRoot, 'templates', template, language, 'resume.css');

    // Check if template exists
    if (!existsSync(templatePath)) {
      console.log(`\n❌ Template not found: ${templatePath}`);
      console.log('Make sure you are running from the project root directory.\n');
      continue;
    }

    // Generate output path
    const outputDir = join(projectRoot, 'output');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const baseName = basename(inputFile, '.md');
    const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
    const outputFile = join(outputDir, `${baseName}_${template}_${language}_${timestamp}.pdf`);

    console.log('\n📄 Input file:', inputFile);
    console.log('🎨 Template:', TEMPLATES[template]);
    console.log('🌐 Language:', language.toUpperCase());
    console.log('');

    try {
      const mdContent = readFileSync(inputFile, 'utf-8');
      console.log('🔍 Parsing CV structure...');
      console.log('⚙️  Generating PDF...');

      const result = await generatePdf(mdContent, { templatePath, cssPath });

      if (!result.success || !result.pdf) {
        console.log(`\n❌ Generation failed: ${result.error}\n`);
        continue;
      }

      writeFileSync(outputFile, result.pdf);
      success = true;

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ PDF generated successfully!');
      console.log(`\n📁 Output: \x1b[32m${outputFile}\x1b[0m`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.log(`\n❌ Error: ${message}\n`);
    }
  }
}

const program = new Command();

program.name('md-cv-pdf').description('Markdown CV to PDF Template Converter').version('1.0.0');

program
  .command('generate [input] [output]')
  .description('Generate PDF from Markdown file')
  .option('-l, --lang <language>', 'Template language (en or ru)', 'en')
  .option('-t, --template <template>', 'Template style (v1, v2, v3, v4)', 'v1')
  .action(
    async (
      input: string | undefined,
      output: string | undefined,
      options: { lang: string; template: string },
    ) => {
      const projectRoot = process.cwd();
      const language = (options.lang === 'ru' ? 'ru' : 'en') as Language;
      const template = (
        ['v1', 'v2', 'v3', 'v4'].includes(options.template) ? options.template : 'v1'
      ) as Template;
      const inputFile = input ? resolve(input) : join(projectRoot, 'cv-rev2.md');
      const outputFile = output
        ? resolve(output)
        : join(projectRoot, 'output', `resume_${template}_${language}.pdf`);
      const templatePath = join(projectRoot, 'templates', template, language, 'resume.ejs');
      const cssPath = join(projectRoot, 'templates', template, language, 'resume.css');

      console.log('📄 Reading markdown file:', inputFile);
      console.log('🎨 Template:', TEMPLATES[template]);
      console.log('🌐 Language:', language.toUpperCase());

      try {
        const mdContent = readFileSync(inputFile, 'utf-8');
        console.log('🔍 Parsing resume structure...');
        console.log('⚙️  Generating PDF...');

        const result = await generatePdf(mdContent, { templatePath, cssPath });

        if (!result.success || !result.pdf) {
          console.error('❌ Error:', result.error);
          process.exit(1);
        }

        console.log('💾 Writing output:', outputFile);
        writeFileSync(outputFile, result.pdf);

        console.log('✨ Done! PDF resume generated successfully.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error:', message);
        process.exit(1);
      }
    },
  );

program
  .command('dev')
  .description('Start web application (API + Frontend)')
  .action(startDevServers);

program
  .command('interactive', { isDefault: true })
  .description('Interactive mode with menu')
  .action(async () => {
    console.log('\n🎯 Markdown CV to PDF - Interactive Mode\n');

    const action = await select({
      message: 'What would you like to do?',
      choices: [
        {
          name: '📝 Generate PDF from MD file',
          value: 'generate',
          description: 'Convert Markdown CV to PDF',
        },
        {
          name: '🌐 Start web application',
          value: 'dev',
          description: 'Start API and Frontend for browser usage',
        },
        {
          name: '❌ Exit',
          value: 'exit',
        },
      ],
    });

    if (action === 'exit') {
      console.log('👋 Goodbye!');
      process.exit(0);
    }

    if (action === 'dev') {
      await startDevServers();
      return;
    }

    // Generate flow
    await interactiveGenerate();
  });

program.parse();
