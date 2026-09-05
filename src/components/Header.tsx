import React from 'react';
import { Terminal, Sun, Moon, Laptop, Github } from 'lucide-react';
import { ThemeMode } from '../hooks/useTheme';

interface HeaderProps {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  onSetTheme: (theme: ThemeMode) => void;
  readingProgress?: number;
  isReading?: boolean;
  activePostTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  resolvedTheme,
  onSetTheme,
  readingProgress = 0,
  isReading = false,
  activePostTitle,
}) => {
  const cycleTheme = () => {
    if (theme === 'system') onSetTheme('dark');
    else if (theme === 'dark') onSetTheme('light');
    else onSetTheme('system');
  };

  const getThemeLabel = () => {
    if (theme === 'system') {
      return `System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`;
    }
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-canvas)]/90 backdrop-blur-xl border-b border-[var(--border-subtle)] transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <a href="#" className="flex items-center gap-3 group shrink-0">
          <div className="w-8 h-8 rounded-[8px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shadow-xs group-hover:border-[#fe1e34]/50 transition-colors">
            <Terminal className="w-4 h-4 text-[#fe1e34]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-[var(--text-primary)] tracking-tight font-mono">
              TINKERINGS
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-[#fe1e34] px-2 py-0.5 rounded-full bg-[#fe1e34]/10 border border-[#fe1e34]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fe1e34] animate-ping" />
              HARDWARE & RE
            </span>
          </div>
        </a>

        {/* Center Reading Progress Indicator (visible when reading an article) */}
        {isReading && (
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono shadow-xs animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-[#fe1e34] animate-pulse shrink-0" />
            <span className="text-[var(--text-muted)] text-[11px] truncate max-w-[280px]">
              {activePostTitle || 'Reading Article'}
            </span>
            <span className="text-[var(--border-subtle)]">·</span>
            <span className="text-[var(--text-primary)] font-bold text-[11px] min-w-[3.5ch] text-right">
              {readingProgress}%
            </span>
          </div>
        )}

        {/* Center/Right Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Reading Progress pill */}
          {isReading && (
            <div className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-primary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fe1e34]" />
              <span>{readingProgress}%</span>
            </div>
          )}

          {/* GitHub Repository */}
          <a
            href="https://github.com/adeveloper79/ch341a_web"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated-hover)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            title="GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">GitHub</span>
          </a>

          {/* Theme Selector */}
          <button
            id="btn-theme-toggle"
            onClick={cycleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated-hover)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shrink-0 cursor-pointer"
            title={`Current theme: ${getThemeLabel()}. Click to change.`}
          >
            {theme === 'system' ? (
              <Laptop className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            ) : theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="hidden sm:inline text-[11px]">{getThemeLabel()}</span>
          </button>
        </div>
      </div>

      {/* Reading Progress Bar attached directly to header bottom border */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-transparent overflow-hidden pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#fe1e34] via-[#ff4d5e] to-[#00bae2] transition-[width] duration-150 ease-out shadow-[0_0_10px_rgba(254,30,52,0.8)]"
          style={{ width: `${readingProgress}%` }}
        />
      </div>
    </header>
  );
};
