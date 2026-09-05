import React, { useState } from 'react';
import { TinkeringPost } from '../types';
import { MarkdownView } from './MarkdownView';
import { MacropadDemo } from './demos/MacropadDemo';
import { FluidSimDemo } from './demos/FluidSimDemo';
import { BaudCalcDemo } from './demos/BaudCalcDemo';
import { SdrWaterfallDemo } from './demos/SdrWaterfallDemo';
import {
  ArrowLeft,
  GitCommit,
  Clock,
  Share2,
  Check,
  Cpu,
  Calendar
} from 'lucide-react';

interface PostDetailProps {
  post: TinkeringPost;
  onBack: () => void;
}

type FontSize = 'normal' | 'comfortable' | 'large';

const FONT_SIZES: Record<FontSize, { label: string; size: string; title: string }> = {
  normal: { label: 'A-', size: '1rem', title: 'Compact (16px)' },
  comfortable: { label: 'A', size: '1.125rem', title: 'Comfortable (18px, Default)' },
  large: { label: 'A+', size: '1.25rem', title: 'Large (20px)' },
};

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onBack,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    try {
      const saved = localStorage.getItem('tinkerings_reading_font_size') as FontSize;
      if (saved && FONT_SIZES[saved]) return saved;
    } catch {}
    return 'comfortable';
  });

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    try {
      localStorage.setItem('tinkerings_reading_font_size', size);
    } catch {}
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className="max-w-3xl lg:max-w-4xl mx-auto px-4 py-8"
      style={{ '--reading-font-size': FONT_SIZES[fontSize].size } as React.CSSProperties}
    >
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)] mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-mono cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tinkerings</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Reading Font Size Toggle */}
          <div className="flex items-center rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-0.5" title="Adjust text size">
            {(['normal', 'comfortable', 'large'] as FontSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleFontSizeChange(size)}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer text-[11px] ${
                  fontSize === size
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-bold shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title={FONT_SIZES[size].title}
              >
                {FONT_SIZES[size].label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors shadow-xs cursor-pointer"
            title="Copy URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[var(--color-pulse-green)]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono mb-3">
          <span className="text-[var(--text-primary)] px-2.5 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            {post.category}
          </span>
          <span className="text-[var(--color-pulse-green)] bg-[var(--color-pulse-green)]/10 border border-[var(--color-pulse-green)]/30 px-2.5 py-1 rounded-full font-medium">
            {post.status}
          </span>
          <span className="flex items-center gap-1 text-[var(--text-muted)]">
            <GitCommit className="w-3.5 h-3.5 text-[var(--text-faint)]" /> {post.gitCommit}
          </span>
          <span className="flex items-center gap-1 text-[var(--text-muted)]">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-faint)]" /> {post.date}
          </span>
          <span className="flex items-center gap-1 text-[var(--text-muted)]">
            <Clock className="w-3.5 h-3.5 text-[var(--text-faint)]" /> {post.readTime}
          </span>
        </div>

        {!post.content.trim().startsWith('# ') && (
          <>
            <h1 className="text-3xl sm:text-4xl md:text-[2.65rem] font-extrabold text-[var(--text-primary)] tracking-[-0.025em] leading-[1.2] mb-4">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed font-normal mb-4">
                {post.subtitle}
              </p>
            )}
          </>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
          {post.tags.map((t) => (
            <span
              key={t}
              className="text-xs font-mono px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
            >
              #{t}
            </span>
          ))}
        </div>
      </header>

      {/* Hardware BOM Table (if present) */}
      {post.hardwareBOM && post.hardwareBOM.length > 0 && (
        <section className="my-8 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <Cpu className="w-4 h-4 text-[var(--color-signal-teal)] dark:text-[var(--color-acid-lime)]" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--text-primary)] font-semibold">
              Hardware Bill of Materials (BOM)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="py-2 pr-4">Component</th>
                  <th className="py-2 pr-4">Specification</th>
                  <th className="py-2">Note / Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {post.hardwareBOM.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-elevated)]/50 transition-colors">
                    <td className="py-2.5 pr-4 text-[var(--text-primary)] font-medium">{item.component}</td>
                    <td className="py-2.5 pr-4 text-[var(--text-secondary)]">{item.spec}</td>
                    <td className="py-2.5 text-[var(--text-muted)]">{item.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Embedded Interactive Demo (if post has one) */}
      {post.interactiveDemoId === 'macropad-preview' && <MacropadDemo />}
      {post.interactiveDemoId === 'fluid-sim' && <FluidSimDemo />}
      {post.interactiveDemoId === 'baud-calc' && <BaudCalcDemo />}
      {post.interactiveDemoId === 'sdr-waterfall' && <SdrWaterfallDemo />}

      {/* Main Markdown Body */}
      <div className="mt-8">
        <MarkdownView content={post.content} />
      </div>

      {/* Article Footer & Author Sign-off */}
      <div className="mt-12 p-6 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-pulse-green)] dark:text-[var(--color-acid-lime)] font-medium mb-1">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Published {post.date} · {post.category}
          </div>
          <p className="text-sm text-[var(--text-primary)] font-medium">
            Tinkerings Devlog
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Hardware experiments, reverse engineering notes, and low-level engineering logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3.5 py-2 rounded-[6px] bg-[var(--text-primary)] text-[var(--bg-canvas)] font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm cursor-pointer"
          >
            Back to All Articles
          </button>
        </div>
      </div>
    </div>
  );
};
