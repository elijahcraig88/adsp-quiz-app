// js/ConceptBookView.js
// 📖 비전공자 전용 ADsP 100선 개념 마스터북 (100페이지 정밀 교재판 · 시각 도식 & 표화 · 듀얼 뷰 · PWA & PDF)

window.ConceptBookView = function({ onNavigateToExam }) {
  const [selectedSubject, setSelectedSubject] = React.useState('all');
  const [selectedTopicId, setSelectedTopicId] = React.useState('c1-1');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = React.useState(false);
  const [showPwaModal, setShowPwaModal] = React.useState(false);
  const [showSolution, setShowSolution] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('card'); // 'card' (1개념 집중) | 'book' (100p 전권 연속 스크롤)
  const [selectedOptions, setSelectedOptions] = React.useState({}); // { [topicId]: { choice, showSolution } }

  // Local storage state for read status & bookmarks
  const [readTopics, setReadTopics] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adsp_concept_read') || '[]');
    } catch {
      return [];
    }
  });

  const [bookmarkedTopics, setBookmarkedTopics] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adsp_concept_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  // Load all topics & metadata
  const bookData = window.ADSP_CONCEPT_BOOK || {};
  const allTopics = React.useMemo(() => {
    if (Array.isArray(bookData)) return bookData;
    return bookData.topics || [];
  }, [bookData]);

  const metadata = bookData.metadata || {
    totalTopics: allTopics.length,
    totalPages: allTopics.length
  };

  // Filter topics
  const filteredTopics = React.useMemo(() => {
    return allTopics.filter(t => {
      if (selectedSubject !== 'all' && t.subjectId !== parseInt(selectedSubject)) {
        return false;
      }
      if (showBookmarksOnly && !bookmarkedTopics.includes(t.id)) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = (t.title || '').toLowerCase().includes(q);
        const matchOneLiner = (t.oneLiner || '').toLowerCase().includes(q);
        const matchKeywords = (t.keywords || []).some(k => k.toLowerCase().includes(q));
        const matchTheory = (t.coreTheory || '').toLowerCase().includes(q);
        const matchMetaphor = (t.metaphor || t.analogy || '').toLowerCase().includes(q);
        if (!matchTitle && !matchOneLiner && !matchKeywords && !matchTheory && !matchMetaphor) {
          return false;
        }
      }
      return true;
    });
  }, [allTopics, selectedSubject, showBookmarksOnly, searchTerm, bookmarkedTopics]);

  // Current active topic for card mode
  const currentTopic = React.useMemo(() => {
    return allTopics.find(t => t.id === selectedTopicId) || filteredTopics[0] || allTopics[0];
  }, [allTopics, selectedTopicId, filteredTopics]);

  // Reset single solution view when card topic changes
  React.useEffect(() => {
    setShowSolution(false);
  }, [selectedTopicId]);

  // Toggle read
  const toggleRead = (id) => {
    setReadTopics(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('adsp_concept_read', JSON.stringify(next));
      return next;
    });
  };

  // Toggle bookmark
  const toggleBookmark = (id) => {
    setBookmarkedTopics(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('adsp_concept_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  // Navigation handlers for card view
  const currentIndex = filteredTopics.findIndex(t => t.id === (currentTopic ? currentTopic.id : ''));
  const prevTopic = currentIndex > 0 ? filteredTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex >= 0 && currentIndex < filteredTopics.length - 1 ? filteredTopics[currentIndex + 1] : null;

  // Print full book handler
  const handlePrint = () => {
    window.print();
  };

  // Group filtered topics by chapter
  const groupedByChapter = React.useMemo(() => {
    const groups = {};
    filteredTopics.forEach(t => {
      if (!groups[t.chapter]) {
        groups[t.chapter] = [];
      }
      groups[t.chapter].push(t);
    });
    return groups;
  }, [filteredTopics]);

  const progressPercent = allTopics.length > 0 ? Math.round((readTopics.length / allTopics.length) * 100) : 0;

  // 1. Helper to render Visual Diagrams (시각 도식 캔버스)
  const renderVisualDiagram = (diagram) => {
    if (!diagram) return null;

    // Type 1: DIKW 계층형 피라미드
    if (diagram.type === 'pyramid') {
      return React.createElement('div', { className: 'my-4 p-5 rounded-2xl bg-gradient-to-b from-indigo-50/80 via-slate-50 to-white border border-indigo-100 shadow-sm' }, [
        React.createElement('div', { className: 'text-xs font-extrabold text-indigo-700 tracking-wider uppercase mb-3 flex items-center gap-1.5' }, [
          '📊 개념 도식화: ',
          diagram.title
        ]),
        React.createElement('div', { className: 'space-y-2 max-w-xl mx-auto' }, (diagram.levels || []).map((lvl, lIdx) => (
          React.createElement('div', {
            key: lIdx,
            className: 'p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm transition hover:scale-[1.01]',
            style: {
              backgroundColor: `${lvl.color}15`,
              borderColor: `${lvl.color}40`,
              width: `${75 + lIdx * 8}%`,
              margin: '0 auto'
            }
          }, [
            React.createElement('div', { className: 'flex items-center gap-2' }, [
              React.createElement('span', {
                className: 'px-2 py-0.5 rounded text-xs font-bold text-white shadow-sm shrink-0',
                style: { backgroundColor: lvl.color }
              }, lvl.level),
              React.createElement('span', { className: 'text-xs font-medium text-slate-800' }, lvl.desc)
            ]),
            lvl.example && React.createElement('span', { className: 'text-[11px] text-slate-500 italic bg-white/70 px-2 py-0.5 rounded border border-slate-200' }, `예: ${lvl.example}`)
          ])
        )))
      ]);
    }

    // Type 2: 노나카 SECI 4사분면 순환도 (공·표·연·내)
    if (diagram.type === 'cycle_seci') {
      return React.createElement('div', { className: 'my-4 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 shadow-sm' }, [
        React.createElement('div', { className: 'text-xs font-extrabold text-indigo-800 tracking-wider uppercase mb-3 flex items-center justify-between' }, [
          React.createElement('span', null, `🔄 지식 창조 순환 다이어그램: ${diagram.title}`),
          React.createElement('span', { className: 'text-[11px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border' }, '공 → 표 → 연 → 내 4단계 무한 순환')
        ]),
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto' }, (diagram.quadrants || []).map((q, qIdx) => (
          React.createElement('div', {
            key: qIdx,
            className: 'p-3.5 rounded-xl border bg-white shadow-sm space-y-1.5 transition hover:shadow-md'
          }, [
            React.createElement('div', { className: 'flex items-center justify-between' }, [
              React.createElement('span', { className: 'font-extrabold text-xs text-indigo-900 flex items-center gap-1.5' }, [
                React.createElement('span', { className: 'w-2 h-2 rounded-full', style: { backgroundColor: q.color } }),
                q.code
              ]),
              React.createElement('span', { className: 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600' }, q.trans)
            ]),
            React.createElement('p', { className: 'text-xs text-slate-700 leading-snug' }, q.desc),
            q.example && React.createElement('div', { className: 'text-[11px] text-indigo-700 bg-indigo-50/70 p-1.5 rounded border border-indigo-100' }, `📌 ${q.example}`)
          ])
        )))
      ]);
    }

    // Type 3: 2x2 매트릭스 (과제 발굴 4분면, 우선순위, CMMI 진단 등)
    if (diagram.type === 'matrix_2x2') {
      return React.createElement('div', { className: 'my-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm' }, [
        React.createElement('div', { className: 'text-xs font-extrabold text-slate-800 tracking-wider uppercase mb-3' }, [
          '📐 4사분면 분석 매트릭스 도식: ',
          diagram.title
        ]),
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto' }, (diagram.quadrants || []).map((quad, qIdx) => (
          React.createElement('div', {
            key: qIdx,
            className: 'p-3.5 rounded-xl border bg-white shadow-sm space-y-1'
          }, [
            React.createElement('div', { className: 'flex items-center justify-between mb-1' }, [
              React.createElement('span', { className: 'font-black text-xs text-slate-900' }, quad.code),
              React.createElement('span', { className: 'text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100' }, quad.trans)
            ]),
            React.createElement('div', { className: 'text-xs text-slate-700 leading-snug' }, quad.desc),
            quad.example && React.createElement('div', { className: 'text-[11px] text-emerald-800 bg-emerald-50/60 p-1.5 rounded border border-emerald-200 mt-1 font-medium' }, `사례: ${quad.example}`)
          ])
        )))
      ]);
    }

    // Type 4: 혼동행렬 (Confusion Matrix) 2x2 히트맵 카드
    if (diagram.type === 'confusion_matrix') {
      return React.createElement('div', { className: 'my-4 p-5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-md' }, [
        React.createElement('div', { className: 'text-xs font-black text-emerald-400 tracking-wider uppercase mb-3 flex items-center justify-between' }, [
          React.createElement('span', null, '🎯 2×2 혼동행렬 (Confusion Matrix) 시각 매트릭스'),
          React.createElement('span', { className: 'text-[11px] text-slate-300' }, '실제값(행) vs 예측값(열)')
        ]),
        React.createElement('div', { className: 'grid grid-cols-2 gap-3 max-w-lg mx-auto text-slate-900' }, [
          React.createElement('div', { className: 'p-3 bg-emerald-50 rounded-xl border border-emerald-300' }, [
            React.createElement('div', { className: 'font-black text-xs text-emerald-800 mb-1' }, diagram.tp.label),
            React.createElement('div', { className: 'text-[11px] text-emerald-950 font-medium' }, diagram.tp.desc)
          ]),
          React.createElement('div', { className: 'p-3 bg-rose-50 rounded-xl border border-rose-300' }, [
            React.createElement('div', { className: 'font-black text-xs text-rose-800 mb-1' }, diagram.fn.label),
            React.createElement('div', { className: 'text-[11px] text-rose-950 font-medium' }, diagram.fn.desc)
          ]),
          React.createElement('div', { className: 'p-3 bg-amber-50 rounded-xl border border-amber-300' }, [
            React.createElement('div', { className: 'font-black text-xs text-amber-800 mb-1' }, diagram.fp.label),
            React.createElement('div', { className: 'text-[11px] text-amber-950 font-medium' }, diagram.fp.desc)
          ]),
          React.createElement('div', { className: 'p-3 bg-indigo-50 rounded-xl border border-indigo-300' }, [
            React.createElement('div', { className: 'font-black text-xs text-indigo-800 mb-1' }, diagram.tn.label),
            React.createElement('div', { className: 'text-[11px] text-indigo-950 font-medium' }, diagram.tn.desc)
          ])
        ]),
        React.createElement('div', { className: 'mt-3 pt-3 border-t border-slate-700 text-[11px] text-slate-300 flex items-center justify-around flex-wrap gap-2' }, [
          React.createElement('span', null, '• 정밀도(Precision) = TP / (TP + FP)'),
          React.createElement('span', null, '• 재현율(Recall) = TP / (TP + FN)'),
          React.createElement('span', null, '• F1 = 2 × (P × R) / (P + R)')
        ])
      ]);
    }

    // Type 5: 상자수염그림 (Boxplot) 이상치 탐지 도식
    if (diagram.type === 'boxplot') {
      return React.createElement('div', { className: 'my-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm' }, [
        React.createElement('div', { className: 'text-xs font-extrabold text-slate-800 tracking-wider uppercase mb-3 flex items-center justify-between' }, [
          React.createElement('span', null, `📦 상자수염그림(Boxplot) 수치 울타리: ${diagram.title}`),
          React.createElement('span', { className: 'text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded' }, '1.5 × IQR 초과 = 이상치(점)')
        ]),
        React.createElement('div', { className: 'bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono' }, [
          React.createElement('div', { className: 'text-center p-2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 shrink-0' }, [
            React.createElement('div', null, '하한 울타리'),
            React.createElement('div', { className: 'text-[11px]' }, diagram.lowerFence)
          ]),
          React.createElement('span', { className: 'text-slate-300' }, '━━━'),
          React.createElement('div', { className: 'flex-1 bg-indigo-100/60 p-3 rounded-xl border-2 border-indigo-400 text-center font-bold text-indigo-950 shadow-inner' }, [
            React.createElement('div', { className: 'flex justify-between text-[11px] text-indigo-700 mb-1' }, [
              React.createElement('span', null, diagram.q1),
              React.createElement('span', { className: 'text-rose-600 font-black' }, diagram.median),
              React.createElement('span', null, diagram.q3)
            ]),
            React.createElement('div', { className: 'text-xs text-indigo-900 bg-white/80 py-1 rounded border border-indigo-200' }, diagram.iqr)
          ]),
          React.createElement('span', { className: 'text-slate-300' }, '━━━'),
          React.createElement('div', { className: 'text-center p-2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 shrink-0' }, [
            React.createElement('div', null, '상한 울타리'),
            React.createElement('div', { className: 'text-[11px]' }, diagram.upperFence)
          ])
        ])
      ]);
    }

    // Type 6: 프로세스 흐름도 (Flow / Pipeline)
    if (diagram.type === 'flow') {
      return React.createElement('div', { className: 'my-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-sm' }, [
        React.createElement('div', { className: 'text-xs font-extrabold text-indigo-700 tracking-wider uppercase mb-3' }, [
          '⚡ 프로세스 파이프라인 흐름도: ',
          diagram.title
        ]),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5' }, (diagram.steps || []).map((step, sIdx) => (
          React.createElement('div', {
            key: sIdx,
            className: 'p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1'
          }, [
            React.createElement('div', { className: 'flex items-center gap-2' }, [
              React.createElement('span', {
                className: 'px-2 py-0.5 rounded text-[11px] font-bold text-white shrink-0',
                style: { backgroundColor: step.color || '#4f46e5' }
              }, step.badge),
              React.createElement('span', { className: 'font-bold text-xs text-slate-900 truncate' }, step.title)
            ]),
            React.createElement('p', { className: 'text-xs text-slate-600 leading-snug pl-1' }, step.desc)
          ])
        )))
      ]);
    }

    // Type 7: 의사결정나무 및 덴드로그램 (Tree)
    if (diagram.type === 'tree') {
      return React.createElement('div', { className: 'my-4 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 shadow-sm' }, [
        React.createElement('div', { className: 'text-xs font-extrabold text-indigo-900 tracking-wider uppercase mb-3' }, [
          '🌳 계층 트리 노드 분할 도식: ',
          diagram.title
        ]),
        React.createElement('div', { className: 'space-y-3 max-w-lg mx-auto text-xs' }, [
          React.createElement('div', { className: 'p-3 bg-white rounded-xl border border-indigo-300 text-center font-bold text-indigo-900 shadow-sm' }, diagram.root),
          React.createElement('div', { className: 'text-center text-slate-400 font-bold' }, '↓ ' + diagram.split),
          React.createElement('div', { className: 'grid grid-cols-2 gap-3' }, (diagram.branches || []).map((b, bIdx) => (
            React.createElement('div', { key: bIdx, className: 'p-3 bg-white rounded-xl border border-slate-200 space-y-1' }, [
              React.createElement('div', { className: 'font-extrabold text-indigo-700 text-[11px]' }, b.cond),
              React.createElement('div', { className: 'text-slate-700' }, b.child),
              React.createElement('div', { className: 'font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]' }, b.leaf)
            ])
          )))
        ])
      ]);
    }

    // Type 8: 곡선 및 케이스 카드 (Curve / Cases)
    if (diagram.type === 'curve') {
      return React.createElement('div', { className: 'my-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm' }, [
        React.createElement('div', { className: 'text-xs font-extrabold text-slate-800 tracking-wider uppercase mb-3' }, [
          '📈 곡선 및 분포 비교 도식: ',
          diagram.title
        ]),
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-3' }, (diagram.cases || []).map((c, cIdx) => (
          React.createElement('div', { key: cIdx, className: 'p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1.5' }, [
            React.createElement('div', { className: 'font-bold text-xs text-slate-900', style: { color: c.color } }, c.type),
            React.createElement('div', { className: 'text-xs font-black text-indigo-900 bg-slate-100 p-1.5 rounded' }, c.formula),
            React.createElement('div', { className: 'text-[11px] text-slate-600' }, c.desc)
          ])
        )))
      ]);
    }

    return null;
  };

  // 2. Helper to render Comparison Tables (컬러 비교표)
  const renderComparisonTable = (table) => {
    if (!table || !table.headers || !table.rows) return null;
    return React.createElement('div', { className: 'my-4 overflow-x-auto rounded-xl border border-slate-200 shadow-sm' }, [
      React.createElement('table', { className: 'w-full text-left text-xs border-collapse' }, [
        React.createElement('thead', { className: 'bg-indigo-50/90 text-indigo-950 font-extrabold border-b border-indigo-200' }, [
          React.createElement('tr', null, table.headers.map((h, idx) => (
            React.createElement('th', { key: idx, className: 'p-3 whitespace-nowrap' }, h)
          )))
        ]),
        React.createElement('tbody', { className: 'divide-y divide-slate-100 bg-white font-sans' }, table.rows.map((row, rIdx) => (
          React.createElement('tr', { key: rIdx, className: rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60' }, row.map((cell, cIdx) => (
            React.createElement('td', {
              key: cIdx,
              className: `p-3 ${cIdx === 0 ? 'font-bold text-indigo-950 whitespace-nowrap bg-slate-50/30' : 'text-slate-700'}`
            }, cell)
          )))
        )))
      ])
    ]);
  };

  // Helper to render a complete single concept textbook page (5단계 교재 풀패키지)
  const renderTopicDetail = (topic, isScrollMode = false, pageNumber = null) => {
    if (!topic) return null;
    const sample = topic.examSample || topic.practiceQuestion;
    const metaphor = topic.metaphor || topic.analogy || '';
    const traps = topic.trapsAndTips || topic.examTrap || '';
    const isTopicRead = readTopics.includes(topic.id);
    const isTopicBookmarked = bookmarkedTopics.includes(topic.id);
    const isAnsVisible = isScrollMode ? selectedOptions[topic.id]?.showSolution : showSolution;

    return React.createElement('div', {
      key: topic.id,
      id: `topic-${topic.id}`,
      className: `bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${isScrollMode ? 'mb-10 page-break-after-always' : ''}`
    }, [
      // 1. Topic Header (머리말 & 단원 배지)
      React.createElement('div', { className: 'p-6 bg-slate-50/90 border-b border-slate-200' }, [
        React.createElement('div', { className: 'flex items-center justify-between gap-2 mb-2.5 flex-wrap' }, [
          React.createElement('div', { className: 'flex items-center gap-2' }, [
            React.createElement('span', { className: 'text-xs font-extrabold text-indigo-700 bg-indigo-100/80 px-3 py-1 rounded-full' }, topic.chapter),
            React.createElement('span', { className: 'text-xs font-mono text-slate-500 font-bold bg-slate-200/70 px-2 py-0.5 rounded' }, topic.id.toUpperCase()),
            pageNumber && React.createElement('span', { className: 'text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full' }, `PAGE ${pageNumber} / ${allTopics.length}`)
          ]),
          React.createElement('div', { className: 'flex items-center gap-2 print:hidden' }, [
            React.createElement('button', {
              onClick: () => toggleRead(topic.id),
              className: `text-xs px-3 py-1 rounded-lg font-bold border transition flex items-center gap-1 ${
                isTopicRead
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`
            }, isTopicRead ? '✓ 학습 완료' : '학습 완료 체크'),
            React.createElement('button', {
              onClick: () => toggleBookmark(topic.id),
              className: `text-xs px-3 py-1 rounded-lg font-bold border transition flex items-center gap-1 ${
                isTopicBookmarked
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`
            }, isTopicBookmarked ? '★ 북마크 해제' : '☆ 북마크')
          ])
        ]),
        React.createElement('h2', { className: 'text-xl sm:text-2xl font-black text-slate-900 mb-3 tracking-tight' }, topic.title),
        // Keywords chips
        React.createElement('div', { className: 'flex flex-wrap gap-1.5' }, [
          (topic.keywords || []).map(kw => (
            React.createElement('span', {
              key: kw,
              className: 'text-xs bg-slate-200/90 text-slate-800 px-2.5 py-0.5 rounded-md font-semibold'
            }, `#${kw}`)
          ))
        ])
      ]),

      // 5-Step Body Content
      React.createElement('div', { className: 'p-6 space-y-6' }, [
        // 1. One-Liner Box
        React.createElement('div', { className: 'rounded-xl bg-indigo-50/90 border border-indigo-200 p-4' }, [
          React.createElement('div', { className: 'text-xs font-black text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1.5' }, [
            '📌 1초 핵심 요약 (시험 직전 암기)'
          ]),
          React.createElement('div', { className: 'text-sm font-bold text-indigo-950 leading-relaxed' }, topic.oneLiner)
        ]),

        // 2. Visual Diagram (핵심 시각 도식 캔버스)
        renderVisualDiagram(topic.diagram),

        // 3. Comparison Table (구조화된 컬러 비교 정리 표)
        renderComparisonTable(topic.comparisonTable),

        // 4. Core Theory (상세 이론 및 수식 분해)
        React.createElement('div', { className: 'space-y-2' }, [
          React.createElement('h4', { className: 'text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5' }, [
            React.createElement('span', { className: 'w-2.5 h-2.5 rounded-full bg-indigo-600' }),
            '📚 교재형 체계적 핵심 이론'
          ]),
          React.createElement('div', { className: 'text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-200 font-sans' }, topic.coreTheory)
        ]),

        // 5. Metaphor (초보 눈높이 일상 비유)
        metaphor && React.createElement('div', { className: 'rounded-xl bg-teal-50/80 border border-teal-200 p-4.5' }, [
          React.createElement('div', { className: 'text-xs font-black text-teal-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5' }, [
            '☕ 초보 눈높이 일상 비유'
          ]),
          React.createElement('div', { className: 'text-sm text-teal-950 leading-relaxed italic font-medium' }, `"${metaphor}"`)
        ]),

        // 6. Traps and Tips (출제 포인트 & 함정 탈출 팁)
        traps && React.createElement('div', { className: 'rounded-xl bg-amber-50/80 border border-amber-200 p-4.5' }, [
          React.createElement('div', { className: 'text-xs font-black text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5' }, [
            '🎯 출제 포인트 & 시험 단골 함정 탈출 팁'
          ]),
          React.createElement('div', { className: 'text-sm text-amber-950 leading-relaxed whitespace-pre-line font-medium' }, traps)
        ]),

        // 7. Exam Sample (실전 기출 확인 예제)
        sample && React.createElement('div', { className: 'rounded-xl border border-indigo-200 bg-white p-5 shadow-sm' }, [
          React.createElement('div', { className: 'flex items-center justify-between mb-2.5 flex-wrap gap-2' }, [
            React.createElement('span', { className: 'text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded' }, '📝 대표 기출 확인 예제'),
            React.createElement('button', {
              onClick: () => {
                if (isScrollMode) {
                  setSelectedOptions(prev => ({
                    ...prev,
                    [topic.id]: {
                      ...(prev[topic.id] || {}),
                      showSolution: !prev[topic.id]?.showSolution
                    }
                  }));
                } else {
                  setShowSolution(!showSolution);
                }
              },
              className: 'text-xs text-indigo-600 hover:text-indigo-800 font-bold underline'
            }, isAnsVisible ? '해설 접기' : '정답 및 해설 확인')
          ]),
          React.createElement('div', { className: 'text-sm font-bold text-slate-900 mb-3 leading-snug' }, sample.question),
          React.createElement('div', { className: 'space-y-1.5 mb-3' }, [
            (sample.options || []).map((opt, oIdx) => {
              const isCorrectOpt = oIdx + 1 === sample.answer;
              const isSelectedByUser = selectedOptions[topic.id]?.choice === oIdx + 1;
              return React.createElement('div', {
                key: oIdx,
                onClick: () => {
                  setSelectedOptions(prev => ({
                    ...prev,
                    [topic.id]: {
                      choice: oIdx + 1,
                      showSolution: true
                    }
                  }));
                },
                className: `text-xs p-2.5 rounded-lg border cursor-pointer transition flex items-start gap-2 ${
                  isAnsVisible && isCorrectOpt
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                    : isAnsVisible && isSelectedByUser && !isCorrectOpt
                      ? 'bg-rose-50 border-rose-300 text-rose-950 line-through'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`
              }, [
                React.createElement('span', { className: 'font-bold shrink-0' }, `${oIdx + 1}번:`),
                React.createElement('span', null, opt)
              ]);
            })
          ]),
          isAnsVisible && React.createElement('div', { className: 'mt-3 pt-3 border-t border-slate-100 text-xs bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200 text-emerald-950 leading-relaxed' }, [
            React.createElement('div', { className: 'font-bold mb-1 text-emerald-800' }, `✓ 정답: ${sample.answer}번`),
            sample.solution || sample.explanation
          ])
        ])
      ]),

      // Card Mode Footer Navigation
      !isScrollMode && React.createElement('div', { className: 'p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden' }, [
        prevTopic
          ? React.createElement('button', {
              onClick: () => setSelectedTopicId(prevTopic.id),
              className: 'text-xs sm:text-sm font-medium text-slate-700 hover:text-indigo-600 flex items-center gap-1 p-2 rounded-lg hover:bg-white transition'
            }, [
              '← 이전:',
              React.createElement('span', { className: 'hidden sm:inline font-bold truncate max-w-[150px]' }, prevTopic.title)
            ])
          : React.createElement('div', null),
        nextTopic
          ? React.createElement('button', {
              onClick: () => setSelectedTopicId(nextTopic.id),
              className: 'text-xs sm:text-sm font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition'
            }, [
              '다음:',
              React.createElement('span', { className: 'hidden sm:inline font-bold truncate max-w-[150px]' }, nextTopic.title),
              '→'
            ])
          : React.createElement('div', { className: 'text-xs text-emerald-600 font-bold' }, '🎉 100개 전 단원 정복 완료!')
      ])
    ]);
  };

  return React.createElement('div', { className: 'min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans' }, [
    // Top Hero Banner
    React.createElement('div', { key: 'top-banner', className: 'bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900 text-white shadow-md print:hidden' }, [
      React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4' }, [
        React.createElement('div', null, [
          React.createElement('div', { className: 'flex items-center gap-2 mb-1.5 flex-wrap' }, [
            React.createElement('span', { className: 'bg-indigo-500/40 text-indigo-100 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30' }, '비전공자 단행본 교재판 v3.0'),
            React.createElement('span', { className: 'bg-emerald-500/30 text-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full' }, `총 ${allTopics.length}개 정규 토픽 (100페이지 분량)`),
            React.createElement('span', { className: 'bg-amber-500/30 text-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full' }, '시각 도식 & 비교표 100% 탑재')
          ]),
          React.createElement('h1', { className: 'text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2' }, [
            '📖 ADsP 비전공자 100선 개념 마스터북'
          ]),
          React.createElement('p', { className: 'text-indigo-200 text-sm mt-1' }, '활자본을 탈피한 5단계 교재 풀패키지(시각 도식화 + 컬러 비교표 + 이론 분해 + 일상 비유 + 기출 예제)')
        ]),
        React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' }, [
          React.createElement('button', {
            onClick: () => setShowPwaModal(true),
            className: 'flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-medium transition shadow-sm'
          }, [
            '📲 폰/태블릿 앱 설치 안내'
          ]),
          React.createElement('button', {
            onClick: handlePrint,
            className: 'flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-extrabold transition shadow-md'
          }, [
            '🖨️ PDF 100p 전권 인쇄/저장'
          ])
        ])
      ])
    ]),

    // Main Content
    React.createElement('div', { key: 'main-container', className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' }, [
      // Control bar
      React.createElement('div', { key: 'ctrl-bar', className: 'bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-6 print:hidden' }, [
        React.createElement('div', { className: 'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4' }, [
          // Subject filter pills & View mode switcher
          React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' }, [
            [
              { id: 'all', label: `전체 (${allTopics.length})` },
              { id: '1', label: `1과목 데이터 이해 (${allTopics.filter(t => t.subjectId === 1).length})` },
              { id: '2', label: `2과목 분석 기획 (${allTopics.filter(t => t.subjectId === 2).length})` },
              { id: '3', label: `3과목 데이터 분석 (${allTopics.filter(t => t.subjectId === 3).length})` }
            ].map(tab => (
              React.createElement('button', {
                key: tab.id,
                onClick: () => setSelectedSubject(tab.id),
                className: `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                  selectedSubject === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`
              }, tab.label)
            )),
            React.createElement('button', {
              onClick: () => setShowBookmarksOnly(!showBookmarksOnly),
              className: `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-1 ${
                showBookmarksOnly
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`
            }, [
              `★ 북마크 (${bookmarkedTopics.length})`
            ])
          ]),

          // Mode Switcher & Search
          React.createElement('div', { className: 'flex items-center gap-2 flex-wrap sm:flex-nowrap' }, [
            // Dual View Switcher
            React.createElement('div', { className: 'flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold' }, [
              React.createElement('button', {
                onClick: () => setViewMode('card'),
                className: `px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'card'
                    ? 'bg-white text-indigo-700 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }, '📄 1개념 카드'),
              React.createElement('button', {
                onClick: () => setViewMode('book'),
                className: `px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'book'
                    ? 'bg-white text-indigo-700 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }, '📜 100p 전권 스크롤')
            ]),

            // Search input
            React.createElement('div', { className: 'relative flex-1 sm:w-56' }, [
              React.createElement('input', {
                type: 'text',
                placeholder: '개념, 키워드, 도식 검색...',
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: 'w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              }),
              React.createElement('span', { className: 'absolute left-2.5 top-2 text-slate-400 text-xs' }, '🔍'),
              searchTerm && React.createElement('button', {
                onClick: () => setSearchTerm(''),
                className: 'absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs'
              }, '✕')
            ]),

            React.createElement('button', {
              onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen),
              className: 'lg:hidden px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200'
            }, isMobileMenuOpen ? '목차 닫기' : '목차 열기')
          ])
        ]),

        // Progress bar
        React.createElement('div', { className: 'mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2' }, [
          React.createElement('div', { className: 'flex items-center gap-2 flex-1 min-w-[240px]' }, [
            React.createElement('span', { className: 'font-semibold text-slate-700' }, `학습 진도: ${readTopics.length} / ${allTopics.length} 완료`),
            React.createElement('div', { className: 'flex-1 bg-slate-200 rounded-full h-2 overflow-hidden' }, [
              React.createElement('div', {
                className: 'bg-emerald-500 h-full transition-all duration-300',
                style: { width: `${progressPercent}%` }
              })
            ]),
            React.createElement('span', { className: 'font-bold text-emerald-600' }, `${progressPercent}%`)
          ]),
          React.createElement('span', { className: 'text-slate-400 text-[11px]' }, '💡 상단의 [100p 전권 스크롤]을 누르면 단행본 교재처럼 도식과 표를 연속 스크롤로 읽을 수 있습니다')
        ])
      ]),

      // Card Mode Layout (Sidebar + Single Detail)
      viewMode === 'card' && React.createElement('div', { key: 'card-view-grid', className: 'grid grid-cols-1 lg:grid-cols-12 gap-6' }, [
        // Sidebar (Table of Contents)
        React.createElement('div', {
          key: 'sidebar',
          className: `lg:col-span-4 space-y-4 print:hidden ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`
        }, [
          React.createElement('div', { className: 'bg-white rounded-2xl shadow-sm border border-slate-200 p-4 max-h-[850px] overflow-y-auto' }, [
            React.createElement('h3', { className: 'text-sm font-bold text-slate-800 mb-3 flex items-center justify-between' }, [
              React.createElement('span', null, `📚 전체 목차 (총 ${allTopics.length}개 토픽)`),
              React.createElement('span', { className: 'text-xs text-slate-500 font-normal' }, `${filteredTopics.length}개 표시`)
            ]),
            Object.keys(groupedByChapter).length === 0
              ? React.createElement('div', { className: 'text-center py-8 text-sm text-slate-400' }, '검색 조건과 일치하는 개념이 없습니다.')
              : Object.entries(groupedByChapter).map(([chapterName, topics]) => (
                  React.createElement('div', { key: chapterName, className: 'mb-4 last:mb-0' }, [
                    React.createElement('div', { className: 'text-xs font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-md mb-1.5 border-l-2 border-indigo-600' }, chapterName),
                    React.createElement('div', { className: 'space-y-1 pl-1' }, [
                      topics.map(t => {
                        const isSelected = currentTopic && currentTopic.id === t.id;
                        const isRead = readTopics.includes(t.id);
                        const isBookmarked = bookmarkedTopics.includes(t.id);
                        return React.createElement('div', {
                          key: t.id,
                          onClick: () => {
                            setSelectedTopicId(t.id);
                            setIsMobileMenuOpen(false);
                          },
                          className: `group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`
                        }, [
                          React.createElement('div', { className: 'flex items-center gap-2 truncate pr-1' }, [
                            React.createElement('span', {
                              onClick: (e) => {
                                e.stopPropagation();
                                toggleRead(t.id);
                              },
                              className: `w-4 h-4 rounded flex items-center justify-center text-[10px] border transition ${
                                isRead
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : isSelected
                                    ? 'border-indigo-300 text-transparent'
                                    : 'border-slate-300 text-transparent hover:border-slate-400'
                              }`
                            }, '✓'),
                            React.createElement('span', { className: 'truncate' }, t.title)
                          ]),
                          React.createElement('button', {
                            onClick: (e) => {
                              e.stopPropagation();
                              toggleBookmark(t.id);
                            },
                            className: `text-xs p-0.5 rounded hover:scale-110 transition ${
                              isBookmarked
                                ? isSelected ? 'text-amber-300' : 'text-amber-500'
                                : isSelected ? 'text-indigo-300 hover:text-white' : 'text-slate-300 hover:text-amber-400'
                            }`
                          }, isBookmarked ? '★' : '☆')
                        ]);
                      })
                    ])
                  ])
                ))
          ])
        ]),

        // Detail Pane
        React.createElement('div', {
          key: 'card-reading-pane',
          className: 'lg:col-span-8'
        }, [
          currentTopic ? renderTopicDetail(currentTopic, false, currentIndex + 1) : React.createElement('div', { className: 'bg-white rounded-2xl p-12 text-center text-slate-500' }, '개념을 선택해 주세요.')
        ])
      ]),

      // Book Mode Layout (Full Continuous Scroll of all 100 topics)
      viewMode === 'book' && React.createElement('div', { key: 'book-view-scroll', className: 'max-w-4xl mx-auto space-y-8' }, [
        React.createElement('div', { className: 'bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-900 flex items-center justify-between flex-wrap gap-2 sticky top-4 z-20 shadow-sm backdrop-blur-md' }, [
          React.createElement('div', null, [
            React.createElement('span', { className: 'font-extrabold' }, '📜 100선 전권 연속 스크롤 모드: '),
            `총 ${filteredTopics.length}개의 정밀 토픽이 단행본 교재처럼 연속으로 나열되어 있습니다.`
          ]),
          React.createElement('button', {
            onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            className: 'text-indigo-700 hover:text-indigo-900 font-bold underline'
          }, '맨 위로 이동 ↑')
        ]),
        filteredTopics.map((topic, idx) => (
          renderTopicDetail(topic, true, idx + 1)
        ))
      ])
    ]),

    // Print-Only Full Book View (@media print)
    React.createElement('div', {
      key: 'print-view',
      className: 'hidden print:block p-8 bg-white text-slate-900 font-sans'
    }, [
      // Cover Page
      React.createElement('div', { className: 'min-h-[90vh] flex flex-col justify-center items-center text-center border-b-4 border-indigo-600 mb-12 page-break-after-always' }, [
        React.createElement('h1', { className: 'text-4xl font-black text-slate-900 mb-4' }, 'ADsP 비전공자 100선 개념 마스터북'),
        React.createElement('p', { className: 'text-lg text-slate-600 mb-8 font-medium' }, '데이터분석 준전문가 전 범위 핵심 이론 & 함정 탈출 100선 정규 교재판'),
        React.createElement('div', { className: 'text-sm text-slate-500 border-t border-slate-300 pt-4 space-y-1' }, [
          React.createElement('div', null, '총 3과목 8대 대단원 · 100개 세부 정밀 토픽 완전 수록 (100페이지 규격)'),
          React.createElement('div', null, '5단계 풀패키지: 개념 도식화 · 컬러 비교표 · 체계적 이론 · 일상 비유 · 기출 함정 & 실전 예제')
        ])
      ]),
      // All Topics printed sequentially (100 pages, 1 topic per page)
      allTopics.map((topic, tIdx) => (
        React.createElement('div', {
          key: topic.id,
          className: 'mb-10 pb-8 border-b border-slate-200 page-break-after-always'
        }, [
          React.createElement('div', { className: 'flex justify-between items-center text-xs font-bold text-indigo-600 mb-1 border-b pb-1' }, [
            React.createElement('span', null, `${topic.chapter} [토픽 ${tIdx + 1}/${allTopics.length}]`),
            React.createElement('span', { className: 'font-mono text-slate-400' }, `PAGE ${tIdx + 1}`)
          ]),
          React.createElement('h2', { className: 'text-2xl font-bold text-slate-900 my-2' }, topic.title),
          React.createElement('div', { className: 'bg-slate-100 p-2.5 rounded font-bold text-xs mb-3 text-indigo-950' }, `📌 요약: ${topic.oneLiner}`),
          renderVisualDiagram(topic.diagram),
          renderComparisonTable(topic.comparisonTable),
          React.createElement('div', { className: 'text-xs whitespace-pre-line mb-3 font-sans leading-relaxed' }, topic.coreTheory),
          React.createElement('div', { className: 'bg-teal-50 border-l-4 border-teal-500 p-2.5 text-xs italic mb-2' }, `☕ 일상 비유: ${topic.metaphor || topic.analogy}`),
          React.createElement('div', { className: 'bg-amber-50 border-l-4 border-amber-500 p-2.5 text-xs mb-2 whitespace-pre-line' }, topic.trapsAndTips || topic.examTrap),
          (topic.examSample || topic.practiceQuestion) && React.createElement('div', { className: 'border border-slate-300 p-2.5 rounded text-xs bg-slate-50' }, [
            React.createElement('div', { className: 'font-bold mb-1' }, `[기출 예제] ${(topic.examSample || topic.practiceQuestion).question}`),
            React.createElement('div', { className: 'font-semibold text-indigo-700' }, `정답: ${(topic.examSample || topic.practiceQuestion).answer}번 - ${(topic.examSample || topic.practiceQuestion).solution || (topic.examSample || topic.practiceQuestion).explanation}`)
          ])
        ])
      ))
    ]),

    // PWA Mobile Install Modal
    showPwaModal && React.createElement('div', {
      key: 'pwa-modal',
      className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden',
      onClick: () => setShowPwaModal(false)
    }, [
      React.createElement('div', {
        className: 'bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95',
        onClick: (e) => e.stopPropagation()
      }, [
        React.createElement('div', { className: 'flex items-center justify-between border-b pb-3' }, [
          React.createElement('h3', { className: 'text-lg font-bold text-slate-900 flex items-center gap-2' }, [
            '📲 스마트폰 / 태블릿 앱 아이콘 설치법'
          ]),
          React.createElement('button', {
            onClick: () => setShowPwaModal(false),
            className: 'text-slate-400 hover:text-slate-600 text-lg font-bold'
          }, '✕')
        ]),
        React.createElement('p', { className: 'text-xs text-slate-600 leading-relaxed' }, '스마트폰이나 태블릿 바탕화면에 카카오톡처럼 진짜 앱 아이콘을 만들어 두고, 인터넷 없이도 전체화면으로 빠르게 공부할 수 있습니다.'),
        
        // iOS Guide
        React.createElement('div', { className: 'bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1' }, [
          React.createElement('div', { className: 'text-xs font-bold text-indigo-700 flex items-center gap-1.5' }, [
            '🍎 아이폰 / 아이패드 (Safari 기준)'
          ]),
          React.createElement('ol', { className: 'text-xs text-slate-700 space-y-1 pl-4 list-decimal' }, [
            React.createElement('li', null, '사파리(Safari)로 웹 링크(https://elijahcraig88.github.io/adsp-quiz-app/)에 접속합니다.'),
            React.createElement('li', null, '하단 중앙의 [공유 버튼(네모 위로 화살표)]을 누릅니다.'),
            React.createElement('li', null, '메뉴에서 [홈 화면에 추가]를 터치하면 바탕화면에 앱 아이콘이 생성됩니다!')
          ])
        ]),

        // Android Guide
        React.createElement('div', { className: 'bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1' }, [
          React.createElement('div', { className: 'text-xs font-bold text-emerald-700 flex items-center gap-1.5' }, [
            '🤖 갤럭시 / 안드로이드 태블릿 (Chrome 기준)'
          ]),
          React.createElement('ol', { className: 'text-xs text-slate-700 space-y-1 pl-4 list-decimal' }, [
            React.createElement('li', null, '크롬(Chrome) 브라우저로 웹 링크에 접속합니다.'),
            React.createElement('li', null, '우측 상단의 [더보기 메뉴(점 3개)]를 누릅니다.'),
            React.createElement('li', null, '[앱 설치] 또는 [홈 화면에 추가]를 누르면 바탕화면에 바로 설치됩니다!')
          ])
        ]),

        React.createElement('div', { className: 'pt-2 flex justify-end' }, [
          React.createElement('button', {
            onClick: () => setShowPwaModal(false),
            className: 'px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition'
          }, '확인 완료')
        ])
      ])
    ])
  ]);
};
