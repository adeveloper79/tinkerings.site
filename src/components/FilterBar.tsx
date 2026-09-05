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

const CATEGORY_COLORS: Record<string, { active: string; dot: string }> = {
  All: { active: 'border-white/30 bg-white/10 text-white', dot: 'bg-white' },
  'Reverse Engineering': { active: 'border-[#fe1e34]/50 bg-[#fe1e34]/15 text-[#fe1e34]', dot: 'bg-[#fe1e34]' },
  Hardware: { active: 'border-[#0ae448]/50 bg-[#0ae448]/15 text-[#0ae448]', dot: 'bg-[#0ae448]' },
  Firmware: { active: 'border-[#00bae2]/50 bg-[#00bae2]/15 text-[#00bae2]', dot: 'bg-[#00bae2]' },
  'Graphics & Shaders': { active: 'border-[#9d95ff]/50 bg-[#9d95ff]/15 text-[#9d95ff]', dot: 'bg-[#9d95ff]' },
  Software: { active: 'border-[#fec5fb]/50 bg-[#fec5fb]/15 text-[#fec5fb]', dot: 'bg-[#fec5fb]' },
  'CLI & Tooling': { active: 'border-[#e4f222]/50 bg-[#e4f222]/15 text-[#e4f222]', dot: 'bg-[#e4f222]' },
};

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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
          {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat;
          const colorMeta = CATEGORY_COLORS[cat] || { active: 'border-white/20 bg-white/10 text-white', dot: 'bg-white' };
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 border cursor-pointer ${
                isSelected
                  ? `${colorMeta.active} font-semibold shadow-xs`
                  : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              {cat !== 'All' && (
                <span className={`w-1.5 h-1.5 rounded-full ${colorMeta.dot}`} />
              )}
              <span>{cat}</span>
            </button>
          );
        })}
        </div>

        {onToggleViewMode && (
          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] p-1 rounded-full border border-[var(--border-subtle)] shrink-0">
            <button
              onClick={() => onToggleViewMode('cards')}
              className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-black/60 text-white shadow-xs border border-white/10'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleViewMode('compact')}
              className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-black/60 text-white shadow-xs border border-white/10'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
              title="Compact Log View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Sub-filters: Status and Active Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-faint)] mr-1 flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => onSelectStatus(status)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] border transition-colors cursor-pointer ${
                activeStatus === status
                  ? 'bg-white/10 border-white/30 text-[var(--text-primary)] font-medium'
                  : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {selectedTag && (
          <div className="flex items-center gap-1.5 text-[11px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full text-[var(--text-secondary)]">
            <span>Tag: #{selectedTag}</span>
            <button onClick={onClearTag} className="text-[var(--text-muted)] hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
