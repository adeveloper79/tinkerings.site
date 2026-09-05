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
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-[var(--radius)] bg-[var(--entry)] border border-[var(--border)] hover:border-[var(--accent)] cursor-pointer transition-all text-xs"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[var(--secondary)] flex items-center gap-1 shrink-0 font-mono text-[11px]">
          <GitCommit className="w-3.5 h-3.5" />
          {post.gitCommit}
        </span>
        <span className="text-[var(--secondary)] shrink-0 text-[11px]">
          {post.date}
        </span>
        <span className="text-[var(--primary)] group-hover:text-[var(--accent)] font-medium truncate">
          {post.title}
        </span>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {post.interactiveDemoId && (
          <span className="text-[var(--accent)] flex items-center gap-1 text-[10px] font-medium">
            <Sparkles className="w-2.5 h-2.5" /> Demo
          </span>
        )}
        <span className="tag-chip text-[10px]">
          {post.category}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--code-bg)] text-[var(--secondary)] border border-[var(--border)]">
          {post.status}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-[var(--secondary)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-transform ml-1" />
      </div>
    </div>
  );
};

