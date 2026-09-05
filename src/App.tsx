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
  Filter,
  Github,
  Mail,
  Camera,
  X
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
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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
      if (hash === 'about') {
        setIsAboutOpen(true);
        setSelectedPost(null);
      } else if (hash) {
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
    setIsAboutOpen(false);
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
    <div className="min-h-screen bg-[var(--theme)] text-[var(--content)] flex flex-col selection:bg-[var(--accent)] selection:text-white transition-colors duration-200">
      {/* Top Fixed Header with Reading Progress Bar */}
      <Header
        theme={theme}
        resolvedTheme={resolvedTheme}
        onSetTheme={setTheme}
        readingProgress={readingProgress}
        isReading={Boolean(selectedPost)}
        activePostTitle={selectedPost?.title}
        onNavigateHome={handleBackToFeed}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Content Area (PaperMod single-column layout) */}
      <main className="flex-1 max-w-[880px] w-full mx-auto px-4 py-6 sm:py-8">
        {selectedPost ? (
          /* Reader View for Selected Blog Article */
          <PostDetail
            post={selectedPost}
            allPosts={posts}
            onBack={handleBackToFeed}
            onSelectPost={handleSelectPost}
          />
        ) : (
          /* Feed View */
          <div className="space-y-6">
            {/* PaperMod Home Profile Hero */}
            <div className="home-info flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src="https://github.com/adeveloper79.png"
                alt="adeveloper79"
                className="home-avatar"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h1 className="text-[22px] sm:text-[24px] font-bold text-[var(--primary)] leading-tight">
                    adeveloper79
                  </h1>
                  <div className="flex items-center gap-3 text-[var(--secondary)]">
                    <a
                      href="https://github.com/adeveloper79"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--accent)] transition-colors"
                      title="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <a
                      href="https://unsplash.com/@adeveloper79"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--accent)] transition-colors"
                      title="Unsplash Photography (@adeveloper79)"
                    >
                      <Camera className="w-4 h-4" />
                    </a>
                    <a
                      href="mailto:adeveloper79@users.noreply.github.com"
                      className="hover:text-[var(--accent)] transition-colors"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <p className="text-[14px] sm:text-[15px] text-[var(--secondary)] leading-[1.6]">
                  Hardware experiments, reverse engineering notes, and low-level engineering logs. Documenting hands-on work with display controllers, SPI flash, microcontrollers, and embedded Linux.
                </p>
              </div>
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
              <div className="py-16 text-center rounded-[var(--radius)] bg-[var(--entry)] border border-[var(--border)] space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-[var(--code-bg)] flex items-center justify-center text-[var(--secondary)]">
                  <Filter className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[var(--primary)]">No posts found</h3>
                  <p className="text-xs text-[var(--secondary)] max-w-sm mx-auto">
                    No articles match your active filter criteria.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setActiveStatus('All');
                    setSelectedTag(null);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[var(--code-bg)] border border-[var(--border)] text-xs text-[var(--primary)] hover:border-[var(--accent)] cursor-pointer transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'compact' ? (
              <div className="flex flex-col gap-2">
                {filteredPosts.map((post) => (
                  <CompactPostRow
                    key={post.id}
                    post={post}
                    onSelect={handleSelectPost}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col">
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

      {/* About Modal Dialog */}
      {isAboutOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsAboutOpen(false)}
        >
          <div
            className="max-w-md w-full rounded-[var(--radius)] bg-[var(--entry)] border border-[var(--border)] p-6 shadow-xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-4 right-4 p-1 text-[var(--secondary)] hover:text-[var(--primary)] cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src="https://github.com/adeveloper79.png"
                alt="adeveloper79"
                className="w-14 h-14 rounded-full border border-[var(--border)] object-cover"
              />
              <div>
                <h2 className="text-lg font-bold text-[var(--primary)]">adeveloper79</h2>
                <p className="text-xs text-[var(--secondary)]">Hardware & Firmware Hacker</p>
              </div>
            </div>

            <div className="text-sm text-[var(--secondary)] leading-relaxed">
              <p>
                Welcome to my personal developer log. Here I document deep-dive hardware hacking, reverse engineering proprietary display drivers, custom firmware writing, and low-level Linux experiments.
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--secondary)]">
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/adeveloper79"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[var(--accent)] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://unsplash.com/@adeveloper79"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[var(--accent)] transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Unsplash</span>
                </a>
              </div>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="px-3 py-1 rounded bg-[var(--primary)] text-[var(--theme)] font-medium cursor-pointer hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer (PaperMod feld.com style) */}
      <footer className="mt-auto border-t border-[var(--border)] bg-[var(--theme)] py-8 text-xs text-[var(--secondary)] transition-colors">
        <div className="max-w-[880px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span>© {new Date().getFullYear()} </span>
            <a href="https://github.com/adeveloper79" className="hover:text-[var(--accent)] font-medium">adeveloper79</a>
            <span> · Powered by </span>
            <a href="https://github.com/adeveloper79/tinkerings.site" className="hover:text-[var(--accent)] font-medium">Tinkerings Log</a>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleResetSamplePosts}
              className="text-[var(--secondary)] hover:text-[var(--primary)] flex items-center gap-1 transition-colors cursor-pointer"
              title="Reload initial template posts from repository Markdown"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Markdown</span>
            </button>
            <a
              href="https://unsplash.com/@adeveloper79"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent)] flex items-center gap-1"
              title="Unsplash Photography"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Unsplash</span>
            </a>
            <a
              href="https://github.com/adeveloper79/tinkerings.site"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent)] flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
