// ADsP Master App - Universal Lightweight React Markdown Renderer
// Safely parses bold (**text**), inline code (`code`), headers (###), lists (- item, 1. item), blockquotes (> text)
// 100% Zero-dependency, Offline PWA compatible, Virtual DOM based (No dangerouslySetInnerHTML)

function MarkdownText({ content, className = '' }) {
  if (!content) return null;
  if (typeof content !== 'string') return React.createElement('span', { className }, String(content));

  // Parse inline elements (bold, code, math, blanks)
  const parseInline = (text, keyPrefix = 'inline') => {
    if (!text) return null;
    const regex = /(\*\*[^\n]+?\*\*|`[^`\n]+?`|\$[^\$\n]+?\$|\(\s*[㉠㉡㉢㉣ABCD가나다]\s*\)|\[\s*[㉠㉡㉢㉣ABCD가나다]\s*\])/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (!part) return null;
      const key = `${keyPrefix}-${idx}`;

      // Blank highlighting: ( ㉠ ), ( ㉡ ), [ ㉠ ], ( A )
      if (/^(\(\s*[㉠㉡㉢㉣ABCD가나다]\s*\)|\[\s*[㉠㉡㉢㉣ABCD가나다]\s*\])$/.test(part)) {
        return React.createElement(
          'span',
          {
            key,
            className: 'inline-flex items-center justify-center px-2 py-0.5 mx-1 rounded-md bg-amber-400/25 text-amber-900 dark:text-amber-200 border border-amber-400/50 font-black font-mono text-xs shadow-xs'
          },
          part
        );
      }

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

    // R Console Terminal / Fenced Code Block: ```r or ``` or 💻 [R Console: ...]
    if (trimmed.startsWith('```') || trimmed.startsWith('💻 [') || trimmed.startsWith('💻 **[')) {
      let codeTitle = 'R Console - RStudio';
      let codeLines = [];
      
      if (trimmed.startsWith('💻')) {
        const tMatch = trimmed.match(/💻\s*\*?\[([^\]]+)\]/);
        if (tMatch) codeTitle = tMatch[1];
        let j = i + 1;
        if (j < lines.length && lines[j].trim().startsWith('```')) j++;
        while (j < lines.length) {
          const cTrim = lines[j].trim();
          if (cTrim.startsWith('```')) {
            j++;
            break;
          }
          if (cTrim.startsWith('[') || cTrim.startsWith('📚') || cTrim.startsWith('📖') || cTrim.startsWith('🎯') || cTrim.startsWith('💡 [') || cTrim.startsWith('📊 [') || cTrim.startsWith('📦 [') || cTrim.startsWith('📈 [')) {
            break;
          }
          codeLines.push(lines[j]);
          j++;
        }
        i = j - 1;
      } else {
        const lang = trimmed.slice(3).trim();
        if (lang) codeTitle = (lang.toUpperCase() === 'R' || lang.toLowerCase() === 'r') ? 'R Console - RStudio' : `${lang.toUpperCase()} Code`;
        let j = i + 1;
        while (j < lines.length) {
          if (lines[j].trim().startsWith('```')) {
            j++;
            break;
          }
          codeLines.push(lines[j]);
          j++;
        }
        i = j - 1;
      }

      const renderedCodeLines = codeLines.map((cLine, cIdx) => {
        const cTrim = cLine.trim();
        if (cTrim.startsWith('>') || cTrim.startsWith('+')) {
          return React.createElement('div', { key: `c-${cIdx}`, className: 'text-sky-300 font-bold' }, cLine);
        }
        if (cTrim.startsWith('#')) {
          return React.createElement('div', { key: `c-${cIdx}`, className: 'text-slate-400 italic' }, cLine);
        }
        if (cTrim.startsWith('Call:') || cTrim.startsWith('Coefficients:') || cTrim.startsWith('Residuals:') || cTrim.startsWith('Analysis of Variance')) {
          return React.createElement('div', { key: `c-${cIdx}`, className: 'text-amber-300 font-bold' }, cLine);
        }
        if (cTrim.includes('Multiple R-squared:') || cTrim.includes('Adjusted R-squared:') || cTrim.includes('F-statistic:') || cTrim.includes('p-value:')) {
          return React.createElement('div', { key: `c-${cIdx}`, className: 'text-teal-300 font-bold' }, cLine);
        }
        if (cTrim.includes('***') || cTrim.includes('**') || cTrim.includes('*')) {
          return React.createElement('div', { key: `c-${cIdx}`, className: 'text-emerald-300 font-semibold' }, cLine);
        }
        return React.createElement('div', { key: `c-${cIdx}`, className: 'text-slate-200' }, cLine || ' ');
      });

      elements.push(
        React.createElement(
          'div',
          {
            key: `r-console-${i}`,
            className: 'my-3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-lg font-mono text-[11px] sm:text-xs select-text'
          },
          [
            React.createElement(
              'div',
              {
                key: 'term-bar',
                className: 'flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 select-none'
              },
              [
                React.createElement('div', { key: 'dots', className: 'flex items-center space-x-1.5' }, [
                  React.createElement('span', { key: 'd1', className: 'w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs' }),
                  React.createElement('span', { key: 'd2', className: 'w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs' }),
                  React.createElement('span', { key: 'd3', className: 'w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs' })
                ]),
                React.createElement('span', { key: 'term-title', className: 'text-[11px] font-bold text-slate-300 tracking-wide' }, codeTitle),
                React.createElement('span', { key: 'badge', className: 'px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' }, 'R Output')
              ]
            ),
            React.createElement(
              'div',
              {
                key: 'term-body',
                className: 'p-3.5 sm:p-4 overflow-x-auto leading-relaxed text-slate-200 selection:bg-indigo-600 selection:text-white space-y-0.5'
              },
              renderedCodeLines
            )
          ]
        )
      );
      continue;
    }

    // Boxplot SVG: 📦 [상자그림 (Boxplot): 변수명 | min=X, q1=X, med=X, q3=X, max=X, outliers=X Y]
    if (trimmed.startsWith('📦 [') || trimmed.startsWith('📦 **[')) {
      const match = trimmed.match(/📦\s*\*?\[([^\]]+)\]/);
      const spec = match ? match[1] : '';
      const parts = spec.split('|');
      const boxTitle = parts[0].trim();
      const params = {};
      if (parts[1]) {
        parts[1].split(',').forEach(kv => {
          const [k, v] = kv.split('=').map(s => (s || '').trim().toLowerCase());
          if (k && v !== undefined) params[k] = v;
        });
      }

      const minVal = parseFloat(params['min'] || 10);
      const q1 = parseFloat(params['q1'] || 25);
      const med = parseFloat(params['med'] || params['median'] || 40);
      const q3 = parseFloat(params['q3'] || 60);
      const maxVal = parseFloat(params['max'] || 85);
      const rawOutliers = params['outliers'] ? params['outliers'].split(/[\s,]+/).map(Number).filter(n => !isNaN(n)) : [];

      const allVals = [minVal, q1, med, q3, maxVal, ...rawOutliers];
      const globalMin = Math.min(...allVals);
      const globalMax = Math.max(...allVals);
      const span = (globalMax - globalMin) || 1;

      const svgWidth = 480;
      const svgHeight = 155;
      const padL = 45;
      const padR = 45;
      const usableW = svgWidth - padL - padR;

      const toX = (val) => padL + ((val - globalMin) / span) * usableW;

      const xMin = toX(minVal);
      const xQ1 = toX(q1);
      const xMed = toX(med);
      const xQ3 = toX(q3);
      const xMax = toX(maxVal);

      const boxY = 48;
      const boxH = 42;
      const midY = boxY + boxH / 2;

      const svgChildren = [
        React.createElement('line', { key: 'iqr-line', x1: xQ1, y1: 30, x2: xQ3, y2: 30, stroke: '#6366f1', strokeWidth: 1.5 }),
        React.createElement('line', { key: 'iqr-lcap', x1: xQ1, y1: 26, x2: xQ1, y2: 34, stroke: '#6366f1', strokeWidth: 1.5 }),
        React.createElement('line', { key: 'iqr-rcap', x1: xQ3, y1: 26, x2: xQ3, y2: 34, stroke: '#6366f1', strokeWidth: 1.5 }),
        React.createElement('text', {
          key: 'iqr-txt',
          x: (xQ1 + xQ3) / 2,
          y: 24,
          textAnchor: 'middle',
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#4f46e5'
        }, `사분위수범위 (IQR = ${Math.round((q3 - q1) * 100) / 100})`),

        React.createElement('line', { key: 'w-low', x1: xMin, y1: midY, x2: xQ1, y2: midY, stroke: '#64748b', strokeWidth: 2, strokeDasharray: '4 3' }),
        React.createElement('line', { key: 'w-low-cap', x1: xMin, y1: midY - 14, x2: xMin, y2: midY + 14, stroke: '#64748b', strokeWidth: 2.5 }),

        React.createElement('line', { key: 'w-high', x1: xQ3, y1: midY, x2: xMax, y2: midY, stroke: '#64748b', strokeWidth: 2, strokeDasharray: '4 3' }),
        React.createElement('line', { key: 'w-high-cap', x1: xMax, y1: midY - 14, x2: xMax, y2: midY + 14, stroke: '#64748b', strokeWidth: 2.5 }),

        React.createElement('rect', {
          key: 'iqr-box',
          x: xQ1,
          y: boxY,
          width: Math.max(xQ3 - xQ1, 2),
          height: boxH,
          rx: 4,
          fill: 'rgba(99, 102, 241, 0.22)',
          stroke: '#4f46e5',
          strokeWidth: 2.5
        }),

        React.createElement('line', { key: 'med-line', x1: xMed, y1: boxY, x2: xMed, y2: boxY + boxH, stroke: '#e11d48', strokeWidth: 3 }),

        ...rawOutliers.map((oVal, oIdx) => {
          const ox = toX(oVal);
          return React.createElement(
            React.Fragment,
            { key: `outlier-${oIdx}` },
            [
              React.createElement('circle', {
                cx: ox,
                cy: midY,
                r: 5.5,
                fill: '#f43f5e',
                stroke: '#ffffff',
                strokeWidth: 2
              }),
              React.createElement('text', {
                x: ox,
                y: midY - 10,
                textAnchor: 'middle',
                fontSize: 9.5,
                fontWeight: 'bold',
                fill: '#e11d48'
              }, `${oVal} (이상치)`)
            ]
          );
        }),

        React.createElement('line', { key: 'axis', x1: padL - 10, y1: 110, x2: svgWidth - padR + 10, y2: 110, stroke: '#94a3b8', strokeWidth: 1.5 }),

        React.createElement('text', { key: 'lbl-min', x: xMin, y: 126, textAnchor: 'middle', fontSize: 10, fontWeight: 'bold', fill: '#475569' }, `최솟값 ${minVal}`),
        React.createElement('text', { key: 'lbl-q1', x: xQ1, y: 140, textAnchor: 'middle', fontSize: 10, fontWeight: 'bold', fill: '#4338ca' }, `Q1 ${q1}`),
        React.createElement('text', { key: 'lbl-med', x: xMed, y: 126, textAnchor: 'middle', fontSize: 10.5, fontWeight: 'black', fill: '#be123c' }, `중앙값 ${med}`),
        React.createElement('text', { key: 'lbl-q3', x: xQ3, y: 140, textAnchor: 'middle', fontSize: 10, fontWeight: 'bold', fill: '#4338ca' }, `Q3 ${q3}`),
        React.createElement('text', { key: 'lbl-max', x: xMax, y: 126, textAnchor: 'middle', fontSize: 10, fontWeight: 'bold', fill: '#475569' }, `최댓값 ${maxVal}`)
      ];

      elements.push(
        React.createElement(
          'div',
          {
            key: `boxplot-${i}`,
            className: 'my-3 p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
          },
          [
            React.createElement(
              'div',
              { key: 'head', className: 'flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800' },
              [
                React.createElement('div', { key: 'title', className: 'text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 flex items-center space-x-1.5' }, [
                  React.createElement('span', { key: 'icon' }, '📦'),
                  React.createElement('span', { key: 't' }, boxTitle)
                ]),
                React.createElement('span', { key: 'badge', className: 'text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono' }, 'Boxplot Diagram')
              ]
            ),
            React.createElement(
              'div',
              { key: 'svg-wrap', className: 'w-full overflow-x-auto flex justify-center py-1' },
              React.createElement('svg', {
                viewBox: `0 0 ${svgWidth} ${svgHeight}`,
                className: 'w-full max-w-[500px] h-auto select-none'
              }, svgChildren)
            )
          ]
        )
      );
      continue;
    }

    // Scree Plot SVG: 📈 [Scree Plot (주성분 분석 감쇄도) | comp=3.4 1.9 0.7 0.3 0.1]
    if (trimmed.startsWith('📈 [') || trimmed.startsWith('📈 **[')) {
      const match = trimmed.match(/📈\s*\*?\[([^\]]+)\]/);
      const spec = match ? match[1] : '';
      const parts = spec.split('|');
      const screeTitle = parts[0].trim();
      const params = {};
      if (parts[1]) {
        parts[1].split(',').forEach(kv => {
          const [k, v] = kv.split('=').map(s => (s || '').trim().toLowerCase());
          if (k && v !== undefined) params[k] = v;
        });
      }

      const rawVals = (params['values'] || params['eigenvalues'] || params['comp'] || '3.2 1.8 0.7 0.2 0.1')
        .split(/[\s,]+/).map(Number).filter(n => !isNaN(n));

      const svgWidth = 460;
      const svgHeight = 170;
      const padL = 40;
      const padR = 25;
      const padT = 25;
      const padB = 40;
      const usableW = svgWidth - padL - padR;
      const usableH = svgHeight - padT - padB;

      const maxVal = Math.max(...rawVals, 3.5);
      const toY = (val) => padT + usableH - (val / maxVal) * usableH;
      const barW = Math.min(usableW / (rawVals.length * 2), 36);
      const stepX = usableW / rawVals.length;

      const kaiserY = toY(1.0);

      const points = rawVals.map((v, idx) => {
        const x = padL + idx * stepX + stepX / 2;
        const y = toY(v);
        return { x, y, v, idx };
      });

      const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

      const svgChildren = [
        React.createElement('line', { key: 'y-axis', x1: padL, y1: padT, x2: padL, y2: padT + usableH, stroke: '#94a3b8', strokeWidth: 1.5 }),
        React.createElement('line', { key: 'x-axis', x1: padL, y1: padT + usableH, x2: svgWidth - padR, y2: padT + usableH, stroke: '#94a3b8', strokeWidth: 1.5 }),

        React.createElement('line', { key: 'kaiser-line', x1: padL, y1: kaiserY, x2: svgWidth - padR, y2: kaiserY, stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '4 3' }),
        React.createElement('text', {
          key: 'kaiser-txt',
          x: svgWidth - padR,
          y: kaiserY - 5,
          textAnchor: 'end',
          fontSize: 9.5,
          fontWeight: 'bold',
          fill: '#dc2626'
        }, '고유값 = 1.0 (Kaiser-Guttman 기준선)'),

        ...points.map(p => React.createElement('rect', {
          key: `bar-${p.idx}`,
          x: p.x - barW / 2,
          y: p.y,
          width: barW,
          height: padT + usableH - p.y,
          rx: 3,
          fill: p.v >= 1.0 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(148, 163, 184, 0.3)',
          stroke: p.v >= 1.0 ? '#4f46e5' : '#94a3b8',
          strokeWidth: 1.5
        })),

        React.createElement('polyline', { key: 'line', fill: 'none', stroke: '#f59e0b', strokeWidth: 2.5, points: polylinePoints }),

        ...points.map(p => React.createElement(
          React.Fragment,
          { key: `pt-${p.idx}` },
          [
            React.createElement('circle', {
              cx: p.x,
              cy: p.y,
              r: 4.5,
              fill: '#f59e0b',
              stroke: '#ffffff',
              strokeWidth: 2
            }),
            React.createElement('text', {
              x: p.x,
              y: p.y - 8,
              textAnchor: 'middle',
              fontSize: 10,
              fontWeight: 'black',
              fill: p.v >= 1.0 ? '#4338ca' : '#64748b'
            }, String(p.v)),
            React.createElement('text', {
              x: p.x,
              y: padT + usableH + 16,
              textAnchor: 'middle',
              fontSize: 10,
              fontWeight: 'bold',
              fill: '#475569'
            }, `Comp ${p.idx + 1}`)
          ]
        ))
      ];

      elements.push(
        React.createElement(
          'div',
          {
            key: `scree-${i}`,
            className: 'my-3 p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
          },
          [
            React.createElement(
              'div',
              { key: 'head', className: 'flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800' },
              [
                React.createElement('div', { key: 'title', className: 'text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 flex items-center space-x-1.5' }, [
                  React.createElement('span', { key: 'icon' }, '📈'),
                  React.createElement('span', { key: 't' }, screeTitle)
                ]),
                React.createElement('span', { key: 'badge', className: 'text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono' }, 'Scree Plot')
              ]
            ),
            React.createElement(
              'div',
              { key: 'svg-wrap', className: 'w-full overflow-x-auto flex justify-center py-1' },
              React.createElement('svg', {
                viewBox: `0 0 ${svgWidth} ${svgHeight}`,
                className: 'w-full max-w-[460px] h-auto select-none'
              }, svgChildren)
            )
          ]
        )
      );
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
