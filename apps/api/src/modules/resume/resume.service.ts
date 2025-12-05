import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { generatePdf } from '@cv/resume-parser';
import type { GeneratePdfResponseDto, Language, Template } from './dto/generate-resume.dto';
import { TEMPLATE_INFO } from './dto/generate-resume.dto';

@Injectable()
export class ResumeService {
  private readonly templatesBaseDir: string;
  private readonly outputDir: string;

  constructor() {
    // Find templates base directory
    const possibleTemplatesDirs = [
      join(process.cwd(), 'templates'),
      join(process.cwd(), '..', '..', 'templates'),
    ];

    const foundTemplatesDir = possibleTemplatesDirs.find((p) => existsSync(p));
    this.templatesBaseDir = foundTemplatesDir ?? possibleTemplatesDirs[0]!;

    // Output directory for generated files
    const possibleOutputDirs = [
      join(process.cwd(), 'output'),
      join(process.cwd(), '..', '..', 'output'),
    ];

    const foundOutputDir = possibleOutputDirs.find((p) => existsSync(p));
    this.outputDir = foundOutputDir ?? possibleOutputDirs[0]!;

    // Ensure output directory exists
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private getTemplatePath(template: Template, language: Language): string {
    return join(this.templatesBaseDir, template, language, 'resume.ejs');
  }

  private getCssPath(template: Template, language: Language): string {
    return join(this.templatesBaseDir, template, language, 'resume.css');
  }

  async generatePdfFromContent(
    content: string,
    filename: string,
    language: Language = 'en',
    template: Template = 'v1',
  ): Promise<GeneratePdfResponseDto> {
    const templatePath = this.getTemplatePath(template, language);
    const cssPath = this.getCssPath(template, language);

    const result = await generatePdf(content, {
      templatePath,
      cssPath,
    });

    if (!result.success || !result.pdf) {
      return {
        success: false,
        message: result.error ?? 'Failed to generate PDF',
      };
    }

    // Add timestamp, template and language to filename
    const now = new Date();
    const timestamp = now.toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);

    const baseName = filename.replace(/\.md$/, '');
    const outputFilename = `${baseName}_${template}_${language}_${timestamp}.pdf`;
    const outputPath = join(this.outputDir, outputFilename);

    // Save file to output directory
    try {
      writeFileSync(outputPath, result.pdf);
      console.log(`PDF saved: ${outputPath}`);
    } catch (err) {
      console.error('Failed to save PDF file:', err);
    }

    return {
      success: true,
      message: `Successfully generated ${outputFilename}`,
      pdf: result.pdf,
      filename: outputFilename,
    };
  }

  getPdfFile(filename: string): { exists: boolean; content?: Buffer; path: string } {
    const filePath = join(this.outputDir, filename);

    if (!existsSync(filePath)) {
      return { exists: false, path: filePath };
    }

    try {
      const content = readFileSync(filePath);
      return { exists: true, content, path: filePath };
    } catch {
      return { exists: false, path: filePath };
    }
  }

  getTemplateInfo(
    template: Template = 'v1',
    language: Language = 'en',
  ): { exists: boolean; path: string } {
    const templatePath = this.getTemplatePath(template, language);
    return {
      exists: existsSync(templatePath),
      path: templatePath,
    };
  }

  getAvailableTemplates(): typeof TEMPLATE_INFO {
    return TEMPLATE_INFO;
  }

  getOutputDir(): string {
    return this.outputDir;
  }

  getHistoryFiles(): Array<{ filename: string; size: number; createdAt: string }> {
    if (!existsSync(this.outputDir)) {
      return [];
    }

    try {
      const files = readdirSync(this.outputDir)
        .filter((file) => file.endsWith('.pdf'))
        .map((filename) => {
          const filePath = join(this.outputDir, filename);
          const stats = statSync(filePath);
          return {
            filename,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return files;
    } catch {
      return [];
    }
  }
}
