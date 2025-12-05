# 📄 Markdown CV to PDF

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9+-orange.svg)](https://pnpm.io/)

> **Transform your Markdown resume into professionally styled PDF documents with customizable templates.**

A modern, open-source tool for developers who prefer writing their CV in Markdown. Choose from 4 beautiful templates, customize them, or create your own. Available as a Web App, CLI, or REST API.

## ✨ Why This Project?

- **Write in Markdown** — Focus on content, not formatting
- **Version Control Friendly** — Track changes with Git like any other code
- **Multiple Output Styles** — One source, multiple professionally designed PDFs
- **Fully Customizable** — Create your own templates with HTML/CSS
- **Developer Experience** — CLI, API, and Web UI to fit your workflow

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 📝 **Markdown Input** | Write your CV in simple Markdown format |
| 🎨 **4 Templates** | Standard, Classic, Modern, and Compact styles |
| 🌍 **Multi-language** | English and Russian template variants |
| 👁️ **Live Preview** | Preview templates before generating |
| 📄 **High-Quality PDF** | Rendered via Playwright (headless Chromium) |
| 💻 **CLI** | Interactive command-line interface |
| 🌐 **REST API** | HTTP API for integrations |
| 🖥️ **Web UI** | Modern interface with dark mode |

---

## 🎨 Templates

<table>
<tr>
<td width="25%">

**v1 — Standard**

Clean grid layout with experience badge. Inter font family.

</td>
<td width="25%">

**v2 — Classic**

Elegant serif typography with Crimson Pro. Traditional professional style.

</td>
<td width="25%">

**v3 — Modern**

Dark sidebar with teal accents. Space Grotesk font.

</td>
<td width="25%">

**v4 — Compact**

Maximum content density. IBM Plex Sans. Single-column minimal.

</td>
</tr>
</table>

Each template is available in **English** (`en`) and **Russian** (`ru`).

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20 or higher
- **pnpm** 9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/md-cv-pdf.git
cd md-cv-pdf

# Install dependencies
pnpm install

# Install Chromium for PDF rendering (one-time setup)
pnpm --filter @cv/resume-parser exec playwright install chromium

# Build the project
pnpm build
```

### Usage

#### Option 1: Web Interface (Recommended)

```bash
pnpm dev
```

Open http://localhost:5173 in your browser:
1. Upload your `.md` file
2. Select a template
3. Choose language
4. Click **Generate PDF**
5. Download your CV!

#### Option 2: Command Line

```bash
# Interactive mode
pnpm cli

# Direct generation
pnpm generate ./my-cv.md ./output/cv.pdf --template v1 --lang en
```

#### Option 3: REST API

```bash
curl -X POST http://localhost:3001/api/resume/generate \
  -H "Content-Type: application/json" \
  -d '{"filename": "cv.md", "content": "# John Doe\n## Developer", "template": "v1", "language": "en"}' \
  --output cv.pdf
```

---

## 📝 Markdown Format

Your CV should follow this structure:

```markdown
# John Doe

## Senior Software Developer

contacts: john@example.com
telegram: @johndoe
github: github.com/johndoe
linkedin: linkedin.com/in/johndoe

### Skills

**Frontend:** React, TypeScript, Next.js, Tailwind CSS
**Backend:** Node.js, NestJS, PostgreSQL, Redis
**DevOps:** Docker, GitHub Actions, AWS

### Work Experience

#### Senior Developer (January 2022 — Present | 3 years) - Tech Company

**Leading the frontend architecture for a B2B SaaS platform**

- Reduced bundle size by 40% through code splitting
- Implemented design system used by 5 product teams
- Mentored 3 junior developers

**Technologies**: React, TypeScript, GraphQL, Storybook

#### Middle Developer (June 2019 — December 2021 | 2.5 years) - Startup Inc

**Full-stack development for e-commerce platform**

- Built real-time inventory management system
- Integrated payment processing (Stripe, PayPal)

**Technologies**: Vue.js, Node.js, MongoDB

### Education

**2015-2019**
MIT
Computer Science

### Languages

English — Native
German — B2 (Upper-Intermediate)
```

### Supported Fields

| Field | Syntax | Example |
|-------|--------|---------|
| Name | `# Name` | `# John Doe` |
| Title | `## Title` | `## Software Developer` |
| Email | `contacts:` or `email:` | `contacts: john@example.com` |
| Telegram | `telegram:` | `telegram: @johndoe` |
| GitHub | `github:` | `github: github.com/johndoe` |
| LinkedIn | `linkedin:` | `linkedin: linkedin.com/in/johndoe` |
| Skills | `**Category:** items` | `**Frontend:** React, Vue` |
| Job | `#### Title (Period \| Duration) - Company` | See example above |
| Education | Under `### Education` | Period, University, Faculty |
| Languages | Under `### Languages` | `English — Native` |

---

## 🛠️ Customization

### Creating Your Own Template

Templates are simple HTML (EJS) + CSS files. Here's how to create a new one:

#### 1. Create Template Directory

```bash
mkdir -p templates/v5/en templates/v5/ru
```

#### 2. Create `resume.ejs`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="resume.css">
</head>
<body>
  <header>
    <h1><%= data.name %></h1>
    <h2><%= data.title %></h2>
    
    <div class="contacts">
      <% if (data.email) { %><span><%= data.email %></span><% } %>
      <% if (data.telegram) { %><span><%= data.telegram %></span><% } %>
    </div>
  </header>

  <section class="skills">
    <h3>Skills</h3>
    <% if (data.skills.frontend) { %>
      <p><strong>Frontend:</strong> <%= data.skills.frontend %></p>
    <% } %>
    <% if (data.skills.backend) { %>
      <p><strong>Backend:</strong> <%= data.skills.backend %></p>
    <% } %>
  </section>

  <section class="experience">
    <h3>Experience</h3>
    <% data.jobs.forEach(job => { %>
      <article class="job">
        <div class="job-header">
          <strong><%= job.title %></strong>
          <span><%= job.company %></span>
          <span><%= job.period %></span>
        </div>
        <p><%= job.description %></p>
        <ul>
          <% job.achievements.forEach(item => { %>
            <li><%= item %></li>
          <% }) %>
        </ul>
        <% if (job.technologies) { %>
          <p class="tech"><%= job.technologies %></p>
        <% } %>
      </article>
    <% }) %>
  </section>

  <% if (data.education.university) { %>
  <section class="education">
    <h3>Education</h3>
    <p><%= data.education.period %></p>
    <p><%= data.education.university %></p>
    <p><%= data.education.faculty %></p>
  </section>
  <% } %>
</body>
</html>
```

#### 3. Create `resume.css`

```css
@page {
  size: A4;
  margin: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #1a1a1a;
  padding: 40px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

h1 { font-size: 28pt; margin-bottom: 4px; }
h2 { font-size: 14pt; color: #666; font-weight: 400; }
h3 { font-size: 12pt; margin: 20px 0 10px; border-bottom: 1px solid #ddd; }

.job {
  margin-bottom: 16px;
  page-break-inside: avoid;
}

/* Add your custom styles... */
```

#### 4. Register the Template

Edit `apps/api/src/modules/resume/dto/generate-resume.dto.ts`:

```typescript
export const TemplateSchema = z.enum(['v1', 'v2', 'v3', 'v4', 'v5']);

export const TEMPLATE_INFO = [
  // ... existing templates
  { id: 'v5', name: 'Custom', description: 'Your custom template' },
];
```

#### 5. Generate Preview

```bash
pnpm generate:previews
```

### Available Template Variables

```javascript
data.name              // "John Doe"
data.title             // "Software Developer"  
data.email             // "john@example.com"
data.telegram          // "@johndoe"
data.github            // "github.com/johndoe"
data.linkedin          // "linkedin.com/in/johndoe"

data.skills.frontend   // "React, TypeScript, ..."
data.skills.backend    // "Node.js, PostgreSQL, ..."
data.skills.devops     // "Docker, AWS, ..."
data.skills.other      // Any other skill category

experience             // Total years (calculated)

data.jobs[]            // Array of job objects
  .title               // "Senior Developer"
  .company             // "Tech Company"
  .period              // "Jan 2022 — Present"
  .duration            // "3 years"
  .description         // Role description
  .achievements[]      // Array of bullet points
  .technologies        // "React, Node.js, ..."

data.education
  .period              // "2015-2019"
  .university          // "MIT"
  .faculty             // "Computer Science"

data.languages
  .english             // "Native"
  .russian             // "B2"
```

### CSS Tips for PDF

```css
/* Force background colors to print */
* {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Prevent page breaks inside elements */
.job, .section {
  page-break-inside: avoid;
}

/* Force page break before element */
.page-break {
  page-break-before: always;
}

/* A4 page setup */
@page {
  size: A4;
  margin: 0; /* Handle margins in body */
}
```

---

## 📁 Project Structure

```
md-cv-pdf/
├── apps/
│   ├── api/              # NestJS REST API
|   |   └── output/       # Generated PDFs
│   ├── cli/              # Commander CLI
│   └── web/              # SvelteKit Web UI
├── packages/
│   ├── resume-parser/    # Core MD→PDF library
│   └── tsconfig/         # Shared TS configs
├── templates/
│   ├── v1/en/, v1/ru/    # Standard template
│   ├── v2/en/, v2/ru/    # Classic template
│   ├── v3/en/, v3/ru/    # Modern template
│   └── v4/en/, v4/ru/    # Compact template
├── scripts/              # Build scripts
```

---

## 🔧 Development

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all packages |
| `pnpm cli` | Run CLI interactively |
| `pnpm generate:previews` | Generate template previews |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm format` | Format with Prettier |

### Running Individual Apps

```bash
pnpm --filter @cv/api dev      # API only (port 3001)
pnpm --filter @cv/web dev      # Web only (port 5173)
pnpm --filter @cv/cli start    # CLI
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resume/generate` | Generate PDF |
| `GET` | `/api/resume/templates` | List templates |
| `GET` | `/api/resume/history` | List generated files |
| `GET` | `/api/resume/download/:filename` | Download PDF |
| `GET` | `/api/resume/health` | Health check |

### Generate PDF

```bash
curl -X POST http://localhost:3001/api/resume/generate \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "cv.md",
    "content": "# John Doe\n## Developer\n...",
    "template": "v1",
    "language": "en"
  }' \
  --output cv.pdf
```

---

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Core** | TypeScript 5.7, Node.js 20+ |
| **Monorepo** | Turborepo, pnpm workspaces |
| **API** | NestJS, Zod validation |
| **Web** | SvelteKit, Svelte 5, Tailwind CSS v4 |
| **CLI** | Commander, Inquirer |
| **PDF** | Playwright, EJS templates |
| **Quality** | ESLint, Prettier |

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **🐛 Bug Reports** — Open an issue with steps to reproduce
2. **✨ Feature Requests** — Describe your idea in an issue
3. **📝 Documentation** — Improve README or add examples
4. **🎨 Templates** — Create and share new CV templates
5. **💻 Code** — Submit a PR (please open an issue first for major changes)

### Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/md-cv-pdf.git
cd md-cv-pdf
pnpm install
pnpm --filter @cv/resume-parser exec playwright install chromium
pnpm dev
```

---

## 📋 Roadmap

- [ ] More templates (creative, academic, technical)
- [ ] Template marketplace/gallery
- [ ] Export to DOCX format
- [ ] AI-powered content suggestions
- [ ] GitHub Actions for auto-generation
- [ ] Docker image

---

## 📄 License

MIT © 2025

---

<p align="center">
  <strong>⭐ Star this repo if you find it useful!</strong>
</p>
