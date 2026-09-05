import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, ExternalLink, ZoomIn, X, ImageIcon, AlertCircle } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

/**
 * Resolves local media paths against Vite's BASE_URL so that assets in media/
 * load seamlessly both locally and on GitHub Pages (e.g. /repository-name/media/...).
 */
export function resolveMediaUrl(src?: string): string {
  if (!src) return '';
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src;
  }

  // Strip leading relative dots or slash
  let cleanPath = src.replace(/^(\.\/|\/)/, '');
  if (!cleanPath.startsWith('assets/') && !cleanPath.startsWith('media/')) {
    cleanPath = `media/${cleanPath}`;
  }
  const base = import.meta.env.BASE_URL || './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  return `${normalizedBase}${cleanPath}`;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt?: string } | null>(null);

  return (
    <div
      className="prose max-w-none text-[var(--text-secondary)] space-y-6"
      style={{ fontSize: 'var(--reading-font-size, 1.125rem)' }}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return (
              <h1 id={id} className="text-3xl sm:text-4xl md:text-[2.65rem] font-extrabold text-[var(--text-primary)] tracking-[-0.025em] leading-[1.2] mt-10 first:mt-0 mb-6 pt-4 first:pt-0 border-t first:border-t-0 border-[var(--border-subtle)] flex items-center group">
                <span>{children}</span>
                <a href={`#${id}`} className="ml-3 opacity-0 group-hover:opacity-40 text-sm font-mono transition-opacity">#</a>
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return (
              <h2 id={id} className="text-2xl sm:text-[1.85rem] font-bold text-[var(--text-primary)] tracking-[-0.015em] leading-[1.3] mt-14 mb-5 pt-8 border-t border-[var(--border-subtle)] flex items-center group">
                <span>{children}</span>
                <a href={`#${id}`} className="ml-3 opacity-0 group-hover:opacity-40 text-sm font-mono transition-opacity">#</a>
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return (
              <h3 id={id} className="text-xl sm:text-[1.35rem] font-semibold text-[var(--text-primary)] tracking-[-0.01em] leading-[1.4] mt-9 mb-3.5 flex items-center group">
                <span>{children}</span>
                <a href={`#${id}`} className="ml-2.5 opacity-0 group-hover:opacity-40 text-xs font-mono transition-opacity">#</a>
              </h3>
            );
          },
          h4: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return (
              <h4 id={id} className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] tracking-tight mt-7 mb-2.5 flex items-center group">
                <span>{children}</span>
                <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-40 text-xs font-mono transition-opacity">#</a>
              </h4>
            );
          },
          p: ({ children }) => (
            <p className="text-[var(--text-secondary)] leading-[1.82] mb-6 font-normal tracking-[0.005em]">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-3 text-[var(--text-secondary)] my-6 leading-[1.78]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-3 text-[var(--text-secondary)] my-6 leading-[1.78]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[var(--text-secondary)] leading-[1.78]">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="text-[var(--text-primary)] font-semibold">
              {children}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[var(--accent)] pl-5 py-3 my-6 bg-[var(--entry)] rounded-r-lg text-[var(--secondary)] font-normal italic leading-[1.75]">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--entry)]">
              <table className="w-full text-left text-xs font-mono border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--code-bg)] text-[var(--primary)] border-b border-[var(--border)]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[var(--border)] text-[var(--secondary)]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[var(--code-bg)]/50 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="py-2.5 px-4 font-semibold text-[var(--primary)] uppercase text-[11px] tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-2 px-4 text-[var(--secondary)]">
              {children}
            </td>
          ),
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-0.5 text-[var(--accent)] hover:underline font-medium transition-colors"
              >
                <span>{children}</span>
                {isExternal && <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />}
              </a>
            );
          },
          hr: () => (
            <hr className="my-8 border-[var(--border)]" />
          ),
          img: ({ src, alt }) => {
            const resolvedSrc = resolveMediaUrl(src);
            return (
              <figure className="my-5 flex flex-col items-center group">
                <div
                  onClick={() => resolvedSrc && setLightboxImage({ src: resolvedSrc, alt })}
                  className="relative cursor-pointer overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--entry)] hover:border-[var(--accent)] transition-colors duration-200 max-w-sm sm:max-w-md w-full"
                >
                  <img
                    src={resolvedSrc}
                    alt={alt || 'Post image'}
                    className="w-full h-auto max-h-[220px] sm:max-h-[250px] object-contain mx-auto p-1.5"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div
                    className="hidden flex-col items-center justify-center p-6 text-center text-[var(--secondary)] space-y-2 bg-[var(--code-bg)]"
                    style={{ minHeight: '120px' }}
                  >
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                    <span className="text-xs font-mono font-medium text-[var(--primary)]">
                      Media not found: {src}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-white/15 text-zinc-300 group-hover:text-white text-[10px] font-mono flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shadow-xs">
                    <ZoomIn className="w-3 h-3 text-[var(--accent)]" />
                    <span>Expand</span>
                  </div>
                </div>
                {alt && (
                  <figcaption className="mt-2 text-center text-xs font-mono text-[var(--secondary)] flex items-center justify-center gap-1.5 max-w-md">
                    <ImageIcon className="w-3.5 h-3.5 text-[var(--secondary)] shrink-0" />
                    <span>{alt}</span>
                  </figcaption>
                )}
              </figure>
            );
          },
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className);
            if (!isBlock) {
              return (
                <code
                  className="font-mono text-[14px] bg-[var(--code-bg)] text-[var(--code-text)] px-1.5 py-0.5 rounded border border-[var(--border)] font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{String(children)}</CodeBlock>;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Lightbox Modal for Fullscreen Image View */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close image preview"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt || 'Expanded media preview'}
              className="max-w-full max-h-[80vh] object-contain rounded-lg border border-white/20 shadow-2xl"
            />
            {lightboxImage.alt && (
              <p className="mt-3 text-xs font-mono text-zinc-400 text-center">
                {lightboxImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface CodeBlockProps {
  className?: string;
  children: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children }) => {
  const [copied, setCopied] = useState(false);
  const langMatch = /language-(\w+)/.exec(className || '');
  const lang = langMatch ? langMatch[1] : 'text';

  const handleCopy = () => {
    navigator.clipboard.writeText(children.replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-[var(--radius)] border border-[#333333] bg-[#18181b] overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-[#222226] border-b border-[#303036] text-[11px] font-mono text-zinc-300">
        <span className="uppercase tracking-wider text-zinc-300 font-semibold">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer"
          title="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 font-mono text-xs sm:text-[13.5px] overflow-x-auto leading-[1.65] text-[#f1f5f9] bg-[#18181b]">
        <code>{children}</code>
      </pre>
    </div>
  );
};
