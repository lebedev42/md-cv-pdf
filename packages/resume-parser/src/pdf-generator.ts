import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import ejs from 'ejs';
import type { GenerationResult } from './types.js';
import { parseResume, calculateExperience } from './parse-resume.js';

interface PdfGenerationResult {
  success: boolean;
  pdf?: Buffer;
  error?: string;
}

// CSS content - will be inlined into HTML
const getDefaultCssPath = (): string => {
  const possiblePaths = [
    join(process.cwd(), 'resume.css'),
    join(process.cwd(), 'templates', 'resume.css'),
    join(process.cwd(), '..', '..', 'resume.css'),
  ];

  return possiblePaths.find((p) => existsSync(p)) ?? possiblePaths[0]!;
};

const getDefaultTemplatePath = (): string => {
  const possiblePaths = [
    join(process.cwd(), 'templates', 'resume.ejs'),
    join(process.cwd(), '..', '..', 'templates', 'resume.ejs'),
  ];

  return possiblePaths.find((p) => existsSync(p)) ?? possiblePaths[0]!;
};

/**
 * Generate HTML with inline CSS for PDF rendering
 */
function generateHtmlForPdf(
  mdContent: string,
  templatePath?: string,
  cssPath?: string,
): GenerationResult {
  try {
    const data = parseResume(mdContent);
    const experience = calculateExperience(data.jobs);

    const resolvedTemplatePath = templatePath ?? getDefaultTemplatePath();
    const resolvedCssPath = cssPath ?? getDefaultCssPath();

    const template = readFileSync(resolvedTemplatePath, 'utf-8');
    const css = existsSync(resolvedCssPath) ? readFileSync(resolvedCssPath, 'utf-8') : '';

    // Render template
    let html = ejs.render(template, { data, experience });

    // Replace external CSS link with inline styles
    html = html.replace(
      /<link\s+rel="stylesheet"\s+href="resume\.css"\s*\/?>/,
      `<style>\n${css}\n</style>`,
    );

    return { success: true, html };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Generate PDF from markdown content using Playwright
 */
export async function generatePdf(
  mdContent: string,
  options?: {
    templatePath?: string;
    cssPath?: string;
  },
): Promise<PdfGenerationResult> {
  const htmlResult = generateHtmlForPdf(mdContent, options?.templatePath, options?.cssPath);

  if (!htmlResult.success || !htmlResult.html) {
    return { success: false, error: htmlResult.error };
  }

  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Set content and wait for fonts to load
    await page.setContent(htmlResult.html, {
      waitUntil: 'networkidle',
    });

    // Generate PDF with A4 format
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    return { success: true, pdf };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `PDF generation failed: ${message}` };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate PDF from markdown file path
 */
export async function generatePdfFromFile(
  mdFilePath: string,
  options?: {
    templatePath?: string;
    cssPath?: string;
  },
): Promise<PdfGenerationResult> {
  try {
    const mdContent = readFileSync(mdFilePath, 'utf-8');
    return generatePdf(mdContent, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to read file: ${message}` };
  }
}

export type { PdfGenerationResult };
