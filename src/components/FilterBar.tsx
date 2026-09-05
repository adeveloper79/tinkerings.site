import React from 'react';
import { PostCategory, PostStatus, ViewMode } from '../types';
import { Filter, X, LayoutGrid, List } from 'lucide-react';

interface FilterBarProps {
  categories: PostCategory[];
  activeCategory: PostCategory | 'All';
  onSelectCategory: (cat: PostCategory | 'All') => void;
  activeStatus: PostStatus | 'All';
  onSelectStatus: (status: PostStatus | 'All') => void;
  selectedTag: string | null;
  onClearTag: () => void;
  viewMode?: ViewMode;
  onToggleViewMode?: (mode: ViewMode) => void;
}

const CATEGORIES: (PostCategory | 'All')[] = [
  'All',
  'Reverse Engineering',
  'Hardware',
  'Firmware',
  'Graphics & Shaders',
  'Software',
  'CLI & Tooling',
];

const STATUSES: (PostStatus | 'All')[] = [
  'All',
  'Completed',
  'Working Prototype',
  'Experiment',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  activeCategory,
  onSelectCategory,
  activeStatus,
  onSelectStatus,
  selectedTag,
  onClearTag,
  viewMode = 'cards',
  onToggleViewMode,
}) => {
  return (
    <div className="space-y-3 pb-3">
      {/* Category Pills & View Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs transition-all shrink-0 border cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--primary)] text-[var(--theme)] border-[var(--primary)] font-medium shadow-xs'
                    : 'bg-[var(--code-bg)] border-[var(--border)] text-[var(--secondary)] hover:text-[var(--primary)] hover:border-[var(--accent)]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {onToggleViewMode && (
          <div className="flex items-center gap-1 bg-[var(--code-bg)] p-1 rounded-full border border-[var(--border)] shrink-0">
            <button
              onClick={() => onToggleViewMode('cards')}
              className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[var(--primary)] text-[var(--theme)] shadow-xs'
                  : 'text-[var(--secondary)] hover:text-[var(--primary)]'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleViewMode('compact')}
              className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-[var(--primary)] text-[var(--theme)] shadow-xs'
                  : 'text-[var(--secondary)] hover:text-[var(--primary)]'
              }`}
              title="Compact Log View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Sub-filters: Status and Active Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)] text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[var(--secondary)] mr-1 flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => onSelectStatus(status)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] border transition-colors cursor-pointer ${
                activeStatus === status
                  ? 'bg-[var(--primary)] text-[var(--theme)] border-[var(--primary)] font-medium'
                  : 'bg-[var(--code-bg)] border-[var(--border)] text-[var(--secondary)] hover:text-[var(--primary)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {selectedTag && (
          <div className="flex items-center gap-1.5 text-[11px] bg-[var(--code-bg)] border border-[var(--border)] px-2.5 py-0.5 rounded-full text-[var(--secondary)]">
            <span>Tag: #{selectedTag}</span>
            <button
              onClick={onClearTag}
              className="text-[var(--secondary)] hover:text-[var(--primary)] cursor-pointer"
              title="Clear tag filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
