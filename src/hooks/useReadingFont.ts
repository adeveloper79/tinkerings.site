import { useState, useEffect } from 'react';

export interface ReadingFont {
  id: string;
  name: string;
  category: string;
  family: string;
}

export const READING_FONTS: ReadingFont[] = [
  {
    id: 'inter',
    name: 'Inter',
    category: 'Clean Sans',
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    category: 'Book Serif',
    family: "'Merriweather', Georgia, Cambria, serif",
  },
  {
    id: 'atkinson',
    name: 'Atkinson Hyperlegible',
    category: 'High Legibility',
    family: "'Atkinson Hyperlegible', -apple-system, sans-serif",
  },
  {
    id: 'literata',
    name: 'Literata',
    category: 'E-Reader Serif',
    family: "'Literata', Georgia, 'Times New Roman', serif",
  },
  {
    id: 'jetbrains',
    name: 'JetBrains Mono',
    category: 'Developer Mono',
    family: "'JetBrains Mono', ui-monospace, Menlo, monospace",
  },
  {
    id: 'default',
    name: 'Default',
    category: 'System UI',
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
];

const STORAGE_KEY = 'tinkerings_reading_font';

export function useReadingFont() {
  const [currentFontId, setCurrentFontId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && READING_FONTS.some((f) => f.id === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'default';
  });

  useEffect(() => {
    const font = READING_FONTS.find((f) => f.id === currentFontId) || READING_FONTS[READING_FONTS.length - 1];
    document.documentElement.style.setProperty('--font-reading', font.family);
    try {
      localStorage.setItem(STORAGE_KEY, currentFontId);
    } catch {
      // ignore
    }
  }, [currentFontId]);

  const setFont = (id: string) => {
    if (READING_FONTS.some((f) => f.id === id)) {
      setCurrentFontId(id);
    }
  };

  const currentFont = READING_FONTS.find((f) => f.id === currentFontId) || READING_FONTS[READING_FONTS.length - 1];

  return {
    currentFont,
    currentFontId,
    setFont,
    fonts: READING_FONTS,
  };
}
