import React from 'react';
import { TinkeringPost } from '../types';
import { GitCommit, ArrowRight, Sparkles } from 'lucide-react';

interface CompactPostRowProps {
  post: TinkeringPost;
  onSelect: (post: TinkeringPost) => void;
}

export const CompactPostRow: React.FC<CompactPostRowProps> = ({ post, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(post)}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-[8px] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] cursor-pointer transition-all font-mono text-xs shadow-xs"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[var(--text-faint)] flex items-center gap-1 shrink-0">
          <GitCommit className="w-3.5 h-3.5" />
          {post.gitCommit}
        </span>
        <span className="text-[var(--text-muted)] shrink-0 text-[11px]">
          {post.date}
        </span>
        <span className="text-[var(--text-primary)] group-hover:text-[var(--color-signal-teal)] dark:group-hover:text-[var(--color-acid-lime)] font-sans font-medium truncate">
          {post.title}
        </span>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {post.interactiveDemoId && (
          <span className="text-emerald-700 dark:text-[var(--color-acid-lime)] flex items-center gap-1 text-[10px] font-medium">
            <Sparkles className="w-2.5 h-2.5" /> Demo
          </span>
        )}
        <span className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-[10px]">
          {post.category}
        </span>
        <span className="px-1.5 py-0.5 rounded border border-[var(--color-pulse-green)]/30 text-[var(--color-pulse-green)] bg-[var(--color-pulse-green)]/10 text-[10px]">
          {post.status}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-faint)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-transform ml-1" />
      </div>
    </div>
  );
};
