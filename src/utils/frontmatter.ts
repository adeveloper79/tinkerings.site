import { TinkeringPost, PostCategory, PostStatus, BOMItem } from '../types';

/**
 * Parses frontmatter from a raw Markdown string.
 * Supports standard YAML frontmatter delimited by --- at the start of the file.
 */
export function parseMarkdownWithFrontmatter(rawContent: string, fallbackSlug: string): TinkeringPost {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = rawContent.match(frontmatterRegex);

  let meta: Record<string, any> = {};
  let body = rawContent;

  if (match) {
    const yamlString = match[1];
    body = match[2];
    meta = parseSimpleYaml(yamlString);
  }

  let title = meta.title;
  let subtitle = meta.subtitle || '';

  // Detect title from first # Heading if frontmatter title is not present
  if (!title) {
    const headingMatch = body.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      title = headingMatch[1].trim();
    } else {
      title = fallbackSlug
        .replace(/\.md$/, '')
        .replace(/^[0-9_-]+/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  // Detect subtitle from initial blockquote if missing
  if (!subtitle) {
    const quoteMatch = body.match(/^>\s+[*"_]*(.*?)[*"_]*$/m);
    if (quoteMatch && quoteMatch[1].trim()) {
      subtitle = quoteMatch[1].trim();
    }
  }

  const slug = meta.slug || fallbackSlug.replace(/\.md$/, '').replace(/^[0-9]{4}-[0-9]{2}-[0-9]{2}-/, '');
  const id = meta.id || `post-${slug}`;
  const date = meta.date || '2026-09-04';
  const category: PostCategory = validateCategory(meta.category, body, fallbackSlug);
  const status: PostStatus = validateStatus(meta.status);
  const tags: string[] = parseTags(meta.tags, body);
  const readTime = meta.readTime || meta.read_time || calculateReadTime(body);
  const gitCommit = meta.gitCommit || meta.git_commit || (body.includes('eya-board') || body.includes('RTD2660') ? 'eya-board' : 'main');
  const summary = meta.summary || extractFirstParagraph(body) || 'No summary available.';
  const featured = false;
  const interactiveDemoId = meta.interactiveDemoId || meta.demo || null;
  const hardwareBOM = parseBOM(meta.hardwareBOM || meta.bom);

  return {
    id,
    slug,
    title,
    subtitle,
    date,
    category,
    status,
    tags,
    readTime,
    gitCommit,
    summary,
    content: body.trim(),
    featured,
    interactiveDemoId,
    hardwareBOM: hardwareBOM.length > 0 ? hardwareBOM : undefined,
  };
}

function parseSimpleYaml(yaml: string): Record<string, any> {
  const lines = yaml.split(/\r?\n/);
  const result: Record<string, any> = {};
  let currentKey: string | null = null;
  let inList = false;
  let listItems: any[] = [];
  let currentObject: Record<string, any> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    // List item check (- item or - key: value)
    if (line.match(/^\s*-\s+/)) {
      if (!currentKey) continue;

      const content = trimmed.replace(/^-\s+/, '');
      if (content.includes(':')) {
        // Object in list
        const [objKey, ...objValParts] = content.split(':');
        currentObject = {
          [objKey.trim()]: cleanYamlValue(objValParts.join(':')),
        };
        listItems.push(currentObject);
      } else {
        // Simple scalar in list
        listItems.push(cleanYamlValue(content));
      }
      inList = true;
      continue;
    }

    // Sub-property of an object in a list
    if (inList && currentObject && line.match(/^\s{4,}\w+:/)) {
      const [objKey, ...objValParts] = trimmed.split(':');
      currentObject[objKey.trim()] = cleanYamlValue(objValParts.join(':'));
      continue;
    }

    // Standard key-value
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      if (inList && currentKey) {
        result[currentKey] = listItems;
        inList = false;
        listItems = [];
        currentObject = null;
      }

      const key = line.substring(0, colonIndex).trim();
      const rawValue = line.substring(colonIndex + 1).trim();

      if (rawValue === '') {
        // Could be the start of a list or block
        currentKey = key;
        inList = true;
        listItems = [];
        currentObject = null;
      } else {
        currentKey = key;
        result[key] = cleanYamlValue(rawValue);
      }
    }
  }

  if (inList && currentKey) {
    result[currentKey] = listItems;
  }

  return result;
}

function cleanYamlValue(val: string): any {
  let cleaned = val.trim();

  // Strip enclosing quotes
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }

  // Handle inline array [a, b, c]
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    const inner = cleaned.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((item) => {
      const t = item.trim();
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        return t.slice(1, -1);
      }
      return t;
    });
  }

  // Booleans
  if (cleaned.toLowerCase() === 'true') return true;
  if (cleaned.toLowerCase() === 'false') return false;

  return cleaned;
}

function parseTags(tagsValue: any, body?: string): string[] {
  if (Array.isArray(tagsValue)) {
    return tagsValue.map(String);
  }
  if (typeof tagsValue === 'string') {
    return tagsValue
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  const tags: string[] = [];
  if (body) {
    if (body.includes('ST7701')) tags.push('ST7701S');
    if (body.includes('RTD2660')) tags.push('RTD2660H');
    if (body.includes('8051')) tags.push('8051');
    if (/reverse engineering/i.test(body)) tags.push('Reverse Engineering');
    if (/hardware/i.test(body)) tags.push('Hardware');
    if (/DDC|I2C/i.test(body)) tags.push('I2C / DDC');
    if (/SPI/i.test(body)) tags.push('9-bit SPI');
  }
  return tags;
}

function parseBOM(bomValue: any): BOMItem[] {
  if (!Array.isArray(bomValue)) return [];
  return bomValue
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      component: String(item.component || item.name || 'Component'),
      spec: String(item.spec || item.description || ''),
      note: item.note ? String(item.note) : undefined,
      link: item.link ? String(item.link) : undefined,
    }));
}

function validateCategory(cat: any, content?: string, slug?: string): PostCategory {
  const valid: PostCategory[] = [
    'Hardware',
    'Firmware',
    'Software',
    'Reverse Engineering',
    'Graphics & Shaders',
    'CLI & Tooling',
  ];
  if (valid.includes(cat)) return cat;
  if ((content && /reverse engineering/i.test(content)) || (slug && /reverse_engineering/i.test(slug))) {
    return 'Reverse Engineering';
  }
  if (content && (/RTD2660|ST7701|FPGA|PCB|soldering/i.test(content))) {
    return 'Hardware';
  }
  return 'Hardware';
}

function validateStatus(status: any): PostStatus {
  const valid: PostStatus[] = ['Completed', 'Working Prototype', 'Experiment', 'Shelved'];
  if (valid.includes(status)) return status;
  if (status === 'Shipped') return 'Completed';
  return 'Completed';
}

function calculateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function extractFirstParagraph(content: string): string {
  const lines = content.split(/\r?\n/).filter((l) => {
    const t = l.trim();
    return (
      t &&
      !t.startsWith('#') &&
      !t.startsWith('>') &&
      !t.startsWith('---') &&
      !t.startsWith('![') &&
      !t.startsWith('*') &&
      !t.startsWith('|')
    );
  });
  return lines[0]?.slice(0, 240) || '';
}

