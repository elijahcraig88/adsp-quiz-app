// ADsP Master App - Full Search & Keyword Glossary View

function SearchView({ exams, quizzes, bookmarks, onToggleBookmark }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'questions', 'terms'
  const [expandedQId, setExpandedQId] = useState(null);

  // Search across questions
  const matchedQuestions = useMemo(() => {
    if (!query || !query.trim()) return [];
    const qLower = query.toLowerCase().trim();
    const results = [];
    (exams || []).forEach(exam => {
      (exam.questions || []).forEach(q => {
        const inQuestion = (q.question || '').toLowerCase().includes(qLower);
        const inOptions = (q.options || []).some(opt => (opt || '').toLowerCase().includes(qLower));
        const inExpl = (q.explanation || '').toLowerCase().includes(qLower);
        const inTip = q.coreTip ? q.coreTip.toLowerCase().includes(qLower) : false;
        if (inQuestion || inOptions || inExpl || inTip) {
          results.push(q);
        }
      });
    });
    return results;
  }, [exams, query]);

  // Search across flashcards & quizzes
  const matchedTerms = useMemo(() => {
    if (!query || !query.trim()) return [];
    const qLower = query.toLowerCase().trim();
    const cards = quizzes?.flashcards || [];
    return cards.filter(c => 
      (c.term || '').toLowerCase().includes(qLower) || 
      (c.definition || '').toLowerCase().includes(qLower) ||
      (c.tip && c.tip.toLowerCase().includes(qLower))
    );
  }, [quizzes, query]);

  // Popular search keywords
  const popularKeywords = [
    'CRISP-DM', '다중공선성', '이상치 IQR', '정상성 차분', 'ROC AUC', 
    '의사결정나무', '로지스틱 회귀', 'K-means', '향상도 Lift', '암묵지 형식지'
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      {/* Header & Search Bar */}
      <div className="text-center space-y-3 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-center space-x-2">
          <span>🔍</span>
          <span>ADsP 통합 검색 & 개념 사전</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          기출문제 800문항 (전 16개 회차), 상세 해설, 오답 분석, 핵심 용어 사전을 한 번에 검색하세요.
        </p>

        {/* Input */}
        <div className="relative max-w-xl mx-auto pt-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="검색어를 입력하세요 (예: ROC, 정상성, VIF, 암묵지)"
            className="w-full px-5 py-3.5 pl-12 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm shadow-sm focus:outline-none focus:border-indigo-500 transition-all"
          />
          <span className="absolute left-4 top-5 text-lg text-slate-400">🔍</span>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-4 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500"
            >
              지우기
            </button>
          )}
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">추천 검색:</span>
          {popularKeywords.map(kw => (
            <button
              key={kw}
              onClick={() => setQuery(kw)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              #{kw}
            </button>
          ))}
        </div>
      </div>

      {/* Category selector if results exist */}
      {query && (
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              전체 ({matchedQuestions.length + matchedTerms.length})
            </button>
            <button
              onClick={() => setActiveCategory('terms')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'terms'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              핵심 용어 ({matchedTerms.length})
            </button>
            <button
              onClick={() => setActiveCategory('questions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'questions'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              기출문제 ({matchedQuestions.length})
            </button>
          </div>
          <span className="text-xs text-slate-400">
            총 {matchedQuestions.length + matchedTerms.length}건 검색됨
          </span>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-6">
        {/* 1. Matched Terms */}
        {(activeCategory === 'all' || activeCategory === 'terms') && matchedTerms.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <span>📖</span>
              <span>핵심 용어 사전 결과 ({matchedTerms.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchedTerms.map(term => (
                <div
                  key={term.id}
                  className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                      {term.term}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
                      {term.subject}과목
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {term.definition}
                  </p>
                  {term.tip && (
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 pt-1 border-t border-slate-100 dark:border-slate-800 font-medium">
                      📌 {term.tip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Matched Questions */}
        {(activeCategory === 'all' || activeCategory === 'questions') && matchedQuestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <span>📝</span>
              <span>관련 기출문제 결과 ({matchedQuestions.length})</span>
            </h3>
            <div className="space-y-4">
              {matchedQuestions.map(q => {
                const isExpanded = expandedQId === q.id;
                const isBookmarked = bookmarks.includes(q.id);

                return (
                  <div
                    key={q.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {q.subjectName}
                      </span>
                      <button
                        onClick={() => onToggleBookmark(q.id)}
                        className="text-slate-400 hover:text-amber-500 text-sm"
                      >
                        {isBookmarked ? '⭐' : '☆'}
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {q.question}
                    </h4>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        정답: {q.answer + 1}번 ({q.options[q.answer]})
                      </span>
                      <button
                        onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {isExpanded ? '해설 닫기 ▲' : '상세 해설 보기 ▼'}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/20 p-5 rounded-3xl border border-indigo-200/80 dark:border-indigo-800/80 space-y-4 animate-fadeIn">
                        {/* 1. Core Explanation */}
                        <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-1.5 shadow-sm">
                          <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 flex items-center space-x-1.5">
                            <span className="w-4 h-4 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px]">💡</span>
                            <span>[1단계] 정답 핵심 원리 해설</span>
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium pl-0.5">
                            {q.explanation}
                          </p>
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
                                    <p className="text-xs leading-relaxed pl-0.5">
                                      {text}
                                    </p>
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
                              <p className="text-xs text-teal-950 dark:text-teal-100 leading-relaxed font-medium">
                                {q.conceptMetaphor}
                              </p>
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
                              <p className="text-xs text-amber-950 dark:text-amber-100 font-semibold leading-relaxed">
                                {q.coreTip}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty when searched but nothing found */}
        {query && matchedQuestions.length === 0 && matchedTerms.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-2">
            <div className="text-3xl">🔎</div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              "{query}"에 대한 검색 결과가 없습니다.
            </p>
            <p className="text-xs text-slate-400">
              다른 키워드(예: 회귀, 상관, 군집, 의사결정나무, 4V)로 검색해 보세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

window.SearchView = SearchView;
