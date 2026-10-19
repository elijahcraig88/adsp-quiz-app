// ADsP Master App - Universal Lightweight React Markdown Renderer
// Safely parses bold (**text**), inline code (`code`), headers (###), lists (- item, 1. item), blockquotes (> text)
// 100% Zero-dependency, Offline PWA compatible, Virtual DOM based (No dangerouslySetInnerHTML)

function MarkdownText({ content, className = '' }) {
  if (!content) return null;
  if (typeof content !== 'string') return React.createElement('span', { className }, String(content));

  // Parse inline elements (bold, code, math)
  const parseInline = (text, keyPrefix = 'inline') => {
    if (!text) return null;
    const regex = /(\*\*[^\n]+?\*\*|`[^`\n]+?`|\$[^\$\n]+?\$)/g;
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

      // Inline Math: $math$ (safe fallback)
      if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
        return React.createElement(
          'span',
          {
            key,
            className: 'font-mono text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800/70 px-1.5 py-0.5 rounded-md shadow-xs mx-0.5'
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

    // Beginner Math Symbol Guide Card: 💡 [왕초보 수식 기호 완벽 풀이]
    if (trimmed.startsWith('💡 [왕초보 수식 기호') || trimmed.startsWith('💡 **[왕초보 수식 기호') || trimmed.startsWith('[왕초보 수식 기호')) {
      const guideLines = [];
      let j = i + 1;
      while (j < lines.length) {
        const nextTrimmed = lines[j].trim();
        if (!nextTrimmed) {
          // Allow single empty line within card
          if (j + 1 < lines.length && (lines[j + 1].trim().startsWith('•') || lines[j + 1].trim().startsWith('-') || lines[j + 1].trim().startsWith('*'))) {
            j++;
            continue;
          }
          break;
        }
        if (nextTrimmed.startsWith('[') || nextTrimmed.startsWith('📚') || nextTrimmed.startsWith('📖') || nextTrimmed.startsWith('🎯') || nextTrimmed.startsWith('💡 [')) {
          break;
        }
        guideLines.push(nextTrimmed);
        j++;
      }
      i = j - 1; // advance main loop

      const itemElements = guideLines.map((gl, gIdx) => {
        const cleanGl = gl.replace(/^[•\-\*]\s*/, '');
        return React.createElement(
          'div',
          {
            key: `guide-item-${gIdx}`,
            className: 'flex items-start space-x-2 my-1 text-xs sm:text-[13px] leading-relaxed text-amber-950 dark:text-amber-100 font-medium'
          },
          [
            React.createElement('span', { key: 'bullet', className: 'text-amber-500 dark:text-amber-400 font-bold shrink-0 mt-0.5 select-none' }, '•'),
            React.createElement('div', { key: 'content', className: 'flex-1' }, parseInline(cleanGl, `guide-item-${gIdx}`))
          ]
        );
      });

      elements.push(
        React.createElement(
          'div',
          {
            key: `math-guide-${i}`,
            className: 'my-3 p-3.5 sm:p-4 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 dark:border-amber-400/25 shadow-xs'
          },
          [
            React.createElement(
              'div',
              {
                key: 'guide-title',
                className: 'flex items-center space-x-2 font-black text-xs sm:text-sm text-amber-900 dark:text-amber-200 mb-2 pb-1.5 border-b border-amber-500/20 dark:border-amber-400/15'
              },
              [
                React.createElement('span', { key: 'badge', className: 'px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs' }, '왕초보 필독'),
                React.createElement('span', { key: 'title-text' }, '수식 & 기호 완벽 풀이')
              ]
            ),
            React.createElement('div', { key: 'guide-items', className: 'space-y-1' }, itemElements)
          ]
        )
      );
      continue;
    }

    // 2x2 Quadrant Visual Matrix: 📊 [2x2 사분면 비주얼 매트릭스...] or 📊 [사분면 매트릭스...]
    if (trimmed.startsWith('📊 [') || trimmed.startsWith('📊 **[')) {
      const matrixLines = [];
      const titleMatch = trimmed.match(/📊\s*\*?\[([^\]]+)\]/);
      const matrixTitle = titleMatch ? titleMatch[1] : '2x2 비주얼 매트릭스';
      let j = i + 1;
      while (j < lines.length) {
        const nextTrimmed = lines[j].trim();
        if (!nextTrimmed) {
          if (j + 1 < lines.length && (lines[j+1].trim().startsWith('-') || lines[j+1].trim().startsWith('•') || lines[j+1].trim().startsWith('축:'))) {
            j++;
            continue;
          }
          break;
        }
        if (nextTrimmed.startsWith('[') || nextTrimmed.startsWith('📚') || nextTrimmed.startsWith('📖') || nextTrimmed.startsWith('🎯') || nextTrimmed.startsWith('💡 [') || nextTrimmed.startsWith('📊 [') || nextTrimmed.startsWith('🔄 [')) {
          break;
        }
        matrixLines.push(nextTrimmed);
        j++;
      }
      i = j - 1; // advance loop

      let axisText = '';
      const quadItems = [];
      matrixLines.forEach(ml => {
        if (ml.startsWith('축:')) {
          axisText = ml.slice(2).trim();
        } else {
          const clean = ml.replace(/^[•\-\*]\s*/, '').trim();
          if (clean) quadItems.push(clean);
        }
      });

      const colorStyles = [
        { bg: 'bg-indigo-50/80 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800/80', badge: 'bg-indigo-600 text-white', text: 'text-indigo-950 dark:text-indigo-100' },
        { bg: 'bg-rose-50/80 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800/80', badge: 'bg-rose-600 text-white', text: 'text-rose-950 dark:text-rose-100' },
        { bg: 'bg-emerald-50/80 dark:bg-emerald-950/40', border: 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/30', badge: 'bg-emerald-600 text-white shadow-xs', text: 'text-emerald-950 dark:text-emerald-100' },
        { bg: 'bg-sky-50/80 dark:bg-sky-950/40', border: 'border-sky-200 dark:border-sky-800/80', badge: 'bg-sky-600 text-white', text: 'text-sky-950 dark:text-sky-100' }
      ];

      const gridCells = quadItems.slice(0, 4).map((item, qIdx) => {
        const style = colorStyles[qIdx] || colorStyles[0];
        let qName = '';
        let qDesc = item;
        const colonIdx = item.indexOf(':');
        if (colonIdx > 0 && colonIdx < 30) {
          qName = item.slice(0, colonIdx).trim();
          qDesc = item.slice(colonIdx + 1).trim();
        }
        const isQuickWin = item.includes('Quick-Win') || item.includes('1순위') || item.includes('최우선');
        return React.createElement(
          'div',
          {
            key: `quad-${qIdx}`,
            className: `p-2.5 sm:p-3 rounded-xl border ${style.border} ${style.bg} flex flex-col justify-between transition-all hover:scale-[1.01]`
          },
          [
            React.createElement(
              'div',
              { key: 'head', className: 'flex items-center justify-between gap-1 mb-1.5' },
              [
                qName ? React.createElement('span', { key: 'badge', className: `px-2 py-0.5 rounded-md text-[10px] font-black ${style.badge} shadow-xs` }, qName) : null,
                isQuickWin ? React.createElement('span', { key: 'star', className: 'text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-full' }, '⭐ 최우선') : null
              ]
            ),
            React.createElement('div', { key: 'desc', className: `text-[11px] sm:text-xs font-medium leading-relaxed ${style.text}` }, parseInline(qDesc, `quad-desc-${qIdx}`))
          ]
        );
      });

      elements.push(
        React.createElement(
          'div',
          {
            key: `matrix-${i}`,
            className: 'my-3 p-3.5 sm:p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm'
          },
          [
            React.createElement(
              'div',
              { key: 'header', className: 'flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2.5 border-b border-slate-200/80 dark:border-slate-800' },
              [
                React.createElement(
                  'div',
                  { key: 'title', className: 'flex items-center space-x-2 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100' },
                  [
                    React.createElement('span', { key: 'icon', className: 'text-indigo-600 dark:text-indigo-400' }, '📊'),
                    React.createElement('span', { key: 'txt' }, matrixTitle)
                  ]
                ),
                axisText ? React.createElement('span', { key: 'axis', className: 'text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 sm:mt-0 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60' }, axisText) : null
              ]
            ),
            React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5' }, gridCells)
          ]
        )
      );
      continue;
    }

    // Process Flow: 🔄 [프로세스 플로우...] or 🔄 [단계별...]
    if (trimmed.startsWith('🔄 [') || trimmed.startsWith('🔄 **[')) {
      const titleMatch = trimmed.match(/🔄\s*\*?\[([^\]]+)\]/);
      const flowTitle = titleMatch ? titleMatch[1] : '단계별 프로세스';
      let flowText = '';
      if (i + 1 < lines.length) {
        flowText = lines[i + 1].trim();
        i++; // advance loop
      }
      const rawSteps = flowText.split(/\s*(?:➔|->|→)\s*/).filter(Boolean);
      const stepPills = rawSteps.map((st, sIdx) => {
        return React.createElement(
          React.Fragment,
          { key: `step-frag-${sIdx}` },
          [
            React.createElement(
              'div',
              {
                key: `step-${sIdx}`,
                className: 'inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-[11px] sm:text-xs font-bold text-indigo-900 dark:text-indigo-200 shadow-xs'
              },
              [
                React.createElement('span', { key: 'idx', className: 'w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-black shrink-0' }, String(sIdx + 1)),
                React.createElement('span', { key: 'name' }, st)
              ]
            ),
            sIdx < rawSteps.length - 1 ? React.createElement('span', { key: `arrow-${sIdx}`, className: 'text-indigo-400 dark:text-indigo-500 font-black text-xs select-none' }, '➔') : null
          ]
        );
      });

      elements.push(
        React.createElement(
          'div',
          {
            key: `flow-${i}`,
            className: 'my-3 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs'
          },
          [
            React.createElement(
              'div',
              { key: 'flow-head', className: 'text-xs font-black text-indigo-800 dark:text-indigo-300 mb-2 flex items-center space-x-1.5' },
              [
                React.createElement('span', { key: 'icon' }, '🔄'),
                React.createElement('span', { key: 'title' }, flowTitle)
              ]
            ),
            React.createElement(
              'div',
              { key: 'flow-steps', className: 'flex flex-wrap items-center gap-1.5 sm:gap-2' },
              stepPills
            )
          ]
        )
      );
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

    // Markdown Table: lines starting and ending with |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().endsWith('|')) {
        tableLines.push(lines[j].trim());
        j++;
      }
      if (tableLines.length >= 2) {
        i = j - 1; // advance main loop
        const headerRow = tableLines[0].slice(1, -1).split('|').map(c => c.trim());
        // Skip delimiter line (tableLines[1])
        const dataRows = tableLines.slice(2);

        const ths = headerRow.map((h, hi) =>
          React.createElement('th', {
            key: `th-${hi}`,
            className: 'px-3 py-2 text-left font-black text-xs text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
          }, parseInline(h.replace(/<br\s*\/?>/gi, ' '), `th-${hi}`))
        );

        const trs = dataRows.map((r, ri) => {
          const cells = r.slice(1, -1).split('|').map(c => c.trim());
          return React.createElement('tr', {
            key: `tr-${ri}`,
            className: 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'
          }, cells.map((c, ci) =>
            React.createElement('td', {
              key: `td-${ci}`,
              className: 'px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/60 leading-relaxed font-medium'
            }, parseInline(c.replace(/<br\s*\/?>/gi, ' '), `td-${ri}-${ci}`))
          ));
        });

        elements.push(
          React.createElement('div', {
            key: `table-${i}`,
            className: 'overflow-x-auto my-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs'
          }, React.createElement('table', {
            className: 'min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left'
          }, [
            React.createElement('thead', { key: 'thead' }, React.createElement('tr', {}, ths)),
            React.createElement('tbody', { key: 'tbody' }, trs)
          ]))
        );
        continue;
      }
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
