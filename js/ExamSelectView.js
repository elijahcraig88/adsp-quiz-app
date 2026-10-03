// ADsP Master App - Exam Select View

function ExamSelectView({ exams, examHistory, onSelectExam }) {
  const [examCategory, setExamCategory] = useState('all'); // 'all', 'sina', 'latest', 'past'
  const [selectedMode, setSelectedMode] = useState('real'); // 'real' or 'practice'
  const [selectedSubject, setSelectedSubject] = useState('all'); // 'all', 1, 2, 3

  const filteredExams = useMemo(() => {
    let list = exams;
    if (examCategory === 'sina') {
      list = exams.filter(e => e.id.includes('sina'));
    } else if (examCategory === 'latest') {
      list = exams.filter(e => {
        const num = parseInt(e.id.replace('exam-', ''));
        return num >= 41 && num <= 48;
      });
    } else if (examCategory === 'past') {
      list = exams.filter(e => {
        const num = parseInt(e.id.replace('exam-', ''));
        return (num >= 35 && num <= 40) || (e.id.includes('mock') && !e.id.includes('sina'));
      });
    }
    return list;
  }, [exams, examCategory]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>📝</span>
            <span>실전 기출문제 & 모의고사</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            원하는 회차와 학습 모드를 선택하여 문제를 풀이하세요. (총 {exams.length}개 회차 / {exams.reduce((s, e) => s + (e.questions?.length || 0), 0)}문항 완벽 수록)
          </p>
        </div>

        {/* Global Study Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Selector */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedMode('real')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                selectedMode === 'real'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>⏱️</span>
              <span>실전 시험모드 (90분)</span>
            </button>
            <button
              onClick={() => setSelectedMode('practice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                selectedMode === 'practice'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>💡</span>
              <span>즉시 해설모드</span>
            </button>
          </div>

          {/* Subject Filter */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {[
              { id: 'all', label: '전체 (50문항)' },
              { id: 1, label: '1과목 (10문)' },
              { id: 2, label: '2과목 (10문)' },
              { id: 3, label: '3과목 (30문)' },
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSubject === sub.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {[
          { id: 'all', label: `전체 기출 (${exams.length}회차)`, badge: null },
          { id: 'sina', label: '📚 시나공 전용 실전 기출관 (6회)', badge: '교재 100% 매칭' },
          { id: 'latest', label: '🔥 최신 실전 기출 (48~41회)', badge: '2024~2026' },
          { id: 'past', label: '역대 기출 (40~35회 + 모의)', badge: null },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setExamCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              examCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>{cat.label}</span>
            {cat.badge && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${examCategory === cat.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
                {cat.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => {
          // Check if this exam has been solved before
          const historyForThisExam = examHistory.filter(h => h.examId === exam.id);
          const bestScore = historyForThisExam.length > 0 
            ? Math.max(...historyForThisExam.map(h => h.totalScore))
            : null;

          return (
            <div
              key={exam.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800">
                    {exam.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{exam.year}</span>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                  {exam.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {exam.description}
                </p>

                {/* Exam Metadata */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 space-y-2 mb-4 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>문항 구성</span>
                    <span className="font-bold">
                      {selectedSubject === 'all' 
                        ? '총 50문항 (1·2·3과목 전원)' 
                        : (selectedSubject === 1 ? '1과목 데이터 이해 (10문항)' : selectedSubject === 2 ? '2과목 데이터분석 기획 (10문항)' : '3과목 데이터 분석 (30문항)')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>제한 시간</span>
                    <span className="font-bold">{selectedMode === 'real' ? `${exam.timeLimitMinutes}분` : '제한 없음 (자율)'}</span>
                  </div>
                  {bestScore !== null && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>내 최고 점수</span>
                      <span className={`font-black ${bestScore >= 60 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {bestScore}점 ({bestScore >= 60 ? '합격' : '불합격'})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => onSelectExam(exam.id, selectedMode, selectedSubject)}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md hover:shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center space-x-2"
                >
                  <span>{selectedMode === 'real' ? '⏱️ 실전 모의고사 응시하기' : '💡 즉시 해설 학습 시작'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.ExamSelectView = ExamSelectView;
