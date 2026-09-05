import React from 'react';
import { TinkeringPost } from '../types';

interface PostCardProps {
  post: TinkeringPost;
  onSelect: (post: TinkeringPost) => void;
  onTagClick?: (tag: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onSelect, onTagClick }) => {
  return (
    <article
      onClick={() => onSelect(post)}
      className="post-entry group cursor-pointer"
    >
      <header className="mb-2">
        <h2 className="text-[20px] sm:text-[22px] font-bold text-[var(--primary)] leading-[1.3] group-hover:text-[var(--accent)] transition-colors">
          {post.title}
        </h2>
      </header>

      <div className="mb-3">
        <p className="text-[14px] sm:text-[15px] text-[var(--secondary)] leading-[1.6] line-clamp-3">
          {post.summary}
        </p>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="tag-chip cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <footer className="flex items-center justify-between text-[13px] text-[var(--secondary)] pt-1">
        <div className="flex items-center gap-1.5">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime}</span>
          <span>·</span>
          <span>adeveloper79</span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--code-bg)] text-[var(--secondary)] border border-[var(--border)]">
          {post.status}
        </span>
      </footer>
    </article>
  );
};
