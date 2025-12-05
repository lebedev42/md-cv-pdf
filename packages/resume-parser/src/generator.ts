import { readFileSync } from 'fs';
import { join } from 'path';
import ejs from 'ejs';
import type { GenerationResult } from './types.js';
import { parseResume, calculateExperience } from './parse-resume.js';

// Template path - use process.cwd() for runtime resolution
const getDefaultTemplatePath = (): string => join(process.cwd(), 'templates', 'resume.ejs');

/**
 * Generate HTML from markdown content
 */
export function generateHtml(mdContent: string, templatePath?: string): GenerationResult {
  try {
    const data = parseResume(mdContent);
    const experience = calculateExperience(data.jobs);

    const resolvedTemplatePath = templatePath ?? getDefaultTemplatePath();
    const template = readFileSync(resolvedTemplatePath, 'utf-8');
    const html = ejs.render(template, { data, experience });

    return { success: true, html };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Generate HTML from markdown file path
 */
export function generateHtmlFromFile(mdFilePath: string, templatePath?: string): GenerationResult {
  try {
    const mdContent = readFileSync(mdFilePath, 'utf-8');
    return generateHtml(mdContent, templatePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to read file: ${message}` };
  }
}

export { parseResume, calculateExperience };
