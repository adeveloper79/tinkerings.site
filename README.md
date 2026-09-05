# tinkerings.site

> Developer log, hardware reverse engineering, and technical lab notes by adeveloper79.

## Overview

A fast, markdown-driven engineering publication and developer log built with React, Vite, and Tailwind CSS. Hosted on GitHub Pages.

### Features
- **Markdown-Powered Posts**: Place `.md` articles into `posts/` and they are compiled automatically.
- **Media Assets**: Drop photos, schematics, and waveform captures into `media/` and reference them via `![Caption](media/image.jpg)` or `![Caption](image.jpg)`.
- **Hardware Reverse-Engineering BOM**: Automatic parsing of component bill-of-materials and specifications.
- **Reading Controls & Typography**: Optimized for sustained reading with Plus Jakarta Sans, JetBrains Mono, adjustable text sizes (`A- / A / A+`), and a live reading progress indicator.
- **Dark / Light Mode**: Eye-friendly charcoal-slate dark theme and crisp high-contrast light mode.

## Adding a New Post

1. Create a new markdown file in `posts/`, e.g. `posts/my-new-project.md`.
2. Add optional YAML frontmatter:
```markdown
---
title: "Project Title"
slug: "project-title"
subtitle: "Brief description of the build"
date: "2026-09-06"
category: "Hardware"
status: "Completed"
tags: ["Reverse Engineering", "RP2040", "RTD2660"]
readTime: "12 min"
---

# Your post content here...
```
3. Save any images to `media/` and link them in your markdown.

## Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```

## Deployment

Pushes to `main` trigger the automated GitHub Actions workflow in `.github/workflows/deploy.yml` which builds and publishes the site directly to GitHub Pages.
