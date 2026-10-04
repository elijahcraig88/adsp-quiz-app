// ADsP Master App - Wrong Notes & Bookmarks View

function WrongNotesView({
  wrongQuestions,
  bookmarks,
  allExams,
  onRemoveWrongQuestion,
  onToggleBookmark
}) {
  const [activeTab, setActiveTab] = useState('wrong'); // 'wrong' or 'bookmark'
  const [subjectFilter, setSubjectFilter] = useState('all'); // 'all', 1, 2, 3
  const [expandedId, setExpandedId] = useState(null);

  // Retrieve bookmarked question objects from allExams
  const bookmarkedQuestions = useMemo(() => {
    const list = [];
    (allExams || []).forEach(exam => {
      (exam?.questions || []).forEach(q => {
        if (q && (bookmarks || []).includes(q.id) && !list.some(item => item.id === q.id)) {
          list.push(q);
        }
      });
    });
    return list;
  }, [allExams, bookmarks]);

  // Current active list
  const currentList = activeTab === 'wrong' ? (wrongQuestions || []) : bookmarkedQuestions;

  // Filtered by subject
  const filteredList = useMemo(() => {
    return (currentList || []).filter(q => {
      if (!q) return false;
      if (subjectFilter === 'all') return true;
      return q.subjectId === Number(subjectFilter);
    });
  }, [currentList, subjectFilter]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>📑</span>
            <span>오답노트 & 북마크 보관함</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            틀렸던 문제와 중요하다고 표시한 문제들을 완벽하게 내 것으로 만들 때까지 반복 복습하세요.
          </p>
        </div>

        {/* Tab switcher: Wrong vs Bookmark */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('wrong')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeTab === 'wrong'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>❌</span>
            <span>오답노트 ({wrongQuestions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmark')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeTab === 'bookmark'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>⭐</span>
            <span>북마크 ({bookmarkedQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-bold text-slate-500">과목 필터:</span>
        {[
          { id: 'all', label: '전체' },
          { id: 1, label: '1과목 데이터 이해' },
          { id: 2, label: '2과목 데이터분석 기획' },
          { id: 3, label: '3과목 데이터 분석' },
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setSubjectFilter(sub.id)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              subjectFilter === sub.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="text-4xl">🎉</div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {activeTab === 'wrong' ? '등록된 오답 문제가 없습니다!' : '북마크한 문제가 없습니다!'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {activeTab === 'wrong'
              ? '기출 모의고사나 즉시 해설 모드에서 틀린 문제가 이곳에 자동으로 기록됩니다.'
              : '문제를 풀면서 별표(☆)를 누르면 중요한 문제를 따로 모아볼 수 있습니다.'}
          </p>
        </div>
      ) : (
        /* Questions List */
        <div className="space-y-4">
          {filteredList.map((q) => {
            const isExpanded = expandedId === q.id;
            const isBookmarked = bookmarks.includes(q.id);

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {q.subjectName}
                    </span>
                    <span className="text-xs font-bold text-slate-400">문항 ID: {q.id}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleBookmark(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500"
                      title="북마크 토글"
                    >
                      {isBookmarked ? '⭐' : '☆'}
                    </button>
                    {activeTab === 'wrong' && (
                      <button
                        onClick={() => onRemoveWrongQuestion(q.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                        title="완벽히 이해했으므로 오답노트에서 제외"
                      >
                        ✓ 이제 알아요! (삭제)
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                  <MarkdownText content={q.question} />
                </div>

                {/* Options preview with correct answer highlight */}
                <div className="space-y-1.5">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl text-xs flex items-start space-x-2 ${
                        oIdx === q.answer
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold bg-white/60 dark:bg-black/30">
                        {oIdx + 1}
                      </span>
                      <span className="flex-1">
                        <MarkdownText content={opt} className="inline" />
                      </span>
                      {oIdx === q.answer && <span className="ml-auto text-[10px] text-emerald-600">✓ 정답</span>}
                    </div>
                  ))}
                </div>

                {/* Toggle Details Button */}
                <div className="pt-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <span>{isExpanded ? '▲ 상세 해설 및 오답 분석 닫기' : '▼ 상세 해설 및 오답 분석 보기'}</span>
                  </button>
                </div>

                {/* Expanded Detailed Explanation Box */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fadeIn">
                    <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/20 p-5 rounded-3xl border border-indigo-200/80 dark:border-indigo-800/80 space-y-4">
                      {/* 1. Core Explanation */}
                      <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-1.5 shadow-sm">
                        <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 flex items-center space-x-1.5">
                          <span className="w-4 h-4 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px]">💡</span>
                          <span>[1단계] 정답 핵심 원리 해설</span>
                        </span>
                        <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium pl-0.5">
                          <MarkdownText content={q.explanation} />
                        </div>
                      </div>

                      {/* 2. 1:1 Per-Option Flaw Analysis */}
                      {q.wrongOptionsAnalysis && Object.keys(q.wrongOptionsAnalysis).length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                            <span className="w-4 h-4 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-[10px]">❌</span>
                            <span>[2단계] 1~4번 선지 1:1 오답 격파 (틀린 이유 & 올바른 내용)</span>
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {Object.entries(q.wrongOptionsAnalysis).map(([k, text]) => {
                              const optNum = Number(k);
                              const isCorrectOpt = optNum === q.answer;
                              const optText = q.options && q.options[optNum] ? q.options[optNum] : '';
                              return (
                                <div 
                                  key={k} 
                                  className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                                    isCorrectOpt
                                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                                      : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 mb-1 flex-wrap">
                                    <span className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
                                      isCorrectOpt ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                                    }`}>
                                      {isCorrectOpt ? `✓ 정답 (${optNum + 1}번)` : `✗ 오답 (${optNum + 1}번)`}
                                    </span>
                                    {optText && (
                                      <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-xs">
                                        "{optText}"
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs leading-relaxed pl-0.5">
                                    <MarkdownText content={text} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 3. Easy Metaphor for Non-Majors */}
                      {q.conceptMetaphor && (
                        <div className="bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/70 rounded-2xl p-3.5 flex items-start space-x-2.5">
                          <span className="text-lg shrink-0 mt-0.5">🌱</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-teal-800 dark:text-teal-300 block">
                              [3단계] 비전공자 눈높이 개념 비유
                            </span>
                            <div className="text-xs text-teal-950 dark:text-teal-100 leading-relaxed font-medium">
                              <MarkdownText content={q.conceptMetaphor} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. Core Tip */}
                      {q.coreTip && (
                        <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/70 rounded-2xl p-3.5 flex items-start space-x-2.5">
                          <span className="text-lg shrink-0 mt-0.5">📌</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-amber-800 dark:text-amber-300 block">
                              [4단계] 시험 직전 1초 암기 공식 & 함정 탈출 팁
                            </span>
                            <div className="text-xs text-amber-950 dark:text-amber-100 font-semibold leading-relaxed">
                              <MarkdownText content={q.coreTip} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.WrongNotesView = WrongNotesView;
