import React from 'react';
import { Sun, Moon, Github, Terminal } from 'lucide-react';
import { ThemeMode } from '../hooks/useTheme';

interface HeaderProps {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  onSetTheme: (theme: ThemeMode) => void;
  readingProgress?: number;
  isReading?: boolean;
  activePostTitle?: string;
  onNavigateHome?: () => void;
  onOpenAbout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  resolvedTheme,
  onSetTheme,
  readingProgress = 0,
  isReading = false,
  onNavigateHome,
  onOpenAbout,
}) => {
  const toggleTheme = () => {
    onSetTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Top 3px Reading Progress Bar (PaperMod feld.com style) */}
      {isReading && (
        <div
          id="reading-progress"
          style={{ width: `${readingProgress}%` }}
        />
      )}

      <header className="border-b border-[var(--border)] bg-[var(--theme)] transition-colors">
        <nav className="max-w-[880px] mx-auto px-4 h-[60px] flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 font-bold text-xl sm:text-[22px] text-[var(--primary)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              title="Tinkerings Log — adeveloper79"
            >
              <img
                src="https://github.com/adeveloper79.png"
                alt="adeveloper79"
                className="w-7 h-7 rounded-full border border-[var(--border)] object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span>Tinkerings Log</span>
            </button>
          </div>

          {/* Menu Links & Theme Switcher */}
          <div className="flex items-center gap-4 sm:gap-6 text-sm">
            <button
              onClick={onNavigateHome}
              className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              Blog
            </button>

            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                About
              </button>
            )}

            <a
              href="https://unsplash.com/@adeveloper79"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors hidden sm:inline-block"
              title="Unsplash Photography"
            >
              Unsplash
            </a>

            <a
              href="https://github.com/adeveloper79/tinkerings.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors hidden sm:inline-block"
              title="GitHub Repository"
            >
              GitHub
            </a>

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="p-1.5 rounded-full text-[var(--secondary)] hover:text-[var(--primary)] hover:bg-[var(--code-bg)] transition-colors cursor-pointer"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-zinc-700 hover:text-black transition-colors" />
              )}
            </button>
          </div>
        </nav>
      </header>
    </>
  );
};

