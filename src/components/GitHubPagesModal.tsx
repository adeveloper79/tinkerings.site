import React, { useState } from 'react';
import { TinkeringPost } from '../types';
import {
  Github,
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  Terminal,
  FileCode,
  BookOpen
} from 'lucide-react';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: TinkeringPost[];
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({
  isOpen,
  onClose,
  posts,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'deploy-app' | 'jekyll-markdown' | 'faq'>('deploy-app');
  const [githubUser, setGithubUser] = useState('adeveloper79');
  const [repoName, setRepoName] = useState('tinkerings');
  const [copiedAction, setCopiedAction] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);

  const cleanUser = githubUser.trim() || 'username';
  const cleanRepo = repoName.trim() || 'tinkerings';
  const isUserPage = cleanRepo === `${cleanUser}.github.io`;
  const publishedUrl = isUserPage
    ? `https://${cleanUser}.github.io/`
    : `https://${cleanUser}.github.io/${cleanRepo}/`;

  // GitHub Actions workflow for Vite SPA to GitHub Pages
  const workflowYaml = `name: Deploy Tinkerings to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build
        env:
          # If hosting at username.github.io/repo/, base path is /repo/
          VITE_BASE_PATH: /${isUserPage ? '' : cleanRepo}/

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  const gitCommands = `# 1. Initialize local git repository
git init
git add .
git commit -m "feat: initial tinkering devlog"
git branch -M main

# 2. Add your GitHub remote repository
git remote add origin https://github.com/${cleanUser}/${cleanRepo}.git

# 3. Push to GitHub!
git push -u origin main`;

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAllMarkdown = () => {
    posts.forEach((post, index) => {
      setTimeout(() => {
        const mdContent = `---
layout: post
title: "${post.title.replace(/"/g, '\\"')}"
date: ${post.date} 12:00:00 +0000
categories: [${post.category}]
tags: [${post.tags.join(', ')}]
commit: "${post.gitCommit}"
summary: "${post.summary.replace(/"/g, '\\"')}"
---

# ${post.title}

*${post.subtitle}*

