import React, { useState, useEffect, useMemo } from 'react';
import { TinkeringPost } from '../types';
import { MarkdownView } from './MarkdownView';
import { MacropadDemo } from './demos/MacropadDemo';
import { FluidSimDemo } from './demos/FluidSimDemo';
import { BaudCalcDemo } from './demos/BaudCalcDemo';
import { SdrWaterfallDemo } from './demos/SdrWaterfallDemo';
import {
  ArrowLeft,
  ArrowUp,
  GitCommit,
  Share2,
  Check,
  Cpu
} from 'lucide-react';

interface PostDetailProps {
  post: TinkeringPost;
  allPosts?: TinkeringPost[];
  onBack: () => void;
  onSelectPost?: (post: TinkeringPost) => void;
}

type FontSize = 'normal' | 'comfortable' | 'large';

const FONT_SIZES: Record<FontSize, { label: string; size: string; title: string }> = {
  normal: { label: 'A-', size: '1rem', title: 'Compact (16px)' },
  comfortable: { label: 'A', size: '1.0625rem', title: 'Default (17px)' },
  large: { label: 'A+', size: '1.1875rem', title: 'Large (19px)' },
};

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  allPosts = [],
  onBack,
  onSelectPost,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    try {
      const saved = localStorage.getItem('tinkerings_reading_font_size') as FontSize;
      if (saved && FONT_SIZES[saved]) return saved;
    } catch {}
    return 'comfortable';
  });

  // Strip leading # Title and italic subtitle lines from markdown body to avoid displaying twice
  const cleanContent = useMemo(() => {
    let text = post.content.trim();
    if (text.startsWith('# ')) {
      text = text.replace(/^#\s+[^\r\n]+(\r?\n)*/, '');
      while (text.match(/^\s*\*([^*\r\n]+)\*(\r?\n)*/)) {
        text = text.replace(/^\s*\*([^*\r\n]+)\*(\r?\n)*/, '');
      }
    }
    return text.trim();
  }, [post.content]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Previous & Next posts for PaperMod paginav
  const currentIndex = allPosts.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <article
      className="max-w-[880px] mx-auto py-4"
      style={{ '--reading-font-size': FONT_SIZES[fontSize].size } as React.CSSProperties}
    >
      {/* Navigation & Toolbar Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to posts</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          {/* Font Size Adjuster */}
          <div className="flex items-center rounded-md bg-[var(--code-bg)] border border-[var(--border)] p-0.5" title="Reading font size">
            {(['normal', 'comfortable', 'large'] as FontSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleFontSizeChange(size)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  fontSize === size
                    ? 'bg-[var(--entry)] text-[var(--primary)] font-bold shadow-xs'
                    : 'text-[var(--secondary)] hover:text-[var(--primary)]'
                }`}
                title={FONT_SIZES[size].title}
              >
                {FONT_SIZES[size].label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--code-bg)] border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--primary)] transition-colors cursor-pointer"
            title="Share article link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Post Header (PaperMod style) */}
      <header className="mb-6">
        <h1 className="text-[26px] sm:text-[32px] font-bold text-[var(--primary)] leading-[1.25] tracking-tight mb-3">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="text-[16px] sm:text-[18px] text-[var(--secondary)] leading-relaxed mb-3">
            {post.subtitle}
          </p>
        )}

        {/* Post Metadata row */}
        <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-[var(--secondary)] mb-3">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime}</span>
          <span>·</span>
          <span>adeveloper79</span>
          <span>·</span>
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[var(--code-bg)] border border-[var(--border)]">
            {post.status}
          </span>
          {post.gitCommit && (
            <>
              <span>·</span>
              <span className="font-mono text-[11px] flex items-center gap-1">
                <GitCommit className="w-3 h-3" />
                {post.gitCommit}
              </span>
            </>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--border)]">
            {post.tags.map((t) => (
              <span key={t} className="tag-chip">
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Hardware BOM Table (if present) */}
      {post.hardwareBOM && post.hardwareBOM.length > 0 && (
        <section className="my-6 rounded-[var(--radius)] bg-[var(--entry)] border border-[var(--border)] p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
            <Cpu className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">
              Hardware Bill of Materials (BOM)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[var(--secondary)] border-b border-[var(--border)]">
                <tr>
                  <th className="py-1.5 pr-4">Component</th>
                  <th className="py-1.5 pr-4">Specification</th>
                  <th className="py-1.5">Note / Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {post.hardwareBOM.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--code-bg)]/40 transition-colors">
                    <td className="py-2 pr-4 text-[var(--primary)] font-medium">{item.component}</td>
                    <td className="py-2 pr-4 text-[var(--secondary)]">{item.spec}</td>
                    <td className="py-2 text-[var(--secondary)]">{item.note || '—'}</td>
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
      <div className="mt-6">
        <MarkdownView content={cleanContent} />
      </div>

      {/* PaperMod Paginav: Previous / Next Post Navigation */}
      {(prevPost || nextPost) && (
        <nav className="paginav">
          {prevPost ? (
            <button
              onClick={() => {
                onSelectPost?.(prevPost);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="prev group"
              title={prevPost.title}
            >
              <span className="title">« Prev Post</span>
              <span className="post-nav-title group-hover:text-[var(--accent)] truncate transition-colors">
                {prevPost.title}
              </span>
            </button>
          ) : (
            <div className="prev opacity-0 pointer-events-none" />
          )}

          {nextPost ? (
            <button
              onClick={() => {
                onSelectPost?.(nextPost);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="next group"
              title={nextPost.title}
            >
              <span className="title">Next Post »</span>
              <span className="post-nav-title group-hover:text-[var(--accent)] truncate transition-colors">
                {nextPost.title}
              </span>
            </button>
          ) : (
            <div className="next opacity-0 pointer-events-none" />
          )}
        </nav>
      )}

      {/* Floating Back to Top Button */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="top-link"
          title="Back to top"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </article>
  );
};
