/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TinkeringPost, PostCategory, PostStatus, ViewMode } from './types';
import { loadAllMarkdownPosts } from './utils/postsLoader';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { PostCard } from './components/PostCard';
import { CompactPostRow } from './components/CompactPostRow';
import { PostDetail } from './components/PostDetail';
import { useTheme } from './hooks/useTheme';
import {
  RotateCcw,
  Filter
} from 'lucide-react';
const STORAGE_KEY = 'tinkerings_devlog_posts_v2';

export default function App() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Clear stale legacy mock post caches from previous sessions
  useEffect(() => {
    try {
      localStorage.removeItem('tinkerings_devlog_posts_v1');
    } catch {
      // ignore
    }
  }, []);

  // Load posts dynamically and exclusively from repository Markdown files in /posts/*.md
  const [posts, setPosts] = useState<TinkeringPost[]>(() => {
    return loadAllMarkdownPosts();
  });

  const [selectedPost, setSelectedPost] = useState<TinkeringPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'All'>('All');
  const [activeStatus, setActiveStatus] = useState<PostStatus | 'All'>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [readingProgress, setReadingProgress] = useState(0);

  // Track reading progress from scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrolled = Math.min(100, Math.max(0, Math.round((window.scrollY / scrollHeight) * 100)));
        setReadingProgress(scrolled);
      } else {
        setReadingProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedPost]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // storage quota or incognito
    }
  }, [posts]);

  // Handle URL hash or slug routing for direct linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const found = posts.find((p) => p.slug === hash || p.id === hash);
        if (found) {
          setSelectedPost(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        setSelectedPost(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [posts]);

  const handleSelectPost = (post: TinkeringPost) => {
    window.location.hash = post.slug;
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
    window.history.pushState('', document.title, window.location.pathname + window.location.search);
    setSelectedPost(null);
  };

  const handleResetSamplePosts = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPosts(loadAllMarkdownPosts());
    handleBackToFeed();
  };

  // Filtered posts based on category, status, and tag
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Category filter
      if (activeCategory !== 'All' && post.category !== activeCategory) {
        return false;
      }
      // Status filter
      if (activeStatus !== 'All' && post.status !== activeStatus) {
        return false;
      }
      // Tag filter
      if (selectedTag && !post.tags.includes(selectedTag)) {
        return false;
      }
      return true;
    });
  }, [posts, activeCategory, activeStatus, selectedTag]);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-secondary)] flex flex-col selection:bg-[#fe1e34] selection:text-white transition-colors duration-200">
      {/* Top Fixed Header with Reading Progress Bar */}
      <Header
        theme={theme}
        resolvedTheme={resolvedTheme}
        onSetTheme={setTheme}
        readingProgress={readingProgress}
        isReading={Boolean(selectedPost)}
        activePostTitle={selectedPost?.title}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {selectedPost ? (
          /* Reader View for Selected Blog Article */
          <PostDetail
            post={selectedPost}
            onBack={handleBackToFeed}
          />
        ) : (
          /* Feed View */
          <div className="space-y-8">
            {/* Editorial Lead Section (SVZ / Monopo Saigon Typography) */}
            <div className="space-y-4 pt-2 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#fe1e34]">
                <span className="w-2 h-2 rounded-full bg-[#fe1e34] animate-pulse" />
                <span className="tracking-widest uppercase font-semibold">
                  DEVELOPER LOG & TECHNICAL NOTES
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-[-0.04em] leading-[0.95] uppercase">
                TINKERINGS <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                  & LAB EXPERIMENTS.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-3xl font-sans">
                A personal developer log and engineering notes. Hands-on hardware builds, reverse engineering, graphics, firmware, and software projects.
              </p>
            </div>

            {/* Filter Bar */}
            <FilterBar
              categories={[
                'Reverse Engineering',
                'Hardware',
                'Firmware',
                'Graphics & Shaders',
                'Software',
                'CLI & Tooling',
              ]}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              activeStatus={activeStatus}
              onSelectStatus={setActiveStatus}
              selectedTag={selectedTag}
              onClearTag={() => setSelectedTag(null)}
              viewMode={viewMode}
              onToggleViewMode={setViewMode}
            />

            {/* Article Cards Grid or List */}
            {filteredPosts.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)]">
                  <Filter className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">No tinkerings found</h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto font-mono">
                    No articles match your active filter criteria.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setActiveStatus('All');
                    setSelectedTag(null);
                  }}
                  className="px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] hover:border-[#fe1e34]/50 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'compact' ? (
              <div className="flex flex-col gap-2 max-w-4xl mx-auto">
                {filteredPosts.map((post) => (
                  <CompactPostRow
                    key={post.id}
                    post={post}
                    onSelect={handleSelectPost}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelect={handleSelectPost}
                    onTagClick={(tag) => setSelectedTag(tag)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] py-8 text-xs font-mono text-[var(--text-faint)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#fe1e34]" />
            <span className="text-[var(--text-muted)] font-bold tracking-tight">TINKERINGS LAB</span>
            <span>·</span>
            <span>adeveloper79</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={handleResetSamplePosts}
              className="text-[var(--text-faint)] hover:text-[var(--text-muted)] flex items-center gap-1 transition-colors cursor-pointer"
              title="Reload initial template posts from repository Markdown"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Markdown</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
