// Minimal markdown to HTML converter for headings, bold, italics, code, lists, and links.
export function renderMarkdown(md: string): string {
  if (!md) return "";
  let html = md;
  // Escape basic HTML
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // code blocks ```
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre class="md-code"><code>${code.trim()}</code></pre>`);
  // inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline">$1</code>');
  // headings
  html = html.replace(/^######\s*(.*)$/gm, '<h6>$1</h6>')
             .replace(/^#####\s*(.*)$/gm, '<h5>$1</h5>')
             .replace(/^####\s*(.*)$/gm, '<h4>$1</h4>')
             .replace(/^###\s*(.*)$/gm, '<h3>$1</h3>')
             .replace(/^##\s*(.*)$/gm, '<h2>$1</h2>')
             .replace(/^#\s*(.*)$/gm, '<h1>$1</h1>');
  // bold/italics
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // unordered list
  html = html.replace(/^(?:-\s+.+\n?)+/gm, (block) => {
    const items = block.trim().split(/\n/).map((line) => line.replace(/^-\s+/, ''));
    return `<ul>` + items.map((i) => `<li>${i}</li>`).join('') + `</ul>`;
  });
  // paragraphs
  html = html.replace(/^(?!<h\d|<ul|<pre|<p|<blockquote|<code|<li)([^\n]+)$/gm, '<p>$1</p>');
  return html;
}


