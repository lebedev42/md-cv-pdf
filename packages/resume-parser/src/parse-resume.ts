import type { ResumeData, Job } from './types.js';

interface JobHeader {
  title: string;
  period: string;
  duration: string;
  company: string;
}

/**
 * Parse job header line
 * @param line - Header line like "#### Senior Full-Stack Developer (May 2025 - Present) - Company"
 */
function parseJobHeader(line: string): JobHeader {
  const content = line.replace(/^####\s*/, '');

  // Match pattern: Title (Period | Duration) - Company
  const match = content.match(/^(.+?)\s*\((.+?)(?:\s*\|\s*(.+?))?\)\s*-\s*(.+)$/);

  if (match) {
    return {
      title: match[1]?.trim() ?? '',
      period: match[2]?.trim() ?? '',
      duration: match[3]?.trim() ?? '',
      company: match[4]?.trim() ?? '',
    };
  }

  return { title: content, period: '', duration: '', company: '' };
}

/**
 * Convert markdown bold to HTML strong tags
 */
function markdownToHtml(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/**
 * Parse markdown CV file content
 */
export function parseResume(content: string): ResumeData {
  const lines = content.split('\n');

  const data: ResumeData = {
    name: '',
    title: '',
    email: '',
    telegram: '',
    skills: { frontend: '', backend: '' },
    jobs: [],
    education: { period: '', university: '', faculty: '' },
    languages: { russian: '', english: '' },
  };

  let currentSection = '';
  let currentJob: Job | null = null;
  let inJobAchievements = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      continue;
    }

    // Parse H1 - Name
    if (trimmedLine.startsWith('# ') && !trimmedLine.startsWith('## ')) {
      data.name = trimmedLine.replace(/^#\s*/, '');
      continue;
    }

    // Parse H2 - Title
    if (trimmedLine.startsWith('## ') && !trimmedLine.startsWith('### ')) {
      data.title = trimmedLine.replace(/^##\s*/, '');
      continue;
    }

    // Parse contacts (supports both English and Russian keywords)
    if (
      trimmedLine.toLowerCase().startsWith('contacts:') ||
      trimmedLine.toLowerCase().startsWith('email:') ||
      trimmedLine.includes('mail')
    ) {
      const emailMatch = trimmedLine.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        data.email = emailMatch[0];
      }
      continue;
    }

    if (
      trimmedLine.toLowerCase().startsWith('telegram:') ||
      (trimmedLine.includes('@') && !trimmedLine.includes('mail'))
    ) {
      const telegramMatch = trimmedLine.match(/@[\w]+/);
      if (telegramMatch) {
        data.telegram = telegramMatch[0];
      }
      continue;
    }

    // Parse H3 - Sections
    if (trimmedLine.startsWith('### ')) {
      const sectionName = trimmedLine.replace(/^###\s*/, '').toUpperCase();

      if (currentJob) {
        data.jobs.push(currentJob);
        currentJob = null;
      }

      if (sectionName.includes('SKILLS')) {
        currentSection = 'skills';
      } else if (sectionName.includes('EXPERIENCE') || sectionName.includes('WORK')) {
        currentSection = 'experience';
      } else if (sectionName.includes('EDUCATION')) {
        currentSection = 'education';
      } else if (sectionName.includes('LANGUAGES') || sectionName.includes('LANGUAGE')) {
        currentSection = 'languages';
      }
      continue;
    }

    // Parse H4 - Job headers
    if (trimmedLine.startsWith('#### ')) {
      if (currentJob) {
        data.jobs.push(currentJob);
      }

      const jobInfo = parseJobHeader(trimmedLine);
      currentJob = {
        ...jobInfo,
        description: '',
        achievements: [],
        technologies: '',
      };
      inJobAchievements = false;
      continue;
    }

    // Parse content based on current section
    switch (currentSection) {
      case 'skills':
        if (trimmedLine.startsWith('**Frontend:**') || trimmedLine.startsWith('**Frontend:')) {
          data.skills.frontend = trimmedLine.replace(/^\*\*Frontend:\*\*\s*/, '');
        } else if (trimmedLine.startsWith('**Backend:**') || trimmedLine.startsWith('**Backend:')) {
          data.skills.backend = trimmedLine.replace(/^\*\*Backend:\*\*\s*/, '');
        }
        break;

      case 'experience':
        if (currentJob) {
          if (trimmedLine.startsWith('**') && !trimmedLine.toLowerCase().includes('technolog')) {
            currentJob.description = trimmedLine.replace(/^\*\*/, '').replace(/\*\*$/, '');
            inJobAchievements = true;
          } else if (trimmedLine.toLowerCase().includes('**technolog')) {
            currentJob.technologies = trimmedLine
              .replace(/^\*\*Technologies\*\*:\s*/i, '')
              .replace(/^\*\*Tech\*\*:\s*/i, '');
            inJobAchievements = false;
          } else if (trimmedLine.startsWith('- ') && inJobAchievements) {
            const achievement = trimmedLine.replace(/^-\s*/, '');
            currentJob.achievements.push(markdownToHtml(achievement));
          }
        }
        break;

      case 'education':
        if (trimmedLine.startsWith('**')) {
          data.education.period = trimmedLine.replace(/^\*\*/, '').replace(/\*\*.*$/, '');
        } else if (
          trimmedLine.toLowerCase().includes('university') ||
          trimmedLine.toLowerCase().includes('college') ||
          trimmedLine.toLowerCase().includes('institute')
        ) {
          data.education.university = trimmedLine;
        } else if (
          trimmedLine.toLowerCase().includes('faculty') ||
          trimmedLine.toLowerCase().includes('department') ||
          trimmedLine.toLowerCase().includes('degree')
        ) {
          data.education.faculty = trimmedLine;
        }
        break;

      case 'languages':
        if (trimmedLine.toLowerCase().includes('russian')) {
          data.languages.russian = trimmedLine;
        } else if (trimmedLine.toLowerCase().includes('english')) {
          data.languages.english = trimmedLine;
        }
        break;
    }
  }

  if (currentJob) {
    data.jobs.push(currentJob);
  }

  return data;
}

/**
 * Calculate total years of experience based on first job
 */
export function calculateExperience(jobs: Job[]): number {
  if (!jobs || jobs.length === 0) return 0;

  // Find earliest year from job periods
  let earliestYear = new Date().getFullYear();

  for (const job of jobs) {
    const yearMatch = job.period.match(/\b(20\d{2})\b/);
    if (yearMatch && yearMatch[1]) {
      const year = parseInt(yearMatch[1], 10);
      if (year < earliestYear) {
        earliestYear = year;
      }
    }
  }

  return new Date().getFullYear() - earliestYear;
}
