#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { generatePdf } from '../packages/resume-parser/src/index.js';

const TEMPLATES = ['v1', 'v2', 'v3', 'v4'] as const;
const projectRoot = process.cwd();

async function main() {
  console.log('🎨 Generating template preview PDFs...\n');

  // Read sample resume
  const samplePath = join(projectRoot, 'templates', 'sample-resume.md');
  const sampleContent = readFileSync(samplePath, 'utf-8');

  // Output directory
  const outputDir = join(projectRoot, 'apps', 'web', 'static', 'previews');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  for (const template of TEMPLATES) {
    const templatePath = join(projectRoot, 'templates', template, 'en', 'resume.ejs');
    const cssPath = join(projectRoot, 'templates', template, 'en', 'resume.css');

    if (!existsSync(templatePath)) {
      console.log(`⚠️  Template ${template} not found, skipping...`);
      continue;
    }

    console.log(`📄 Generating preview for template: ${template}`);

    try {
      const result = await generatePdf(sampleContent, { templatePath, cssPath });

      if (result.success && result.pdf) {
        const outputPath = join(outputDir, `${template}.pdf`);
        writeFileSync(outputPath, result.pdf);
        console.log(`   ✅ Saved: ${outputPath}`);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('\n✨ Done! Preview PDFs generated.');
}

main().catch(console.error);

