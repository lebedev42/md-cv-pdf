import { z } from 'zod';

// Zod schemas for runtime validation
export const JobSchema = z.object({
  title: z.string(),
  period: z.string(),
  duration: z.string(),
  company: z.string(),
  description: z.string(),
  achievements: z.array(z.string()),
  technologies: z.string(),
});

export const SkillsSchema = z.object({
  frontend: z.string(),
  backend: z.string(),
});

export const EducationSchema = z.object({
  period: z.string(),
  university: z.string(),
  faculty: z.string(),
});

export const LanguagesSchema = z.object({
  russian: z.string(),
  english: z.string(),
});

export const ResumeDataSchema = z.object({
  name: z.string(),
  title: z.string(),
  email: z.string().email().optional().or(z.literal('')),
  telegram: z.string(),
  skills: SkillsSchema,
  jobs: z.array(JobSchema),
  education: EducationSchema,
  languages: LanguagesSchema,
});

// TypeScript types inferred from Zod schemas
export type Job = z.infer<typeof JobSchema>;
export type Skills = z.infer<typeof SkillsSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Languages = z.infer<typeof LanguagesSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;

// Generation result type
export interface GenerationResult {
  success: boolean;
  html?: string;
  error?: string;
}
