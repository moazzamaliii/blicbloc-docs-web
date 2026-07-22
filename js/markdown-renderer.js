/**
 * BlicBloc Markdown Renderer
 * Converts Markdown content into beautiful, safe, interactive HTML
 */

window.BlicBlocMarkdown = (function () {
  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function render(markdown) {
    if (!markdown) return '';

    let lines = markdown.split('\n');
    let html = '';
    let inList = false;
    let listType = null;
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeContent = [];
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];

    function closeList() {
      if (inList) {
        html += listType === 'ol' ? '</ol>\n' : '</ul>\n';
        inList = false;
        listType = null;
      }
    }

    function closeTable() {
      if (inTable) {
        html += '<table><thead><tr>';
        tableHeaders.forEach(h => {
          html += `<th>${parseInline(h)}</th>`;
        });
        html += '</tr></thead><tbody>';
        tableRows.forEach(row => {
          html += '<tr>';
          row.forEach(cell => {
            html += `<td>${parseInline(cell)}</td>`;
          });
          html += '</tr>';
        });
        html += 'tbody></table>\n';
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    }

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Closing code block
          closeList();
          closeTable();
          const codeString = escapeHtml(codeContent.join('\n'));
          html += `<div class="code-block-wrapper">
            <pre><button class="code-copy-btn" onclick="BlicBlocMarkdown.copyCode(this)">Copy</button><code class="language-${codeLanguage}">${codeString}</code></pre>
          </div>\n`;
          inCodeBlock = false;
          codeContent = [];
          codeLanguage = '';
        } else {
          // Opening code block
          closeList();
          closeTable();
          inCodeBlock = true;
          codeLanguage = line.trim().replace(/^```/, '').trim() || 'text';
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Horizontal Rule
      if (/^(\s*[-*_]){3,}\s*$/.test(line)) {
        closeList();
        closeTable();
        html += '<hr />\n';
        continue;
      }

      // Headings (#, ##, ###)
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        closeList();
        closeTable();
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const slug = slugify(text);
        html += `<h${level} id="${slug}">${parseInline(text)} <a href="#${slug}" class="heading-anchor" aria-hidden="true">#</a></h${level}>\n`;
        continue;
      }

      // Blockquotes (>)
      if (line.trim().startsWith('>')) {
        closeList();
        closeTable();
        const quoteText = line.replace(/^\s*>\s?/, '');
        html += `<blockquote>${parseInline(quoteText)}</blockquote>\n`;
        continue;
      }

      // Tables
      if (line.includes('|') && line.trim().startsWith('|')) {
        closeList();
        const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (!inTable) {
          // Check if next line is separator
          if (i + 1 < lines.length && lines[i + 1].includes('---')) {
            inTable = true;
            tableHeaders = cells;
            i++; // skip separator line
            continue;
          }
        } else {
          tableRows.push(cells);
          continue;
        }
      } else if (inTable) {
        closeTable();
      }

      // Unordered lists (- or *)
      const ulMatch = line.match(/^\s*[*|-]\s+(.*)$/);
      if (ulMatch) {
        closeTable();
        if (!inList || listType !== 'ul') {
          closeList();
          html += '<ul>\n';
          inList = true;
          listType = 'ul';
        }
        html += `<li>${parseInline(ulMatch[1])}</li>\n`;
        continue;
      }

      // Ordered lists (1., 2.)
      const olMatch = line.match(/^\s*\d+\.\s+(.*)$/);
      if (olMatch) {
        closeTable();
        if (!inList || listType !== 'ol') {
          closeList();
          html += '<ol>\n';
          inList = true;
          listType = 'ol';
        }
        html += `<li>${parseInline(olMatch[1])}</li>\n`;
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        closeList();
        closeTable();
        continue;
      }

      // Regular Paragraph
      closeList();
      closeTable();
      html += `<p>${parseInline(line)}</p>\n`;
    }

    closeList();
    closeTable();

    return html;
  }

  function parseInline(text) {
    if (!text) return '';
    let result = escapeHtml(text);

    // Bold (**text** or __text__)
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
    result = result.replace(/_(.*?)_/g, '<em>$1</em>');

    // Inline Code (`code`)
    result = result.replace(/`(.*?)`/g, '<code>$1</code>');

    // Links [text](url)
    result = result.replace(/\[(.*?)\]\((.*?)\)/g, (match, title, url) => {
      const isExternal = url.startsWith('http') || url.startsWith('//');
      const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${url}" ${targetAttr}>${title}</a>`;
    });

    return result;
  }

  function estimateReadTime(text) {
    const words = text ? text.split(/\s+/).length : 0;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read (${words} words)`;
  }

  function copyCode(button) {
    const pre = button.nextElementSibling;
    if (pre) {
      navigator.clipboard.writeText(pre.textContent).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = 'rgba(16, 185, 129, 0.4)';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = '';
        }, 2000);
      });
    }
  }

  return {
    render: render,
    estimateReadTime: estimateReadTime,
    copyCode: copyCode
  };
})();
