import React from 'react';
import { TinkeringPost } from '../types';
import { GitCommit, Clock, ArrowRight, Sparkles, Box, Calendar } from 'lucide-react';

interface PostCardProps {
  post: TinkeringPost;
  onSelect: (post: TinkeringPost) => void;
  onTagClick?: (tag: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onSelect, onTagClick }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Shipped':
        return 'text-[var(--color-pulse-green)] bg-[var(--color-pulse-green)]/10 border-[var(--color-pulse-green)]/30';
      case 'Working Prototype':
        return 'text-[var(--color-signal-teal)] bg-[var(--color-signal-teal)]/10 border-[var(--color-signal-teal)]/30';
      case 'Experiment':
        return 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40';
      default:
        return 'text-[var(--text-muted)] bg-[var(--bg-elevated)] border-[var(--border-subtle)]';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Shipped':
        return 'bg-[var(--color-pulse-green)]';
      case 'Working Prototype':
        return 'bg-[var(--color-signal-teal)]';
      case 'Experiment':
        return 'bg-purple-600 dark:bg-purple-400';
      default:
        return 'bg-[var(--text-muted)]';
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Reverse Engineering':
        return 'text-[#fe1e34] bg-[#fe1e34]/10 border-[#fe1e34]/30';
      case 'Hardware':
        return 'text-[#0ae448] bg-[#0ae448]/10 border-[#0ae448]/30';
      case 'Firmware':
        return 'text-[#00bae2] bg-[#00bae2]/10 border-[#00bae2]/30';
      case 'Graphics & Shaders':
        return 'text-[#9d95ff] bg-[#9d95ff]/10 border-[#9d95ff]/30';
      case 'Software':
        return 'text-[#fec5fb] bg-[#fec5fb]/10 border-[#fec5fb]/30';
      case 'CLI & Tooling':
        return 'text-[#e4f222] bg-[#e4f222]/10 border-[#e4f222]/30';
      default:
        return 'text-[var(--text-primary)] bg-[var(--bg-elevated)] border-[var(--border-subtle)]';
    }
  };

  return (
    <article
      id={`tinkering-card-${post.id}`}
      onClick={() => onSelect(post)}
      className="group cursor-pointer rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#fe1e34]/50 hover:bg-[var(--bg-card-hover)] p-6 sm:p-7 md:p-8 transition-all duration-300 relative flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-0.5 w-full overflow-hidden"
    >
      <div className="space-y-3.5">
        {/* Top Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-1">
          <div className="flex items-center gap-2">
            <span className={`font-semibold tracking-tight px-3 py-1 rounded-full border text-[11px] ${getCategoryBadgeClass(post.category)}`}>
              {post.category}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${getStatusStyle(post.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(post.status)} animate-pulse`} />
              {post.status}
            </span>
          </div>

          <div className="flex items-center gap-3.5 text-[var(--text-muted)] text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-faint)]" />
              {post.date}
            </span>
            <span className="text-[var(--border-subtle)]">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--text-faint)]" />
              {post.readTime}
            </span>
            {post.gitCommit && (
              <>
                <span className="text-[var(--border-subtle)] hidden sm:inline">·</span>
                <span className="items-center gap-1 text-[11px] text-[var(--text-faint)] hidden sm:inline-flex">
                  <GitCommit className="w-3 h-3" />
                  {post.gitCommit}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-[1.65rem] font-bold text-[var(--text-primary)] group-hover:text-[#fe1e34] dark:group-hover:text-[#ff4d5e] transition-colors tracking-tight leading-snug pt-1">
          {post.title}
        </h2>

        {/* Subtitle / Lead Hook */}
        {post.subtitle && (
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium leading-relaxed">
            {post.subtitle}
          </p>
        )}

        {/* Summary Excerpt */}
        <p className="text-sm sm:text-[15px] text-[var(--text-muted)] leading-relaxed line-clamp-3">
          {post.summary}
        </p>

        {/* Informational Teaser / Specs Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
          {post.hardwareBOM && post.hardwareBOM.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px]">
              <Box className="w-3.5 h-3.5 text-[#00bae2] shrink-0" />
              <span>
                Verified BOM: {post.hardwareBOM.slice(0, 2).map((b) => b.component).join(', ')}
                {post.hardwareBOM.length > 2 && ` +${post.hardwareBOM.length - 2} more`}
              </span>
            </div>
          )}

          {post.interactiveDemoId && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0ae448]/10 border border-[#0ae448]/30 text-[#0ae448] font-medium text-[11px]">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Live Simulation Widget</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Tags & Call to Action */}
      <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {post.tags.map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated-hover)] text-[var(--text-muted)] hover:text-white border border-[var(--border-subtle)] transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Read Full Article Button */}
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-semibold text-[var(--text-primary)] group-hover:text-[#fe1e34] dark:group-hover:text-[#ff4d5e] transition-colors">
          <span>Read Article</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>
    </article>
  );
};
