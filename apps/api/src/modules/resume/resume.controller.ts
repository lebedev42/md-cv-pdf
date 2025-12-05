import { Controller, Post, Get, Body, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ResumeService } from './resume.service';
import {
  GenerateResumeSchema,
  TEMPLATE_INFO,
  type ErrorResponseDto,
} from './dto/generate-resume.dto';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('generate')
  async generate(@Body() body: unknown, @Res() res: Response): Promise<void> {
    // Validate input with Zod
    const parseResult = GenerateResumeSchema.safeParse(body);

    if (!parseResult.success) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: parseResult.error.flatten(),
        },
      };
      throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
    }

    const { content, filename, language, template } = parseResult.data;
    const result = await this.resumeService.generatePdfFromContent(
      content,
      filename,
      language,
      template,
    );

    if (!result.success || !result.pdf) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: 'GENERATION_ERROR',
          message: result.message,
        },
      };
      throw new HttpException(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Return PDF as binary response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('X-Filename', result.filename ?? 'resume.pdf');
    res.send(result.pdf);
  }

  @Get('download/:filename')
  download(@Param('filename') filename: string, @Res() res: Response): void {
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');

    if (!sanitizedFilename.endsWith('.pdf')) {
      throw new HttpException(
        { error: { code: 'INVALID_FILE', message: 'Only PDF files can be downloaded' } },
        HttpStatus.BAD_REQUEST,
      );
    }

    const fileInfo = this.resumeService.getPdfFile(sanitizedFilename);

    if (!fileInfo.exists || !fileInfo.content) {
      throw new HttpException(
        { error: { code: 'FILE_NOT_FOUND', message: 'File not found' } },
        HttpStatus.NOT_FOUND,
      );
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
    res.send(fileInfo.content);
  }

  @Get('templates')
  getTemplates(): typeof TEMPLATE_INFO {
    return this.resumeService.getAvailableTemplates();
  }

  @Get('history')
  getHistory(): { files: Array<{ filename: string; size: number; createdAt: string }> } {
    return {
      files: this.resumeService.getHistoryFiles(),
    };
  }

  @Get('health')
  health(): {
    status: string;
    templates: typeof TEMPLATE_INFO;
    outputDir: string;
  } {
    return {
      status: 'ok',
      templates: this.resumeService.getAvailableTemplates(),
      outputDir: this.resumeService.getOutputDir(),
    };
  }
}
