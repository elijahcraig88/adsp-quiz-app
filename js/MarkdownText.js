// ADsP Master App - Universal Lightweight React Markdown Renderer
// Safely parses bold (**text**), inline code (`code`), headers (###), lists (- item, 1. item), blockquotes (> text)
// 100% Zero-dependency, Offline PWA compatible, Virtual DOM based (No dangerouslySetInnerHTML)

function MarkdownText({ content, className = '' }) {
  if (!content) return null;
  if (typeof content !== 'string') return React.createElement('span', { className }, String(content));

  // Parse inline elements (bold, code)
  const parseInline = (text, keyPrefix = 'inline') => {
    if (!text) return null;
    const regex = /(\*\*[^\n]+?\*\*|`[^`\n]+?`)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (!part) return null;
      const key = `${keyPrefix}-${idx}`;

      // Bold: **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return React.createElement(
          'strong',
          {
            key,
            className: 'font-extrabold text-slate-900 dark:text-slate-50 bg-amber-500/15 dark:bg-amber-400/20 px-1 py-0.5 rounded text-inherit'
          },
          part.slice(2, -2)
        );
      }

      // Inline Code: `code`
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return React.createElement(
          'code',
          {
            key,
            className: 'font-mono text-[11px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/70 px-1.5 py-0.5 rounded-md shadow-xs mx-0.5'
          },
          part.slice(1, -1)
        );
      }

      return React.createElement('span', { key }, part);
    });
  };

  // If content does not contain newlines and className contains 'inline', return inline span
  if (!content.includes('\n') && className.includes('inline')) {
    return React.createElement('span', { className }, parseInline(content, 'single'));
  }

  // Split lines and parse block elements
  const lines = content.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line -> spacing
    if (!trimmed) {
      elements.push(React.createElement('div', { key: `empty-${i}`, className: 'h-1.5' }));
      continue;
    }

    // Header 3: ### Title
    if (trimmed.startsWith('### ')) {
      elements.push(
        React.createElement(
          'h5',
          {
            key: `h3-${i}`,
            className: 'text-xs sm:text-sm font-black text-indigo-700 dark:text-indigo-400 mt-2.5 mb-1 flex items-center space-x-1.5'
          },
          parseInline(trimmed.slice(4), `h3-${i}`)
        )
      );
      continue;
    }

    // Header 2: ## Title
    if (trimmed.startsWith('## ')) {
      elements.push(
        React.createElement(
          'h4',
          {
            key: `h2-${i}`,
            className: 'text-sm sm:text-base font-black text-indigo-800 dark:text-indigo-300 mt-3 mb-1.5'
          },
          parseInline(trimmed.slice(3), `h2-${i}`)
        )
      );
      continue;
    }

    // Blockquote: > Text
    if (trimmed.startsWith('> ')) {
      elements.push(
        React.createElement(
          'blockquote',
          {
            key: `quote-${i}`,
            className: 'border-l-4 border-indigo-500 pl-3 py-1 my-1.5 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic rounded-r-lg'
          },
          parseInline(trimmed.slice(2), `quote-${i}`)
        )
      );
      continue;
    }

    // Bullet List: - Item or * Item or • Item
    const bulletMatch = line.match(/^(\s*)([-*•])\s+(.+)$/);
    if (bulletMatch) {
      const indentLevel = Math.floor(bulletMatch[1].length / 2);
      const itemText = bulletMatch[3];
      elements.push(
        React.createElement(
          'div',
          {
            key: `bullet-${i}`,
            className: `flex items-start space-x-2 my-0.5 leading-relaxed ${indentLevel > 0 ? (indentLevel === 1 ? 'ml-3' : 'ml-6') : ''}`
          },
          [
            React.createElement('span', { key: 'bullet-icon', className: 'text-indigo-500 dark:text-indigo-400 font-bold shrink-0 mt-0.5 select-none text-xs' }, '•'),
            React.createElement('div', { key: 'bullet-content', className: 'flex-1' }, parseInline(itemText, `bullet-${i}`))
          ]
        )
      );
      continue;
    }

    // Numbered List: 1. Item, 2. Item
    const numMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (numMatch) {
      const indentLevel = Math.floor(numMatch[1].length / 2);
      const num = numMatch[2];
      const itemText = numMatch[3];
      elements.push(
        React.createElement(
          'div',
          {
            key: `num-${i}`,
            className: `flex items-start space-x-2 my-1 leading-relaxed ${indentLevel > 0 ? (indentLevel === 1 ? 'ml-3' : 'ml-6') : ''}`
          },
          [
            React.createElement(
              'span',
              {
                key: 'num-badge',
                className: 'w-4 h-4 sm:w-5 sm:h-5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-[10px] sm:text-[11px] flex items-center justify-center shrink-0 mt-0.5 select-none shadow-xs'
              },
              num
            ),
            React.createElement('div', { key: 'num-content', className: 'flex-1 font-medium' }, parseInline(itemText, `num-${i}`))
          ]
        )
      );
      continue;
    }

    // Normal Paragraph line
    elements.push(
      React.createElement(
        'div',
        { key: `line-${i}`, className: 'leading-relaxed' },
        parseInline(line, `line-${i}`)
      )
    );
  }

  return React.createElement('div', { className: `markdown-content space-y-1 ${className}` }, elements);
}
