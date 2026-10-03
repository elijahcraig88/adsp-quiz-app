// js/ConceptBookView.js
// 📖 비전공자 전용 ADsP 75개념 마스터북 (75페이지 밀도 완벽 수록 · 듀얼 뷰 모드 · PWA & PDF 인쇄)

window.ConceptBookView = function({ onNavigateToExam }) {
  const [selectedSubject, setSelectedSubject] = React.useState('all');
  const [selectedTopicId, setSelectedTopicId] = React.useState('c1-1');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = React.useState(false);
  const [showPwaModal, setShowPwaModal] = React.useState(false);
  const [showSolution, setShowSolution] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('card'); // 'card' (1개념 집중) | 'book' (전권 연속 스크롤)
  const [selectedOptions, setSelectedOptions] = React.useState({}); // { [topicId]: optionIndex }

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

  // Helper to render a single 4-step concept card
  const renderTopicDetail = (topic, isScrollMode = false) => {
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
      className: `bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${isScrollMode ? 'mb-8 page-break-after-always' : ''}`
    }, [
      // Topic Header
      React.createElement('div', { className: 'p-6 bg-slate-50/80 border-b border-slate-200' }, [
        React.createElement('div', { className: 'flex items-center justify-between gap-2 mb-2 flex-wrap' }, [
          React.createElement('div', { className: 'flex items-center gap-2' }, [
            React.createElement('span', { className: 'text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full' }, topic.chapter),
            React.createElement('span', { className: 'text-xs font-mono text-slate-400 font-semibold' }, topic.id.toUpperCase())
          ]),
          React.createElement('div', { className: 'flex items-center gap-2 print:hidden' }, [
            React.createElement('button', {
              onClick: () => toggleRead(topic.id),
              className: `text-xs px-2.5 py-1 rounded-md font-semibold border transition flex items-center gap-1 ${
                isTopicRead
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`
            }, isTopicRead ? '✓ 학습 완료' : '학습 완료 체크'),
            React.createElement('button', {
              onClick: () => toggleBookmark(topic.id),
              className: `text-xs px-2.5 py-1 rounded-md font-semibold border transition flex items-center gap-1 ${
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
              className: 'text-xs bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md font-medium'
            }, `#${kw}`)
          ))
        ])
      ]),

      // 4-Step Body Content
      React.createElement('div', { className: 'p-6 space-y-6' }, [
        // 1. One-Liner Box
        React.createElement('div', { className: 'rounded-xl bg-indigo-50/90 border border-indigo-100 p-4' }, [
          React.createElement('div', { className: 'text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1.5' }, [
            '📌 1초 핵심 요약'
          ]),
          React.createElement('div', { className: 'text-sm font-bold text-indigo-950 leading-relaxed' }, topic.oneLiner)
        ]),

        // 2. Core Theory
        React.createElement('div', { className: 'space-y-2' }, [
          React.createElement('h4', { className: 'text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-1.5' }, [
            React.createElement('span', { className: 'w-2 h-2 rounded-full bg-indigo-600' }),
            '📚 체계적 핵심 이론 & 시험 비교'
          ]),
          React.createElement('div', { className: 'text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-200 font-sans' }, topic.coreTheory)
        ]),

        // 3. Metaphor / Analogy Card
        metaphor && React.createElement('div', { className: 'rounded-xl bg-teal-50/80 border border-teal-200/80 p-4.5' }, [
          React.createElement('div', { className: 'text-xs font-bold text-teal-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5' }, [
            '☕ 초보 눈높이 일상 비유'
          ]),
          React.createElement('div', { className: 'text-sm text-teal-950 leading-relaxed italic' }, `"${metaphor}"`)
        ]),

        // 4. Traps and Tips
        traps && React.createElement('div', { className: 'rounded-xl bg-amber-50/80 border border-amber-200/80 p-4.5' }, [
          React.createElement('div', { className: 'text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5' }, [
            '🎯 출제 포인트 & 시험 함정 탈출 팁'
          ]),
          React.createElement('div', { className: 'text-sm text-amber-950 leading-relaxed whitespace-pre-line' }, traps)
        ]),

        // 5. Exam Sample Question Card
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
              className: 'text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline'
            }, isAnsVisible ? '해설 접기' : '정답 및 해설 보기')
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
          : React.createElement('div', { className: 'text-xs text-emerald-600 font-bold' }, '🎉 75개 모든 개념 학습 완료!')
      ])
    ]);
  };

  return React.createElement('div', { className: 'min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans' }, [
    // Top Hero Banner
    React.createElement('div', { key: 'top-banner', className: 'bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900 text-white shadow-md print:hidden' }, [
      React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4' }, [
        React.createElement('div', null, [
          React.createElement('div', { className: 'flex items-center gap-2 mb-1.5 flex-wrap' }, [
            React.createElement('span', { className: 'bg-indigo-500/40 text-indigo-100 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-400/30' }, '비전공자 전용 개념서'),
            React.createElement('span', { className: 'bg-emerald-500/30 text-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full' }, `총 ${allTopics.length}개 정밀 개념 수록 (75페이지+ 분량)`),
            React.createElement('span', { className: 'bg-amber-500/30 text-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-full' }, 'ADsP 전 범위 완벽 커버')
          ]),
          React.createElement('h1', { className: 'text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2' }, [
            '📖 ADsP 비전공자 개념 마스터북'
          ]),
          React.createElement('p', { className: 'text-indigo-200 text-sm mt-1' }, '두꺼운 수험서와 빈약한 17p 요약본의 한계를 깬 4단 콤보(1초 요약 + 핵심 이론 + 일상 비유 + 시험 함정 + 기출 예제) 완전 정복')
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
            className: 'flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold transition shadow-md'
          }, [
            '🖨️ PDF 75p 전권 인쇄/저장'
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
              }, '📜 75p 전권 스크롤')
            ]),

            // Search input
            React.createElement('div', { className: 'relative flex-1 sm:w-56' }, [
              React.createElement('input', {
                type: 'text',
                placeholder: '개념, 키워드 검색...',
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
          React.createElement('span', { className: 'text-slate-400 text-[11px]' }, '💡 상단의 [75p 전권 스크롤]을 누르면 단행본처럼 연속 스크롤로 한눈에 읽을 수 있습니다')
        ])
      ]),

      // Card Mode Layout (Sidebar + Single Detail)
      viewMode === 'card' && React.createElement('div', { key: 'card-view-grid', className: 'grid grid-cols-1 lg:grid-cols-12 gap-6' }, [
        // Sidebar (Table of Contents)
        React.createElement('div', {
          key: 'sidebar',
          className: `lg:col-span-4 space-y-4 print:hidden ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`
        }, [
          React.createElement('div', { className: 'bg-white rounded-2xl shadow-sm border border-slate-200 p-4 max-h-[800px] overflow-y-auto' }, [
            React.createElement('h3', { className: 'text-sm font-bold text-slate-800 mb-3 flex items-center justify-between' }, [
              React.createElement('span', null, '📚 전체 목차 (75개 토픽)'),
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
          currentTopic ? renderTopicDetail(currentTopic, false) : React.createElement('div', { className: 'bg-white rounded-2xl p-12 text-center text-slate-500' }, '개념을 선택해 주세요.')
        ])
      ]),

      // Book Mode Layout (Full Continuous Scroll of all 75 topics)
      viewMode === 'book' && React.createElement('div', { key: 'book-view-scroll', className: 'max-w-4xl mx-auto space-y-8' }, [
        React.createElement('div', { className: 'bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-900 flex items-center justify-between flex-wrap gap-2' }, [
          React.createElement('div', null, [
            React.createElement('span', { className: 'font-bold' }, '📜 전권 연속 스크롤 모드: '),
            `총 ${filteredTopics.length}개의 정밀 개념이 단행본처럼 연속으로 나열되어 있습니다.`
          ]),
          React.createElement('button', {
            onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            className: 'text-indigo-700 hover:text-indigo-900 font-bold underline'
          }, '맨 위로 이동 ↑')
        ]),
        filteredTopics.map((topic, idx) => (
          React.createElement('div', { key: topic.id }, [
            React.createElement('div', { className: 'text-xs text-slate-400 font-mono mb-1 font-bold' }, `PAGE ${idx + 1} / ${filteredTopics.length}`),
            renderTopicDetail(topic, true)
          ])
        ))
      ])
    ]),

    // Print-Only Full Book View (@media print)
    React.createElement('div', {
      key: 'print-view',
      className: 'hidden print:block p-8 bg-white text-slate-900'
    }, [
      // Cover Page
      React.createElement('div', { className: 'min-h-[90vh] flex flex-col justify-center items-center text-center border-b-4 border-indigo-600 mb-12 page-break-after-always' }, [
        React.createElement('h1', { className: 'text-4xl font-black text-slate-900 mb-4' }, 'ADsP 비전공자 개념 마스터북'),
        React.createElement('p', { className: 'text-lg text-slate-600 mb-8 font-medium' }, '데이터분석 준전문가 전 범위 핵심 이론 & 함정 탈출 75선 전자책'),
        React.createElement('div', { className: 'text-sm text-slate-500 border-t border-slate-300 pt-4 space-y-1' }, [
          React.createElement('div', null, '총 3과목 8대 대단원 · 75개 세부 정밀 토픽 완전 수록 (75페이지 분량)'),
          React.createElement('div', null, '4단 콤보: 1초 요약 · 체계적 이론 · 일상 비유 · 기출 함정 & 실전 예제')
        ])
      ]),
      // All Topics printed sequentially
      allTopics.map((topic, tIdx) => (
        React.createElement('div', {
          key: topic.id,
          className: 'mb-10 pb-8 border-b border-slate-200 page-break-after-always'
        }, [
          React.createElement('div', { className: 'text-xs font-bold text-indigo-600 mb-1' }, `${topic.chapter} [개념 ${tIdx + 1}/${allTopics.length}]`),
          React.createElement('h2', { className: 'text-2xl font-bold text-slate-900 mb-3' }, topic.title),
          React.createElement('div', { className: 'bg-slate-100 p-3 rounded font-semibold text-sm mb-3' }, `📌 요약: ${topic.oneLiner}`),
          React.createElement('div', { className: 'text-sm whitespace-pre-line mb-3 font-sans' }, topic.coreTheory),
          React.createElement('div', { className: 'bg-teal-50 border-l-4 border-teal-500 p-3 text-sm italic mb-3' }, `☕ 일상 비유: ${topic.metaphor || topic.analogy}`),
          React.createElement('div', { className: 'bg-amber-50 border-l-4 border-amber-500 p-3 text-sm mb-3 whitespace-pre-line' }, topic.trapsAndTips || topic.examTrap),
          (topic.examSample || topic.practiceQuestion) && React.createElement('div', { className: 'border border-slate-300 p-3 rounded text-xs' }, [
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
            React.createElement('li', null, '사파리(Safari)로 배포된 웹 링크(https://elijahcraig88.github.io/adsp-quiz-app/)에 접속합니다.'),
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
