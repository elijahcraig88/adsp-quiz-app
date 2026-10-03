// ADsP Master App - Exam Runner View (Core Solving Engine)
// Timed Exam, OMR Sheet, Immediate Feedback, Scoring, Pass/Fail Report

function ExamRunnerView({
  exam,
  mode,
  subjectFilter,
  bookmarks,
  onToggleBookmark,
  onAddWrongQuestion,
  onFinishExam,
  onExit
}) {
  // Filter questions based on subjectFilter
  const questions = useMemo(() => {
    if (!exam || !exam.questions) return [];
    if (subjectFilter === 'all') return exam.questions;
    return exam.questions.filter(q => q.subjectId === Number(subjectFilter));
  }, [exam, subjectFilter]);

  // Current question index (0-indexed)
  const [currentIndex, setCurrentIndex] = useState(0);

  // User answers mapping: { [questionId]: optionIndex }
  const [userAnswers, setUserAnswers] = useState({});

  // Practice mode: track which questions have shown explanation
  const [showExplanationMap, setShowExplanationMap] = useState({});

  // Exam timer (seconds remaining)
  const totalSeconds = (exam?.timeLimitMinutes || 90) * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // State: 'solving' | 'submitted'
  const [examStatus, setExamStatus] = useState('solving');
  const [examResult, setExamResult] = useState(null);

  // Timer effect (only in 'real' mode and when solving)
  useEffect(() => {
    if (mode !== 'real' || examStatus !== 'solving' || isTimerPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, examStatus, isTimerPaused]);

  const currentQ = questions[currentIndex] || questions[0];
  const isBookmarked = currentQ ? bookmarks.includes(currentQ.id) : false;

  // Select an option
  const handleSelectOption = (optIndex) => {
    if (examStatus === 'submitted') return; // Read-only after submit

    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIndex
    }));

    if (mode === 'practice') {
      setShowExplanationMap(prev => ({
        ...prev,
        [currentQ.id]: true
      }));

      // Check if wrong and record
      if (optIndex !== currentQ.answer) {
        onAddWrongQuestion(currentQ);
      }
    }
  };

  // Submit and grade the exam
  const handleSubmitExam = () => {
    let sub1Total = 0, sub1Correct = 0;
    let sub2Total = 0, sub2Correct = 0;
    let sub3Total = 0, sub3Correct = 0;
    const wrongList = [];

    questions.forEach(q => {
      const selected = userAnswers[q.id];
      const isCorrect = selected === q.answer;

      if (q.subjectId === 1) {
        sub1Total += 1;
        if (isCorrect) sub1Correct += 1;
      } else if (q.subjectId === 2) {
        sub2Total += 1;
        if (isCorrect) sub2Correct += 1;
      } else {
        sub3Total += 1;
        if (isCorrect) sub3Correct += 1;
      }

      if (!isCorrect) {
        wrongList.push(q);
      }
    });

    const sub1Score = sub1Correct * 2;
    const sub2Score = sub2Correct * 2;
    const sub3Score = sub3Correct * 2;
    const totalScore = sub1Score + sub2Score + sub3Score;

    // 과락 판정 (1과목 8점 이상, 2과목 8점 이상, 3과목 24점 이상)
    // When partial subject is tested, only check tested subjects
    const sub1Failed = sub1Total > 0 && sub1Score < (sub1Total * 2 * 0.4);
    const sub2Failed = sub2Total > 0 && sub2Score < (sub2Total * 2 * 0.4);
    const sub3Failed = sub3Total > 0 && sub3Score < (sub3Total * 2 * 0.4);
    const hasSubjectFailure = sub1Failed || sub2Failed || sub3Failed;

    const totalQuestionsTested = questions.length;
    const maxScore = totalQuestionsTested * 2;
    const percentage = Math.round((totalScore / maxScore) * 100);
    const isPass = percentage >= 60 && !hasSubjectFailure;

    const result = {
      examId: exam.id,
      examTitle: exam.title,
      date: new Date().toLocaleDateString('ko-KR'),
      totalScore,
      maxScore,
      percentage,
      isPass,
      hasSubjectFailure,
      sub1Score,
      sub1Total: sub1Total * 2,
      sub1Failed,
      sub2Score,
      sub2Total: sub2Total * 2,
      sub2Failed,
      sub3Score,
      sub3Total: sub3Total * 2,
      sub3Failed,
      timeSpent: totalSeconds - timeLeft,
      wrongQuestionsList: wrongList,
      userAnswers
    };

    setExamResult(result);
    setExamStatus('submitted');
    onFinishExam(result);
  };

  // Render Result Screen if submitted
  if (examStatus === 'submitted' && examResult) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Result Header Banner */}
        <div className={`rounded-3xl p-6 sm:p-10 text-white shadow-xl ${
          examResult.isPass
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 shadow-emerald-500/20'
            : 'bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-700 shadow-rose-500/20'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                <span>{examResult.isPass ? '🎉 축하합니다!' : '💪 조금만 더 복습해보세요!'}</span>
                <span>{exam.title}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black">
                {examResult.isPass ? '합격 (PASS)' : '불합격 (FAIL)'}
              </h1>
              <p className="text-sm opacity-90 max-w-lg">
                {examResult.isPass
                  ? `총점 ${examResult.totalScore}점(${examResult.percentage}%)으로 합격 기준(60점) 및 전 과목 과락(40%)을 여유롭게 통과하셨습니다!`
                  : examResult.hasSubjectFailure
                    ? '총점과 무관하게 한 과목 이상에서 40% 미만 득점으로 과락이 발생하였습니다. 취약 과목을 집중 복습하세요!'
                    : `총점 ${examResult.totalScore}점으로 60점 합격 커트라인에 아쉽게 미달하였습니다. 틀린 문제 해설을 확인하세요.`}
              </p>
            </div>

            {/* Score Badge */}
            <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-6 text-center min-w-[200px]">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-100">최종 득점</span>
              <div className="text-5xl font-black my-1">
                {examResult.totalScore}
                <span className="text-xl font-normal text-indigo-200">/{examResult.maxScore}</span>
              </div>
              <div className="text-xs font-semibold text-indigo-100">
                소요 시간: {formatTime(examResult.timeSpent)}
              </div>
            </div>
          </div>
        </div>

        {/* Subject Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">1과목 데이터 이해</span>
              {examResult.sub1Failed && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  과락 발생
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {examResult.sub1Score} <span className="text-sm font-normal text-slate-400">/ {examResult.sub1Total}점</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className={`h-full ${examResult.sub1Failed ? 'bg-rose-500' : 'bg-indigo-600'}`}
                style={{ width: `${examResult.sub1Total > 0 ? (examResult.sub1Score / examResult.sub1Total) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">과락 기준: 8점 미만 (4문제 미만 정답 시 과락)</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">2과목 데이터분석 기획</span>
              {examResult.sub2Failed && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  과락 발생
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {examResult.sub2Score} <span className="text-sm font-normal text-slate-400">/ {examResult.sub2Total}점</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className={`h-full ${examResult.sub2Failed ? 'bg-rose-500' : 'bg-purple-600'}`}
                style={{ width: `${examResult.sub2Total > 0 ? (examResult.sub2Score / examResult.sub2Total) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">과락 기준: 8점 미만 (4문제 미만 정답 시 과락)</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">3과목 데이터 분석</span>
              {examResult.sub3Failed && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  과락 발생
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {examResult.sub3Score} <span className="text-sm font-normal text-slate-400">/ {examResult.sub3Total}점</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className={`h-full ${examResult.sub3Failed ? 'bg-rose-500' : 'bg-blue-600'}`}
                style={{ width: `${examResult.sub3Total > 0 ? (examResult.sub3Score / examResult.sub3Total) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">과락 기준: 24점 미만 (12문제 미만 정답 시 과락)</p>
          </div>
        </div>

        {/* Buttons: Review Questions or Exit */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setExamStatus('review');
                setCurrentIndex(0);
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
            >
              📖 전체 50문항 정답 & 상세해설 보기
            </button>
            <button
              onClick={onExit}
              className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-sm"
            >
              목록으로 돌아가기
            </button>
          </div>
          <span className="text-xs text-slate-500">
            * 틀린 문제 {examResult.wrongQuestionsList.length}문항이 오답노트에 자동 등록되었습니다.
          </span>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="text-4xl">⚠️</div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">선택된 과목에 문제가 없습니다.</h3>
        <p className="text-xs text-slate-500">다른 과목을 선택하거나 목록으로 돌아가세요.</p>
        <button
          onClick={onExit}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md"
        >
          기출 회차 목록으로 이동
        </button>
      </div>
    );
  }

  // Active question layout (Both Solving and Review modes)
  const isReviewMode = examStatus === 'review';
  const selectedAnswer = userAnswers[currentQ.id];
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = isAnswered && selectedAnswer === currentQ.answer;
  const showExplanation = isReviewMode || (mode === 'practice' && showExplanationMap[currentQ.id]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Runner Bar */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Exam title & Question counter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onExit}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            ← 나가기
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {currentQ.subjectName}
            </span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              문제 {currentIndex + 1} <span className="text-xs font-normal text-slate-400">/ {questions.length}</span>
            </span>
          </div>
        </div>

        {/* Right: Timer / Finish Button / Bookmark */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          {mode === 'real' && !isReviewMode && (
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-sm font-black ${
              timeLeft <= 600 
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-300 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}>
              <span>⏱️</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          <button
            onClick={() => onToggleBookmark(currentQ.id)}
            className={`p-2 rounded-xl border transition-colors ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-500'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
            }`}
            title="문제 북마크"
          >
            {isBookmarked ? '⭐' : '☆'}
          </button>

          {!isReviewMode && (
            <button
              onClick={handleSubmitExam}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-sm transition-all"
            >
              제출 및 채점하기
            </button>
          )}

          {isReviewMode && (
            <button
              onClick={() => setExamStatus('submitted')}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
            >
              성적표로 돌아가기
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Left Question Card + Right OMR Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Question Card Area (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            {/* Question Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                Q{currentQ.number}.
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                배점 2점
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed mb-6 whitespace-pre-line">
              {currentQ.question}
            </h2>

            {/* 4 Choices */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectOption = idx === currentQ.answer;

                let optStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';
                
                if (showExplanation) {
                  // In explanation mode: Highlight correct option in green, wrong choice in red
                  if (isCorrectOption) {
                    optStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500 font-bold';
                  } else if (isSelected && !isCorrectOption) {
                    optStyle = 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 line-through';
                  }
                } else if (isSelected) {
                  optStyle = 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-200 ring-2 ring-indigo-500 font-bold';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isReviewMode}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start space-x-3 text-sm leading-relaxed ${optStyle}`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      showExplanation && isCorrectOption
                        ? 'bg-emerald-500 text-white'
                        : showExplanation && isSelected && !isCorrectOption
                          ? 'bg-rose-500 text-white'
                          : isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* In Practice Mode: Button to toggle explanation if answered */}
            {mode === 'practice' && !showExplanation && isAnswered && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowExplanationMap(prev => ({ ...prev, [currentQ.id]: true }))}
                  className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs"
                >
                  💡 정답 및 상세 해설 보기
                </button>
              </div>
            )}

            {/* Bottom Nav: Prev / Next */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ← 이전 문제
              </button>

              <span className="text-xs font-semibold text-slate-400">
                {currentIndex + 1} / {questions.length}
              </span>

              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white font-bold text-xs shadow-sm"
              >
                다음 문제 →
              </button>
            </div>
          </div>

          {/* Deep Detailed Explanation Box (When active) */}
          {showExplanation && (
            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-800/80 rounded-3xl p-6 sm:p-8 space-y-5 animate-fadeIn">
              {/* Answer result badge */}
              <div className="flex items-center justify-between pb-3 border-b border-indigo-200/60 dark:border-indigo-800/60">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                    isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {isCorrect ? '✓ 정답입니다!' : '✗ 오답입니다'}
                  </span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    정답: {currentQ.answer + 1}번 ({currentQ.options[currentQ.answer]})
                  </span>
                </div>
              </div>

              {/* 1. Core Explanation */}
              <div className="bg-white/80 dark:bg-slate-900/80 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm space-y-2">
                <h4 className="text-xs font-black uppercase text-indigo-700 dark:text-indigo-400 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs">💡</span>
                  <span>[1단계] 정답 핵심 원리 해설</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                  {currentQ.explanation}
                </p>
              </div>

              {/* 2. 1:1 Per-Option Flaw Analysis */}
              {currentQ.wrongOptionsAnalysis && Object.keys(currentQ.wrongOptionsAnalysis).length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-black uppercase text-rose-600 dark:text-rose-400 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs">❌</span>
                    <span>[2단계] 1~4번 선지 1:1 오답 격파 (왜 틀렸고, 어떻게 고쳐야 하는가)</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(currentQ.wrongOptionsAnalysis).map(([idxKey, desc]) => {
                      const optNum = Number(idxKey);
                      const isCorrectOpt = optNum === currentQ.answer;
                      const optText = currentQ.options && currentQ.options[optNum] ? currentQ.options[optNum] : '';
                      return (
                        <div 
                          key={idxKey} 
                          className={`p-3.5 rounded-2xl border text-xs leading-relaxed transition-all ${
                            isCorrectOpt
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                              : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                            <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                              isCorrectOpt 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-rose-500 text-white'
                            }`}>
                              {isCorrectOpt ? `✓ 정답 (${optNum + 1}번)` : `✗ 오답 (${optNum + 1}번)`}
                            </span>
                            {optText && (
                              <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[280px] sm:max-w-md">
                                "{optText}"
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-[13px] leading-relaxed pl-0.5">
                            {desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Easy Metaphor for Non-Majors */}
              {currentQ.conceptMetaphor && (
                <div className="pt-1">
                  <div className="bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/70 rounded-2xl p-4 flex items-start space-x-3">
                    <span className="text-2xl shrink-0 mt-0.5">🌱</span>
                    <div className="space-y-1">
                      <span className="text-xs font-black text-teal-800 dark:text-teal-300 block">
                        [3단계] 비전공자 눈높이 개념 비유
                      </span>
                      <p className="text-xs sm:text-sm text-teal-950 dark:text-teal-100 leading-relaxed font-medium">
                        {currentQ.conceptMetaphor}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Core Tip / 1-Second Exam Formula */}
              {currentQ.coreTip && (
                <div className="pt-1">
                  <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/70 rounded-2xl p-4 flex items-start space-x-3">
                    <span className="text-2xl shrink-0 mt-0.5">📌</span>
                    <div className="space-y-1">
                      <span className="text-xs font-black text-amber-800 dark:text-amber-300 block">
                        [4단계] 시험 직전 1초 암기 공식 & 함정 탈출 팁
                      </span>
                      <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 font-semibold leading-relaxed">
                        {currentQ.coreTip}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right OMR Sheet Area (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm sticky top-36">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">OMR 답안지</span>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-semibold">
                  {Object.keys(userAnswers).length} / {questions.length} 마킹
                </span>
              </div>
            </div>

            {/* OMR Button Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[480px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const marked = userAnswers[q.id];
                const isCurrent = currentIndex === idx;
                const isWrong = isReviewMode && marked !== q.answer;
                const isRight = isReviewMode && marked === q.answer;

                let btnStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';

                if (isReviewMode) {
                  btnStyle = isRight
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-rose-500 text-white border-rose-600';
                } else if (marked !== undefined) {
                  btnStyle = 'bg-indigo-600 text-white border-indigo-700 font-bold';
                }

                if (isCurrent) {
                  btnStyle += ' ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center ${btnStyle}`}
                  >
                    <span>{idx + 1}</span>
                    <span className="text-[10px] opacity-80">
                      {marked !== undefined ? `${marked + 1}번` : '-'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Submit button inside OMR */}
            {!isReviewMode && (
              <button
                onClick={handleSubmitExam}
                className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all text-center"
              >
                시험 완료 및 채점하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.ExamRunnerView = ExamRunnerView;
