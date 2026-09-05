import React, { useState } from 'react';
import { TinkeringPost, PostCategory, PostStatus, BOMItem } from '../types';
import { MarkdownView } from './MarkdownView';
import { formatPostToMarkdown } from '../utils/postsLoader';
import { X, Plus, Trash2, Wand2, Eye, Edit3, Download, Copy, Check, FileText } from 'lucide-react';

interface PostEditorModalProps {
  post: TinkeringPost | null; // If null, creating new
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: TinkeringPost) => void;
}

const CATEGORIES: PostCategory[] = [
  'Hardware',
  'Firmware',
  'Software',
  'Reverse Engineering',
  'Graphics & Shaders',
  'CLI & Tooling',
];

const STATUSES: PostStatus[] = ['Shipped', 'Working Prototype', 'Experiment', 'Shelved'];

const TEMPLATES = {
  hardware: `## The Objective
Explain the problem you set out to solve and why off-the-shelf solutions weren't suitable.

\`\`\`
  +---------------+        +---------------+
  |   Sensor A    |  I2C   | Microcontroller
  | (SDA=GP4/SCL) +------->|  (RP2040/ESP32)
  +---------------+        +---------------+
\`\`\`

## Circuit & Pinout
- **VCC**: 3.3V regulated rail
- **GND**: Common ground plane
- **I2C Bus**: GP4 (SDA), GP5 (SCL) with 4.7kΩ pullups

## Firmware Snippet
\`\`\`cpp
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin();
}

void loop() {
  // Read register
  delay(100);
}
\`\`\`

## What Failed & How I Fixed It
- Trace capacitance caused clock stretching issues until lower pull-up resistors were soldered.`,

  reverseEngineering: `## Target Overview
Documenting the target hardware/protocol (FCC ID, chipset labels, frequencies).

## Signal Capture
Captured 100k samples using logic analyzer / SDR:
\`\`\`
Preamble: 10101010 [8 bits]
Device ID: 0x4A     [8 bits]
Data:      0x028F   [16 bits]
Checksum:  CRC-8    [8 bits]
\`\`\`

## Python Decoder
\`\`\`python
def decode(stream):
    # parse raw pulses
    return {"temp": 24.5}
\`\`\`

## Conclusions
The protocol is completely unauthenticated and broadcasts every 60 seconds.`,

  software: `## Problem Statement
Standard algorithms suffered from high memory overhead or latency spikes.

## Benchmark Results
| Method | Ops/sec | Allocations |
| :--- | :--- | :--- |
| Baseline | 42,000 | 120 KB/op |
| **Optimized** | **380,000** | **0 B/op** |

## Implementation
\`\`\`rust
pub fn process_zero_copy(input: &[u8]) -> &[u8] {
    // Zero-allocation logic
    input
}
\`\`\`

## Learnings
Profiling with flamegraphs revealed unexpected cache misses.`
};

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  post,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(post?.title || '');
  const [subtitle, setSubtitle] = useState(post?.subtitle || '');
  const [category, setCategory] = useState<PostCategory>(post?.category || 'Hardware');
  const [status, setStatus] = useState<PostStatus>(post?.status || 'Working Prototype');
  const [tagsInput, setTagsInput] = useState(post?.tags.join(', ') || 'RP2040, Hardware, DIY');
  const [gitCommit, setGitCommit] = useState(
    post?.gitCommit || Math.random().toString(16).substring(2, 9)
  );
  const [readTime, setReadTime] = useState(post?.readTime || '4 min read');
  const [summary, setSummary] = useState(post?.summary || '');
  const [content, setContent] = useState(post?.content || TEMPLATES.hardware);
  const [bom, setBom] = useState<BOMItem[]>(post?.hardwareBOM || []);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [copiedMd, setCopiedMd] = useState(false);

  const getComputedPost = (): TinkeringPost => {
    const slug = (title.trim() || 'post')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    return {
      id: post?.id || `post-${Date.now()}`,
      slug: post?.slug || slug || `tinkering-${Date.now()}`,
      title: title.trim() || 'Untitled Post',
      subtitle,
      date: post?.date || new Date().toISOString().split('T')[0],
      category,
      status,
      tags: tags.length > 0 ? tags : ['Tinkering'],
      readTime: readTime || '4 min read',
      gitCommit: gitCommit || 'c0ffee7',
      summary: summary || subtitle || title,
      content,
      hardwareBOM: bom.filter((b) => b.component.trim() !== ''),
      interactiveDemoId: post?.interactiveDemoId,
    };
  };

  const handleDownloadMarkdown = () => {
    const currentPost = getComputedPost();
    const mdString = formatPostToMarkdown(currentPost);
    const blob = new Blob([mdString], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentPost.slug}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const currentPost = getComputedPost();
    const mdString = formatPostToMarkdown(currentPost);
    navigator.clipboard.writeText(mdString);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleAddBomItem = () => {
    setBom([...bom, { component: '', spec: '', note: '' }]);
  };

  const handleUpdateBom = (index: number, field: keyof BOMItem, value: string) => {
    const updated = [...bom];
    updated[index] = { ...updated[index], [field]: value };
    setBom(updated);
  };

  const handleRemoveBomItem = (index: number) => {
    setBom(bom.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPost = getComputedPost();
    onSave(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-pulse-green)] dark:bg-[var(--color-acid-lime)]" />
            <h2 className="font-semibold text-sm text-[var(--text-primary)] font-mono uppercase tracking-tight">
              {post ? 'Edit Tinkering Entry' : 'Log New Tinkering Experiment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-mono">
          {/* Markdown Git Workflow Explainer Banner */}
          <div className="p-3.5 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-start gap-3 shadow-xs">
            <div className="w-6 h-6 rounded bg-[var(--color-pulse-green)]/10 text-[var(--color-pulse-green)] flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] font-sans leading-relaxed">
              <span className="font-semibold text-[var(--text-primary)] font-mono">Git & Markdown Workflow: </span>
              <span className="text-[var(--text-muted)]">
                Posts on your blog live as <code className="text-[var(--text-primary)] font-mono">.md</code> files in <code className="text-[var(--color-pulse-green)] font-mono">src/posts/</code>. You can preview your draft here, then click <strong>Download .md</strong> to drop it straight into your repository so everyone can read it.
              </span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-3">
            <div>
              <label className="block text-[var(--text-muted)] mb-1 font-semibold">TITLE *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Building a 4-Key Mechanical Macropad with RP2040"
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] focus:border-[var(--text-primary)] focus:outline-none px-3.5 py-2 rounded-[6px] text-sm text-[var(--text-primary)] shadow-xs transition-colors"
              />
            </div>

            <div>
              <label className="block text-[var(--text-muted)] mb-1">SUBTITLE / ONE-LINER</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Brief technical summary of the hack or finding"
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] focus:border-[var(--text-primary)] focus:outline-none px-3.5 py-2 rounded-[6px] text-xs text-[var(--text-secondary)] shadow-xs transition-colors"
              />
            </div>
          </div>

          {/* Category, Status, Commit, Read Time */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[var(--text-muted)] mb-1">CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-[6px] px-3 py-2 text-xs shadow-xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-muted)] mb-1">STATUS</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-[6px] px-3 py-2 text-xs shadow-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-muted)] mb-1">GIT COMMIT</label>
              <input
                type="text"
                value={gitCommit}
                onChange={(e) => setGitCommit(e.target.value)}
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-[6px] px-3 py-2 text-xs shadow-xs"
              />
            </div>

            <div>
              <label className="block text-[var(--text-muted)] mb-1">READ TIME</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="5 min read"
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-[6px] px-3 py-2 text-xs shadow-xs"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[var(--text-muted)] mb-1">TAGS (COMMA SEPARATED)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="RP2040, Hardware, CircuitPython, HID"
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] px-3.5 py-2 rounded-[6px] text-xs text-[var(--text-primary)] shadow-xs"
            />
          </div>

          {/* Bill of Materials (Optional) */}
          <div className="p-3.5 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] font-semibold">BILL OF MATERIALS (BOM) — OPTIONAL</span>
              <button
                type="button"
                onClick={handleAddBomItem}
                className="text-[var(--color-pulse-green)] dark:text-[var(--color-acid-lime)] hover:underline flex items-center gap-1 text-[11px] font-medium"
              >
                <Plus className="w-3 h-3" /> Add Part
              </button>
            </div>
            {bom.length === 0 ? (
              <p className="text-[11px] text-[var(--text-faint)]">No hardware parts listed yet. Click "Add Part" if this is a physical tinkering.</p>
            ) : (
              <div className="space-y-2">
                {bom.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Component (e.g. ESP32-S3)"
                      value={item.component}
                      onChange={(e) => handleUpdateBom(idx, 'component', e.target.value)}
                      className="flex-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)]"
                    />
                    <input
                      type="text"
                      placeholder="Spec (e.g. 16MB Flash)"
                      value={item.spec}
                      onChange={(e) => handleUpdateBom(idx, 'spec', e.target.value)}
                      className="flex-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded text-xs text-[var(--text-secondary)]"
                    />
                    <input
                      type="text"
                      placeholder="Note / Source"
                      value={item.note}
                      onChange={(e) => handleUpdateBom(idx, 'note', e.target.value)}
                      className="w-36 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded text-xs text-[var(--text-muted)]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBomItem(idx)}
                      className="p-1.5 text-[var(--text-faint)] hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Templates */}
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-[var(--text-faint)] flex items-center gap-1 font-medium">
              <Wand2 className="w-3 h-3 text-[var(--color-pulse-green)] dark:text-[var(--color-acid-lime)]" /> Insert Template:
            </span>
            <button
              type="button"
              onClick={() => setContent(TEMPLATES.hardware)}
              className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Hardware Hack
            </button>
            <button
              type="button"
              onClick={() => setContent(TEMPLATES.reverseEngineering)}
              className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Reverse Engineering
            </button>
            <button
              type="button"
              onClick={() => setContent(TEMPLATES.software)}
              className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Systems / Software
            </button>
          </div>

          {/* Markdown Content with Toggle Tabs */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)]">
              <label className="text-[var(--text-muted)] font-semibold">POST CONTENT (MARKDOWN)</label>
              <div className="flex items-center rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
                    activeTab === 'editor' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
                    activeTab === 'preview' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>

            {activeTab === 'editor' ? (
              <textarea
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your logs, schematics, code snippets, and post-mortems in Markdown..."
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] focus:border-[var(--text-primary)] focus:outline-none p-3.5 rounded-[6px] text-xs font-mono text-[var(--text-primary)] leading-relaxed resize-y shadow-xs"
              />
            ) : (
              <div className="p-4 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] max-h-96 overflow-y-auto">
                <MarkdownView content={content} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="px-3 py-1.5 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] flex items-center gap-1.5 transition-colors shadow-xs"
                title="Download this post as a .md file to save into src/posts/"
              >
                <Download className="w-3.5 h-3.5 text-[var(--color-pulse-green)]" />
                <span>Download .md</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="px-3 py-1.5 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] flex items-center gap-1.5 transition-colors shadow-xs"
                title="Copy Markdown with YAML frontmatter"
              >
                {copiedMd ? <Check className="w-3.5 h-3.5 text-[var(--color-pulse-green)]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMd ? 'Copied .md!' : 'Copy .md'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-[6px] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[6px] bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-canvas)] font-semibold transition-all shadow-sm"
              >
                {post ? 'Save to Preview' : 'Add to Live Preview'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