${post.content}
`;
        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = `${post.date}-${post.slug || 'post'}.md`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, index * 150);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]/50">
          <div className="flex items-center gap-2.5">
            <Github className="w-5 h-5 text-[var(--text-primary)]" />
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] font-mono tracking-tight flex items-center gap-2">
                GITHUB PAGES DEPLOYMENT BLUEPRINT
                <span className="text-[10px] text-[var(--color-pulse-green)] dark:text-[var(--color-acid-lime)] bg-[var(--color-pulse-green)]/10 dark:bg-[var(--color-acid-lime)]/10 border border-[var(--color-pulse-green)]/30 dark:border-[var(--color-acid-lime)]/30 px-1.5 py-0.2 rounded font-medium">
                  ZERO COST
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Repository Configuration Bar */}
        <div className="bg-[var(--bg-canvas)] px-6 py-3 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--text-muted)] font-medium">Your GitHub:</span>
            <div className="flex items-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded px-2 py-1 shadow-xs">
              <span className="text-[var(--text-faint)]">github.com/</span>
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                placeholder="username"
                className="bg-transparent text-[var(--text-primary)] focus:outline-none w-28 font-medium"
              />
              <span className="text-[var(--text-faint)]">/</span>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="tinkerings"
                className="bg-transparent text-[var(--color-pulse-green)] dark:text-[var(--color-acid-lime)] focus:outline-none w-28 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <span>Live URL:</span>
            <span className="text-[var(--color-pulse-green)] font-medium underline select-all">
              {publishedUrl}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab('deploy-app')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'deploy-app'
                ? 'border-[var(--color-pulse-green)] dark:border-[var(--color-acid-lime)] text-[var(--text-primary)] font-medium'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[var(--color-pulse-green)] dark:text-[var(--color-acid-lime)]" /> Deploy This Complete App (Recommended)
          </button>
          <button
            onClick={() => setActiveTab('jekyll-markdown')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'jekyll-markdown'
                ? 'border-[var(--color-pulse-green)] dark:border-[var(--color-acid-lime)] text-[var(--text-primary)] font-medium'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> Export Markdown for Jekyll / Hugo
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'faq'
                ? 'border-[var(--color-pulse-green)] dark:border-[var(--color-acid-lime)] text-[var(--text-primary)] font-medium'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> How Git Pages Works
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
          {activeTab === 'deploy-app' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm text-[var(--text-primary)] font-semibold flex items-center gap-2 mb-1">
                  <span>Step 1:</span> Push your app to GitHub
                </h3>
                <p className="text-[var(--text-muted)] text-xs font-sans leading-relaxed mb-3">
                  Create a new repository named <span className="font-mono text-[var(--text-primary)] font-medium">{cleanRepo}</span> on GitHub, then run these commands in your project terminal:
                </p>

                <div className="relative rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3 text-xs shadow-xs">
                  <button
                    onClick={() => handleCopy(gitCommands, setCopiedCommands)}
                    className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-1 rounded shadow-xs transition-colors"
                  >
                    {copiedCommands ? <Check className="w-3 h-3 text-[var(--color-pulse-green)]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCommands ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                  <pre className="text-[var(--text-secondary)] leading-relaxed overflow-x-auto pr-24 font-mono">
                    <code>{gitCommands}</code>
                  </pre>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm text-[var(--text-primary)] font-semibold flex items-center gap-2">
                    <span>Step 2:</span> Add Automated GitHub Action Workflow
                  </h3>
                  <button
                    onClick={() => handleCopy(workflowYaml, setCopiedAction)}
                    className="flex items-center gap-1 text-[11px] text-[var(--bg-canvas)] font-medium bg-[var(--text-primary)] hover:opacity-90 px-2.5 py-1 rounded transition-colors shadow-sm"
                  >
                    {copiedAction ? <Check className="w-3 h-3 text-[var(--color-pulse-green)]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAction ? 'Copied YAML' : 'Copy deploy.yml'}</span>
                  </button>
                </div>
                <p className="text-[var(--text-muted)] text-xs font-sans leading-relaxed mb-3">
                  Save this as <span className="font-mono text-[var(--text-primary)] font-medium">.github/workflows/deploy.yml</span> in your repository. GitHub will automatically build and publish your site whenever you push!
                </p>

                <div className="rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3 max-h-52 overflow-y-auto text-[11px] shadow-xs">
                  <pre className="text-[var(--text-secondary)] leading-relaxed font-mono">
                    <code>{workflowYaml}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-sm text-[var(--text-primary)] font-semibold flex items-center gap-2 mb-1">
                  <span>Step 3:</span> Enable GitHub Pages in Repo Settings
                </h3>
                <ol className="list-decimal pl-5 text-[var(--text-muted)] font-sans space-y-1 text-xs">
                  <li>Go to your repo: <span className="font-mono text-[var(--text-primary)] font-medium">github.com/{cleanUser}/{cleanRepo}</span></li>
                  <li>Click <span className="text-[var(--text-primary)] font-semibold">Settings</span> → <span className="text-[var(--text-primary)] font-semibold">Pages</span> (in the left sidebar)</li>
                  <li>Under <span className="text-[var(--text-primary)] font-semibold">Build and deployment &gt; Source</span>, select <span className="text-[var(--color-pulse-green)] dark:text-[var(--color-acid-lime)] font-semibold font-mono">GitHub Actions</span></li>
                  <li>Done! Within ~60 seconds, your site will be live at <a href={publishedUrl} target="_blank" rel="noreferrer" className="text-[var(--color-pulse-green)] underline inline-flex items-center gap-1 font-mono font-medium">{publishedUrl} <ExternalLink className="w-2.5 h-2.5" /></a></li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'jekyll-markdown' && (
            <div className="space-y-5">
              <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between gap-4 shadow-xs">
                <div>
                  <h4 className="text-sm text-[var(--text-primary)] font-semibold">Download All Posts for Jekyll / Astro / Quartz</h4>
                  <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
                    Export all {posts.length} posts as markdown files with standard YAML frontmatter, ready to drop into any static site generator's <code className="text-[var(--text-primary)] font-semibold">_posts/</code> directory.
                  </p>
                </div>
                <button
                  onClick={handleDownloadAllMarkdown}
                  className="px-3.5 py-2 rounded-[6px] bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-canvas)] font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download .md Files
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  Indexed Tinkering Logs in Export:
                </h4>
                <div className="divide-y divide-[var(--border-subtle)] rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-xs">
                  {posts.map((p) => (
                    <div key={p.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[var(--text-primary)] font-sans font-medium">{p.title}</span>
                        <div className="text-[11px] text-[var(--text-faint)]">
                          File: <span className="text-[var(--text-muted)]">{p.date}-{p.slug}.md</span> · Tags: {p.tags.join(', ')}
                        </div>
                      </div>
                      <span className="text-[var(--color-pulse-green)] text-[11px] px-2 py-0.5 rounded bg-[var(--color-pulse-green)]/10 border border-[var(--color-pulse-green)]/20 font-medium">
                        {p.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4 font-sans text-xs text-[var(--text-secondary)] leading-relaxed">
              <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shadow-xs">
                <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1 font-mono">What is GitHub Pages?</h4>
                <p className="text-[var(--text-muted)]">
                  GitHub Pages is a 100% free hosting service provided by GitHub directly from your repository. It serves static HTML, CSS, JavaScript, and WebAssembly, making it ideal for developer blogs, project showcases, and tinkerers.
                </p>
              </div>

              <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shadow-xs">
                <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1 font-mono">What is the difference between username.github.io and username.github.io/repo?</h4>
                <p className="text-[var(--text-muted)]">
                  If your repo is named <code className="text-[var(--color-pulse-green)] dark:text-[var(--color-acid-lime)] font-mono">{cleanUser}.github.io</code>, it hosts your primary root site at <code className="text-[var(--text-primary)] font-mono">https://{cleanUser}.github.io/</code>. If your repo is named <code className="text-[var(--color-pulse-green)] dark:text-[var(--color-acid-lime)] font-mono">{cleanRepo}</code>, it is hosted at <code className="text-[var(--text-primary)] font-mono">https://{cleanUser}.github.io/{cleanRepo}/</code>.
                </p>
              </div>

              <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shadow-xs">
                <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1 font-mono">Can I use a custom domain later?</h4>
                <p className="text-[var(--text-muted)]">
                  Yes! GitHub Pages allows you to attach any custom domain (e.g. <code className="text-[var(--text-primary)] font-mono">tinkerings.dev</code> or <code className="text-[var(--text-primary)] font-mono">blog.yourname.com</code>) with free automated HTTPS SSL certificates. Just add a CNAME record in your DNS provider.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--text-faint)]">
            Pro-tip: You can export your code directly via the AI Studio Settings menu or Git.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[6px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors shadow-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
