import { TinkeringPost } from '../types';
import { parseMarkdownWithFrontmatter } from './frontmatter';
import { INITIAL_POSTS } from '../data/initialPosts';

/**
 * Loads all Markdown files located in `/src/posts/*.md` at compile time.
 * In Vite, import.meta.glob with query '?raw' loads raw file contents.
 */
export function loadAllMarkdownPosts(): TinkeringPost[] {
  try {
    const rawFiles = import.meta.glob<string>(
      ['/posts/*.md', '/src/posts/*.md'],
      {
        query: '?raw',
        import: 'default',
        eager: true,
      }
    );

    const postsMap = new Map<string, TinkeringPost>();

    for (const [filepath, rawContent] of Object.entries(rawFiles)) {
      if (typeof rawContent === 'string' && rawContent.trim()) {
        const filename = filepath.split('/').pop() || 'post';
        const post = parseMarkdownWithFrontmatter(rawContent, filename);
        // Deduplicate by slug, prefer root /posts/ if duplicated
        if (!postsMap.has(post.slug) || filepath.startsWith('/posts/')) {
          postsMap.set(post.slug, post);
        }
      }
    }

    const posts = Array.from(postsMap.values());

    if (posts.length > 0) {
      // Sort newest date first, with featured posts prioritized
      posts.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      return posts;
    }
  } catch (err) {
    console.warn('Failed to load markdown posts via glob, using fallback:', err);
  }

  return INITIAL_POSTS;
}

/**
 * Formats a TinkeringPost into standard Markdown with YAML frontmatter.
 * This is what the author saves into `/src/posts/[slug].md` to publish.
 */
export function formatPostToMarkdown(post: TinkeringPost): string {
  const frontmatterLines: string[] = [
    '---',
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `slug: "${post.slug}"`,
    `subtitle: "${post.subtitle.replace(/"/g, '\\"')}"`,
    `date: "${post.date}"`,
    `category: "${post.category}"`,
    `status: "${post.status}"`,
    `tags: [${post.tags.map((t) => `"${t}"`).join(', ')}]`,
    `readTime: "${post.readTime}"`,
    `gitCommit: "${post.gitCommit || 'main'}"`,
    `featured: ${Boolean(post.featured)}`,
    `summary: "${post.summary.replace(/"/g, '\\"')}"`,
  ];

  if (post.interactiveDemoId) {
    frontmatterLines.push(`demo: "${post.interactiveDemoId}"`);
  }

  if (post.hardwareBOM && post.hardwareBOM.length > 0) {
    frontmatterLines.push('hardwareBOM:');
    for (const item of post.hardwareBOM) {
      frontmatterLines.push(`  - component: "${item.component.replace(/"/g, '\\"')}"`);
      frontmatterLines.push(`    spec: "${item.spec.replace(/"/g, '\\"')}"`);
      if (item.note) {
        frontmatterLines.push(`    note: "${item.note.replace(/"/g, '\\"')}"`);
      }
      if (item.link) {
        frontmatterLines.push(`    link: "${item.link.replace(/"/g, '\\"')}"`);
      }
    }
  }

  frontmatterLines.push('---');
  frontmatterLines.push('');
  frontmatterLines.push(post.content);

  return frontmatterLines.join('\n');
}
