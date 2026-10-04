// ADsP Master App - Views & Components
// Contains DashboardView, ExamSelectView, ExamRunnerView, QuizCornerView, WrongNotesView, SearchView

// Helper: Format seconds to MM:SS
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// -------------------------------------------------------------------
// 1. DASHBOARD VIEW
// -------------------------------------------------------------------
function DashboardView({ exams, quizzes, examHistory, wrongCount, bookmarkCount, onStartExam, onNavigate }) {
  const latestExam = examHistory[0];
  const totalExamsTaken = examHistory.length;
  
  // Calculate average score
  const avgScore = totalExamsTaken > 0 
    ? Math.round(examHistory.reduce((sum, h) => sum + h.totalScore, 0) / totalExamsTaken)
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-6 sm:p-10 text-white shadow-xl shadow-indigo-500/20">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-100">
            <span>✨</span>
            <span>2026 ADsP 단기 합격 완성 솔루션 (v2.0 교재판)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            합격 기준 60점 & 과락 방지,<br />
            <span className="text-yellow-300">실전 기출 50문항</span>과 <span className="text-purple-200">초밀착 퀴즈</span>로 정복!
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            최신 48회부터 41회 및 역대 기출문제(총 16개 회차 / 800문항) 풀이, 즉시 해설 학습모드, 헷갈리는 함정 선지 OX 퀴즈, 초성 빈칸 암기장까지 한 곳에서 완벽 마스터하세요.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onStartExam('exam-48', 'real', 'all')}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-700 font-extrabold text-sm shadow-lg hover:bg-indigo-50 active:scale-95 transition-all flex items-center space-x-2"
            >
              <span>⏱️</span>
              <span>최신 48회 실전 모의고사 (90분)</span>
            </button>
            <button
              onClick={() => onNavigate('quiz-corner')}
              className="px-5 py-3 rounded-2xl bg-indigo-500/40 hover:bg-indigo-500/60 active:scale-95 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all flex items-center space-x-2"
            >
              <span>⚡</span>
              <span>단어 & 문장 퀴즈 코너</span>
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-20 top-5 w-48 h-48 rounded-full bg-purple-400/20 blur-2xl pointer-events-none"></div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">응시한 모의고사</span>
            <span className="text-xl">🏆</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
            {totalExamsTaken} <span className="text-sm font-semibold text-slate-500">회</span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            {latestExam ? `최근 점수: ${latestExam.totalScore}점 (${latestExam.isPass ? '합격' : '불합격'})` : '아직 응시 기록 없음'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">평균 취득 점수</span>
            <span className="text-xl">🎯</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
            {avgScore} <span className="text-sm font-semibold text-slate-500">점</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs">
            <span className={`inline-block w-2 h-2 rounded-full ${avgScore >= 60 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="font-medium text-slate-500 dark:text-slate-400">
              {avgScore >= 60 ? '합격 안정권 (60점 이상)' : '합격 커트라인(60점) 목표'}
            </span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('wrong-notes')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">복습할 오답 문제</span>
            <span className="text-xl group-hover:scale-110 transition-transform">❌</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
            {wrongCount} <span className="text-sm font-semibold text-slate-500">문항</span>
          </div>
          <div className="mt-2 text-xs text-rose-500 font-medium flex items-center space-x-1">
            <span>오답노트 복습하러 가기</span>
            <span>→</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('quiz-corner')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">단어/문장 퀴즈</span>
            <span className="text-xl group-hover:scale-110 transition-transform">💡</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
            {quizzes.oxQuizzes.length + quizzes.chosungQuizzes.length} <span className="text-sm font-semibold text-slate-500">개</span>
          </div>
          <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
            OX 및 초성 빈칸 퀴즈 풀기 →
          </div>
        </div>
      </div>

      {/* Exam Quick Launcher Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <span>📚</span>
              <span>추천 기출 회차 바로 풀기</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">원하는 회차를 선택하여 실전 모의고사 또는 즉시 해설 모드로 풀이하세요.</p>
          </div>
          <button 
            onClick={() => onNavigate('exam-select')}
            className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            전체 회차 보기 ({exams.length}개) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.slice(0, 3).map((exam) => (
            <div 
              key={exam.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {exam.badge}
                  </span>
                  <span className="text-xs font-medium text-slate-400">{exam.year}</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 mb-1.5 line-clamp-1">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {exam.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span>총 {exam.totalQuestions}문항</span>
                  <span>•</span>
                  <span>제한시간 {exam.timeLimitMinutes}분</span>
                  <span>•</span>
                  <span>100점 만점</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onStartExam(exam.id, 'real', 'all')}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow active:scale-95 transition-all text-center"
                >
                  ⏱️ 실전 모의고사
                </button>
                <button
                  onClick={() => onStartExam(exam.id, 'practice', 'all')}
                  className="py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 font-bold text-xs active:scale-95 transition-all text-center"
                >
                  💡 즉시 해설 학습
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADsP Exam Passing Guide Info Box */}
      <div className="bg-gradient-to-br from-slate-100 to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
          <span>📋</span>
          <span>ADsP 시험 구성 및 과락(40%) 합격 기준 안내</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">1과목 데이터 이해</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-bold">10문항</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              배점: 20점 (문항당 2점)<br />
              <strong className="text-rose-500">과락 기준: 8점 미만 (4문제 미만 정답 시 과락)</strong><br />
              주요내용: 데이터와 정보, DB, 빅데이터 가치와 위기요인
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400">2과목 데이터분석 기획</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-bold">10문항</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              배점: 20점 (문항당 2점)<br />
              <strong className="text-rose-500">과락 기준: 8점 미만 (4문제 미만 정답 시 과락)</strong><br />
              주요내용: 분석 마스터플랜, 과제발굴, 분석 거버넌스
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">3과목 데이터 분석</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-bold">30문항</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              배점: 60점 (문항당 2점)<br />
              <strong className="text-rose-500">과락 기준: 24점 미만 (12문제 미만 정답 시 과락)</strong><br />
              주요내용: R 통계, 회귀분석, 머신러닝, 시계열, 군집, 연관
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export for app.js
window.DashboardView = DashboardView;
