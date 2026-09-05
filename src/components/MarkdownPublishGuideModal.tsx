import React, { useState } from 'react';
import {
  FileText,
  X,
  Copy,
  Check,
  FolderGit2,
  Sparkles,
  Terminal,
  ExternalLink
} from 'lucide-react';

interface MarkdownPublishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEditor?: () => void;
}

export const MarkdownPublishGuideModal: React.FC<MarkdownPublishGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenEditor,
}) => {
  if (!isOpen) return null;

  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const sampleTemplate = `---
title: "Building an ESP32 Wireless Sensor Node"
slug: "esp32-wireless-sensor-node"
subtitle: "Low-power deep sleep sensor logging battery voltage and temperature over MQTT."
date: "${new Date().toISOString().split('T')[0]}"
category: "Hardware"
status: "Working Prototype"
tags: ["ESP32", "IoT", "MQTT", "Hardware", "C++"]
readTime: "4 min read"
gitCommit: "main"
featured: false
summary: "An ultra-low-power ESP32 node that wakes from deep sleep every 10 minutes to transmit sensor readings."
---

## The Goal
Describe what you built and why.

## Circuit & Pinout
- GPIO 4: Sensor data line
- 3.3V / GND: Power rails

## Code
\`\`\`cpp
void setup() {
  // Wake from deep sleep
  readSensors();
  sendMQTT();
  esp_deep_sleep_start();
}
\`\`\`

## Results
The sensor runs for 8+ months on a single 18650 cell.`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[var(--color-pulse-green)]/10 border border-[var(--color-pulse-green)]/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[var(--color-pulse-green)]" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)] font-mono tracking-tight">
                HOW TO PUBLISH BLOG POSTS
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-sans">
                Pure Markdown files stored directly in your codebase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
          {/* Step 1: posts/ directory */}
          <div className="p-4 rounded-[10px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-[#fe1e34] text-white flex items-center justify-center font-bold text-[11px]">
                1
              </span>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">
                Put your Markdown posts into <code className="text-[#fe1e34] bg-[#fe1e34]/10 px-2 py-0.5 rounded">posts/</code>
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed pl-7">
              Drop any <code className="text-[var(--text-primary)] font-mono">.md</code> file directly into the <code className="text-[var(--text-primary)] font-mono">posts/</code> folder (e.g. <code className="text-[var(--text-primary)] font-mono">posts/rtd2660-st7701-reverse-engineering.md</code>). The blog dynamically discovers, parses YAML frontmatter, calculates read-times, and presents your post in the feed.
            </p>
          </div>

          {/* Step 2: media/ directory */}
          <div className="p-4 rounded-[10px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-[#00bae2] text-white flex items-center justify-center font-bold text-[11px]">
                2
              </span>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">
                Store attached images in <code className="text-[#00bae2] bg-[#00bae2]/10 px-2 py-0.5 rounded">media/</code>
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed pl-7">
              Save any photos, oscilloscope screenshots, schematics, or diagrams into <code className="text-[var(--text-primary)] font-mono">media/</code> (e.g. <code className="text-[var(--text-primary)] font-mono">media/rtd_bench_test.jpg</code>).
              Then simply reference them in your post markdown:
            </p>
            <div className="mt-2.5 ml-7 p-2.5 rounded bg-black/40 border border-white/10 font-mono text-[11px] text-zinc-300">
              <code>![Hardware Bench Setup & Probing](media/rtd_bench_test.jpg)</code>
            </div>
            <p className="text-[11px] text-[var(--text-faint)] font-sans mt-2 pl-7">
              Images will automatically render with dark glass frames, lightbox zoom, and captions, and path prefixes resolve properly on GitHub Pages!
            </p>
          </div>

          {/* Step 3: Example Template */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--text-primary)] text-[var(--bg-canvas)] flex items-center justify-center font-bold text-[11px]">
                  3
                </span>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">
                  Sample Markdown Post Template
                </h3>
              </div>
              <button
                onClick={() => handleCopy(sampleTemplate)}
                className="flex items-center gap-1 text-[11px] text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-full shadow-xs hover:border-[var(--border-hover)] transition-colors cursor-pointer"
              >
                {copiedTemplate ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Template</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-[10px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3 text-[11px] shadow-xs max-h-56 overflow-y-auto">
              <pre className="text-[var(--text-secondary)] leading-relaxed font-mono whitespace-pre-wrap">
                <code>{sampleTemplate}</code>
              </pre>
            </div>
          </div>

          {/* Step 4: Git Push to GitHub Pages */}
          <div className="p-4 rounded-[10px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <FolderGit2 className="w-4 h-4 text-[#fe1e34]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">
                Deploy to GitHub Pages
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed">
              Whenever you push to your GitHub repository:
            </p>
            <div className="mt-2 p-2.5 rounded bg-black/40 border border-white/10 font-mono text-[11px] text-zinc-300">
              <code>git add posts/ media/ && git commit -m "New tinkering log" && git push</code>
            </div>
            <p className="text-[11px] text-[var(--text-faint)] font-sans mt-2">
              The GitHub Actions build deploys automatically to your free GitHub Pages site.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--text-faint)]">
            Static Markdown blog · Zero external databases required
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[6px] bg-[var(--text-primary)] text-[var(--bg-canvas)] font-semibold transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
