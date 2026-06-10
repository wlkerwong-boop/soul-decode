'use client';

/**
 * Simple Markdown Renderer
 * Renders markdown content to HTML with the app's styling classes.
 * Supports: headings, bold, italic, code, blockquotes, lists, paragraphs.
 */
export default function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const html = content
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings (must come before other replacements)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-[var(--text-accent)] text-sm font-mono">$1</code>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-t border-[var(--border-color)] my-6" />')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');

  // Wrap consecutive <li> tags in <ul>
  const wrapped = html.replace(/((?:<li>.*?<\/li><br \/>?)+)/g, (match) => {
    const items = match.replace(/<br \/>$/, '').split(/<br \/>/).filter(Boolean);
    return '<ul class="list-disc pl-6 space-y-1">' + items.map((item) => item.replace(/<br \/>$/, '')).join('') + '</ul>';
  });

  return (
    <div
      className="report-content"
      dangerouslySetInnerHTML={{ __html: `<p>${wrapped}</p>` }}
    />
  );
}
