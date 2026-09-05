export type PostCategory = 
  | 'Hardware' 
  | 'Firmware' 
  | 'Software' 
  | 'Reverse Engineering' 
  | 'Graphics & Shaders' 
  | 'CLI & Tooling';

export type PostStatus = 'Completed' | 'Working Prototype' | 'Experiment' | 'Shelved';

export interface BOMItem {
  component: string;
  spec: string;
  note?: string;
  link?: string;
}

export interface TinkeringPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  category: PostCategory;
  status: PostStatus;
  tags: string[];
  readTime: string;
  gitCommit: string;
  summary: string;
  content: string;
  hardwareBOM?: BOMItem[];
  interactiveDemoId?: 'macropad-preview' | 'baud-calc' | 'fluid-sim' | 'sdr-waterfall' | null;
  stars?: number;
  featured?: boolean;
}

export type ViewMode = 'cards' | 'compact';
