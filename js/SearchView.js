// ADsP Master App - Full Search & Keyword Glossary Encyclopedia View

function SearchView({ exams, quizzes, bookmarks, onToggleBookmark }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'terms', 'concepts', 'questions'
  const [browseSubject, setBrowseSubject] = useState(0); // 0=전체, 1=1과목, 2=2과목, 3=3과목
  const [visibleTermCount, setVisibleTermCount] = useState(40);
  const [expandedQId, setExpandedQId] = useState(null);

  // Synonym & Acronym expansion dictionary so casual searches always match
  const SYNONYM_MAP = useMemo(() => ({
    'dw': ['데이터 웨어하우스', 'data warehouse', '웨어하우스'],
    'dm': ['데이터 마트', 'data mart'],
    'ods': ['운영 데이터 저장소', 'operational data store'],
    'oltp': ['온라인 트랜잭션', '트랜잭션 처리'],
    'olap': ['온라인 분석', '다차원 분석'],
    'eda': ['탐색적 데이터 분석', 'exploratory'],
    'pca': ['주성분', '차원 축소', '차원축소', 'prcomp'],
    'mds': ['다차원 척도법', '스트레스', 'stress'],
    'vif': ['다중공선성', '분산팽창'],
    'anova': ['분산분석', 'f-검정', 'f검정', 'aov'],
    'roc': ['auc', '민감도', '특이도', '재현율'],
    'auc': ['roc', '곡선 아래 면적'],
    'iqr': ['사분위수', '이상치', 'boxplot', '상자수염'],
    'esd': ['이상치', '3시그마', '표준편차'],
    'knn': ['최근접 이웃', '게으른 학습'],
    'svm': ['서포트 벡터', '마진', '초평면', '커널'],
    'som': ['자기조직화지도', '코호넨', '경쟁층'],
    'ann': ['인공신경망', '신경망', '퍼셉트론'],
    'mlp': ['다층 퍼셉트론', '은닉층'],
    'arima': ['시계열', '차분', '정상성', '자기회귀', '이동평균'],
    'acf': ['자기상관함수', 'pacf', '절단'],
    'pacf': ['편자기상관함수', 'acf', '절단'],
    'mcar': ['완전 무작위 결측', '결측치'],
    'mar': ['무작위 결측', '결측치'],
    'mnar': ['비무작위 결측', 'nmar', '결측치'],
    'seci': ['암묵지', '형식지', '공통화', '표출화', '연결화', '내면화'],
    'dikw': ['데이터', '정보', '지식', '지혜', '피라미드'],
    'crisp': ['crisp-dm', '업무 이해', '데이터 준비'],
    'kdd': ['데이터셋 선택', '전처리', '변환', '마이닝'],
    'lift': ['향상도', '연관규칙', '지지도', '신뢰도', '장바구니'],
    '향상도': ['lift', '지지도', '신뢰도', '연관'],
    '오즈': ['odds', '로지스틱', '로짓', 'logit'],
    '가지치기': ['pruning', '의사결정나무', '과적합'],
    '지니': ['gini', '불순도', 'cart', '의사결정나무'],
    '엔트로피': ['entropy', '불순도', 'c4.5', '정보이득'],
    '배깅': ['bagging', '부트스트랩', '랜덤 포레스트', '분산 감소'],
    '부스팅': ['boosting', '에이다부스트', 'gbm', 'xgboost', '편향 감소'],
    '정밀도': ['precision', '혼동행렬', '재현율'],
    '재현율': ['recall', '민감도', 'sensitivity'],
    '특이도': ['specificity', '위양성률'],
    '1종 오류': ['제1종 오류', '유의수준', '귀무가설'],
    '2종 오류': ['제2종 오류', '검정력', '귀무가설'],
    '과락': ['40%', '합격기준', '60점']
  }), []);

  // Multi-token smart matcher
  const matchesQuery = useCallback((targetText, rawQuery) => {
    if (!targetText || !rawQuery) return false;
    const hay = targetText.toLowerCase();
    const qClean = rawQuery.toLowerCase().trim();
    if (hay.includes(qClean)) return true;

    // Split by whitespace, commas, slashes, middle dots
    const tokens = qClean.split(/[\s,·/|+]+/).filter(Boolean);
    if (tokens.length === 0) return false;

    // Every token (or one of its synonyms) must appear in the target text
    return tokens.every(tok => {
      if (hay.includes(tok)) return true;
      const syns = SYNONYM_MAP[tok];
      if (syns && syns.some(s => hay.includes(s.toLowerCase()))) return true;
      return false;
    });
  }, [SYNONYM_MAP]);

  // Flatten Concept Book topics for search
  const conceptTopics = useMemo(() => {
    const cb = window.ADSP_CONCEPT_BOOK;
    if (!cb || !cb.subjects) return [];
    const list = [];
    cb.subjects.forEach(subj => {
      (subj.chapters || []).forEach(ch => {
        (ch.topics || []).forEach(tp => {
          list.push({
            ...tp,
            subjectId: subj.id,
            subjectTitle: subj.title,
            chapterTitle: ch.title
          });
        });
      });
    });
    return list;
  }, []);

  // Search across flashcards / glossary (673+ terms)
  const matchedTerms = useMemo(() => {
    const cards = quizzes?.flashcards || [];
    if (!query || !query.trim()) return [];
    return cards.filter(c => {
      const combined = `${c.term || ''} ${c.definition || ''} ${c.tip || ''} ${c.subject}과목`;
      return matchesQuery(combined, query);
    });
  }, [quizzes, query, matchesQuery]);

  // Search across Concept Book
  const matchedConcepts = useMemo(() => {
    if (!query || !query.trim()) return [];
    return conceptTopics.filter(tp => {
      const combined = `${tp.title || ''} ${tp.summary || ''} ${(tp.details || []).join(' ')} ${tp.examTrap || ''} ${tp.formula || ''}`;
      return matchesQuery(combined, query);
    });
  }, [conceptTopics, query, matchesQuery]);

  // Search across questions
  const matchedQuestions = useMemo(() => {
    if (!query || !query.trim()) return [];
    const results = [];
    (exams || []).forEach(exam => {
      (exam.questions || []).forEach(q => {
        const combined = `${q.question || ''} ${(q.options || []).join(' ')} ${q.explanation || ''} ${q.coreTip || ''}`;
        if (matchesQuery(combined, query)) {
          results.push({ ...q, examTitle: exam.round || exam.title });
        }
      });
    });
    return results;
  }, [exams, query, matchesQuery]);

  // Browseable glossary list when query is empty
  const browseTerms = useMemo(() => {
    const cards = quizzes?.flashcards || [];
    if (browseSubject === 0) return cards;
    return cards.filter(c => c.subject === browseSubject);
  }, [quizzes, browseSubject]);

  // Reset pagination when query or subject filter changes
  useEffect(() => {
    setVisibleTermCount(40);
  }, [query, browseSubject]);

  // Popular search keywords
  const popularKeywords = [
    'CRISP-DM', '다중공선성 VIF', '이상치 IQR', '정상성 차분', 'ROC AUC',
    '의사결정나무', '로지스틱 오즈', 'K-means', '향상도 Lift', '암묵지 표출화',
    '준비형 정착형', '제1종 오류', '더빈-왓슨', '주성분 PCA', '알고리즈미스트'
  ];

  const totalMatches = matchedTerms.length + matchedConcepts.length + matchedQuestions.length;

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      {/* Header & Search Bar */}
      <div className="text-center space-y-3 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-center space-x-2">
          <span>🔍</span>
          <span>ADsP 통합 검색 & 전 범위 용어사전</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          기출·모의고사 1,250문항 (전 25개 회차), 비전공자 개념 마스터북, 핵심 용어 백과사전 {(quizzes?.flashcards || []).length}개를 한 번에 검색하세요.
        </p>

        {/* Input */}
        <div className="relative max-w-xl mx-auto pt-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="단어·약어·초성·R함수 등 대충 입력해도 모두 검색됩니다 (예: VIF, 이상치 IQR, 표출화, glm)"
            className="w-full px-5 py-3.5 pl-12 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm shadow-sm focus:outline-none focus:border-indigo-500 transition-all"
          />
          <span className="absolute left-4 top-5 text-lg text-slate-400">🔍</span>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-4 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              초기화 ✕
            </button>
          )}
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">🔥 빈출 키워드:</span>
          {popularKeywords.map(kw => (
            <button
              key={kw}
              onClick={() => setQuery(kw)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                query === kw
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              #{kw}
            </button>
          ))}
        </div>
      </div>

      {/* DEFAULT BROWSE MODE: When query is empty, show full Glossary Encyclopedia */}
      {!query.trim() && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-indigo-100 uppercase tracking-wider">ADsP Complete Encyclopedia</div>
              <h2 className="text-lg font-black mt-0.5">📚 ADsP 전 과목 핵심 용어·공식·R함수 백과사전 ({browseTerms.length}개)</h2>
              <p className="text-xs text-indigo-100 mt-0.5">검색어를 입력하지 않아도 과목별 모든 필수 개념과 선지 빈출 용어를 한눈에 훑어볼 수 있습니다.</p>
            </div>
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {[
                { id: 0, label: `전체 (${(quizzes?.flashcards || []).length})` },
                { id: 1, label: '1과목 데이터 이해' },
                { id: 2, label: '2과목 분석 기획' },
                { id: 3, label: '3과목 데이터 분석' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setBrowseSubject(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    browseSubject === tab.id
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {browseTerms.slice(0, visibleTermCount).map(term => (
              <div
                key={term.id}
                className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-black text-sm text-indigo-600 dark:text-indigo-400 leading-snug">
                    {term.term}
                  </span>
                  <span className="shrink-0 text-[10px] bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-md font-bold">
                    {term.subject}과목
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  <MarkdownText content={term.definition} />
                </div>
                {term.tip && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 pt-1.5 border-t border-slate-100 dark:border-slate-800 font-medium flex items-start space-x-1">
                    <span>📌</span>
                    <span className="flex-1"><MarkdownText content={term.tip} className="inline" /></span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {visibleTermCount < browseTerms.length && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleTermCount(prev => prev + 60)}
                className="px-6 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 font-extrabold text-xs transition-all"
              >
                용어 더 보기 ({visibleTermCount} / {browseTerms.length}개 표시 중) ▼
              </button>
            </div>
          )}
        </div>
      )}

      {/* Category selector if query exists */}
      {query.trim() && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              전체 ({totalMatches})
            </button>
            <button
              onClick={() => setActiveCategory('terms')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'terms'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              핵심 용어사전 ({matchedTerms.length})
            </button>
            <button
              onClick={() => setActiveCategory('concepts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'concepts'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              개념 마스터북 ({matchedConcepts.length})
            </button>
            <button
              onClick={() => setActiveCategory('questions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'questions'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              기출·모의고사 ({matchedQuestions.length})
            </button>
          </div>
          <span className="text-xs text-slate-400">
            총 {totalMatches}건 검색됨
          </span>
        </div>
      )}

      {/* Search Results List */}
      {query.trim() && (
        <div className="space-y-6">
          {/* 1. Matched Terms */}
          {(activeCategory === 'all' || activeCategory === 'terms') && matchedTerms.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <span>📖</span>
                <span>핵심 용어 사전 결과 ({matchedTerms.length}건)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchedTerms.map(term => (
                  <div
                    key={term.id}
                    className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                        {term.term}
                      </span>
                      <span className="shrink-0 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
                        {term.subject}과목
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      <MarkdownText content={term.definition} />
                    </div>
                    {term.tip && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 pt-1 border-t border-slate-100 dark:border-slate-800 font-medium flex items-start space-x-1">
                        <span>📌</span>
                        <span className="flex-1"><MarkdownText content={term.tip} className="inline" /></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Matched Concept Book Topics */}
          {(activeCategory === 'all' || activeCategory === 'concepts') && matchedConcepts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <span>📘</span>
                <span>개념 마스터북 결과 ({matchedConcepts.length}건)</span>
              </h3>
              <div className="space-y-3">
                {matchedConcepts.map((tp, idx) => (
                  <div
                    key={tp.id || idx}
                    className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-5 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-black text-sm sm:text-base text-purple-700 dark:text-purple-300">
                        📚 {tp.title}
                      </span>
                      <span className="text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 px-2.5 py-0.5 rounded-lg">
                        {tp.subjectTitle} · {tp.chapterTitle}
                      </span>
                    </div>
                    {tp.summary && (
                      <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 px-3 py-2 rounded-xl">
                        💡 핵심 요약: {tp.summary}
                      </div>
                    )}
                    {tp.details && tp.details.length > 0 && (
                      <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 pl-4 list-disc leading-relaxed">
                        {tp.details.map((d, i) => (
                          <li key={i}><MarkdownText content={d} className="inline" /></li>
                        ))}
                      </ul>
                    )}
                    {tp.examTrap && (
                      <div className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 px-3 py-2 rounded-xl font-semibold">
                        🚨 시험 단골 함정: {tp.examTrap}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Matched Questions */}
          {(activeCategory === 'all' || activeCategory === 'questions') && matchedQuestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <span>📝</span>
                <span>관련 기출·모의고사 문제 결과 ({matchedQuestions.length}건)</span>
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
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {q.examTitle} #{q.number}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {q.subjectName}
                          </span>
                        </div>
                        <button
                          onClick={() => onToggleBookmark(q.id)}
                          className="text-slate-400 hover:text-amber-500 text-sm"
                        >
                          {isBookmarked ? '⭐' : '☆'}
                        </button>
                      </div>

                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                        <MarkdownText content={q.question} />
                      </div>

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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty when searched but nothing found */}
          {totalMatches === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-2">
              <div className="text-3xl">🔎</div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                "{query}"에 대한 검색 결과가 없습니다.
              </p>
              <p className="text-xs text-slate-400">
                다른 키워드(예: 회귀, 상관, 군집, 의사결정나무, 3V, 표출화, VIF)로 검색해 보세요.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

window.SearchView = SearchView;
