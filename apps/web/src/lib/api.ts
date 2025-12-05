const API_URL = 'http://localhost:3001/api';

export type Language = 'en' | 'ru';
export type Template = 'v1' | 'v2' | 'v3' | 'v4';

export interface TemplateInfo {
  id: Template;
  name: string;
  description: string;
}

export const TEMPLATES: TemplateInfo[] = [
  { id: 'v1', name: 'Standard', description: 'Clean grid layout with experience badge' },
  { id: 'v2', name: 'Classic', description: 'Elegant serif typography, traditional style' },
  { id: 'v3', name: 'Modern', description: 'Sidebar layout with teal accent' },
  { id: 'v4', name: 'Compact', description: 'Dense minimalist single-column' },
];

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface GenerateResult {
  success: boolean;
  message: string;
  filename?: string;
  blob?: Blob;
}

export async function generateResume(
  file: File,
  language: Language = 'en',
  template: Template = 'v1',
): Promise<GenerateResult> {
  const content = await file.text();

  const response = await fetch(`${API_URL}/resume/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: file.name,
      content,
      language,
      template,
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(errorData.error?.message ?? 'Failed to generate PDF');
  }

  // Get filename from header
  const filename = response.headers.get('X-Filename') ?? 'resume.pdf';

  // Get PDF as blob
  const blob = await response.blob();

  return {
    success: true,
    message: `Successfully generated ${filename}`,
    filename,
    blob,
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getPreviewUrl(template: Template): string {
  return `/previews/${template}.pdf`;
}

export interface HistoryFile {
  filename: string;
  size: number;
  createdAt: string;
}

export async function getHistory(): Promise<HistoryFile[]> {
  const response = await fetch(`${API_URL}/resume/history`);

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  const data = (await response.json()) as { files: HistoryFile[] };
  return data.files;
}

export function getDownloadUrl(filename: string): string {
  return `${API_URL}/resume/download/${encodeURIComponent(filename)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
