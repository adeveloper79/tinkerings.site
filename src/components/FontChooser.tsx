import React, { useState, useRef, useEffect } from 'react';
import { Type, Check } from 'lucide-react';
import { READING_FONTS, ReadingFont } from '../hooks/useReadingFont';

interface FontChooserProps {
  currentFontId: string;
  onSelectFont: (fontId: string) => void;
  compact?: boolean;
}

export const FontChooser: React.FC<FontChooserProps> = ({
  currentFontId,
  onSelectFont,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeFont = READING_FONTS.find((f) => f.id === currentFontId) || READING_FONTS[READING_FONTS.length - 1];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--code-bg)] border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--primary)] transition-colors cursor-pointer text-xs ${
          isOpen ? 'border-[var(--accent)] text-[var(--primary)]' : ''
        }`}
        title="Choose reading font"
        aria-label="Choose reading font"
      >
        <Type className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span className="font-medium text-[11px] truncate max-w-[90px] sm:max-w-[120px]">
          {compact ? activeFont.name : `Font: ${activeFont.name}`}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 rounded-[var(--radius)] bg-[var(--entry)] border border-[var(--border)] shadow-xl z-50 p-1 space-y-0.5 animate-fadeIn">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--secondary)] border-b border-[var(--border)] mb-1">
            Reading Font
          </div>

          {READING_FONTS.map((font) => {
            const isSelected = font.id === currentFontId;
            return (
              <button
                key={font.id}
                onClick={() => {
                  onSelectFont(font.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-[var(--code-bg)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--primary)] hover:bg-[var(--code-bg)]'
                }`}
                style={{ fontFamily: font.family }}
              >
                <div className="flex flex-col">
                  <span className="text-[13px] leading-tight">{font.name}</span>
                  <span className="text-[10px] opacity-60 font-sans">{font.category}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
