import { z } from 'zod';

export const LanguageSchema = z.enum(['en', 'ru']);
export type Language = z.infer<typeof LanguageSchema>;

export const TemplateSchema = z.enum(['v1', 'v2', 'v3', 'v4']);
export type Template = z.infer<typeof TemplateSchema>;

export const GenerateResumeSchema = z.object({
  filename: z.string().min(1).endsWith('.md'),
  content: z.string().min(1),
  language: LanguageSchema.default('en'),
  template: TemplateSchema.default('v1'),
});

export type GenerateResumeDto = z.infer<typeof GenerateResumeSchema>;

export interface GeneratePdfResponseDto {
  success: boolean;
  message: string;
  pdf?: Buffer;
  filename?: string;
}

export interface ErrorResponseDto {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const TEMPLATE_INFO = {
  v1: { name: 'Standard', description: 'Clean grid layout with experience badge' },
  v2: { name: 'Classic', description: 'Elegant serif typography, traditional style' },
  v3: { name: 'Modern', description: 'Sidebar layout with teal accent' },
  v4: { name: 'Compact', description: 'Dense minimalist single-column' },
} as const;
