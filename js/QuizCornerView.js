// ADsP Master App - Quiz Corner View (4 Diverse Quiz Modes)
// 1. OX Quiz, 2. Chosung Blank Quiz, 3. Flashcards Flip, 4. Speed 4-choice Term Quiz

function QuizCornerView({ quizzes, flashcardStatus, onUpdateFlashcardStatus }) {
  // Active Sub-tab: 'ox', 'chosung', 'flashcard', 'speed'
  const [activeTab, setActiveTab] = useState('ox');

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Quiz Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>⚡</span>
            <span>단어 & 문장 퀴즈 코너</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            단답형 기출 문장, 빈출 함정 선지, 필수 키워드를 4가지 모드로 빈틈없이 암기하세요.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          {[
            { id: 'ox', label: '⭕❌ 기출 OX', count: (quizzes?.oxQuizzes || []).length },
            { id: 'chosung', label: '🔤 초성 빈칸', count: (quizzes?.chosungQuizzes || []).length },
            { id: 'flashcard', label: '🃏 플래시카드', count: (quizzes?.flashcards || []).length },
            { id: 'speed', label: '⚡ 스피드 용어', count: (quizzes?.speedQuizzes || []).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="opacity-75 text-[10px]">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Render Active Quiz Component */}
      {activeTab === 'ox' && <OXQuizSection oxList={quizzes?.oxQuizzes || []} />}
      {activeTab === 'chosung' && <ChosungQuizSection chosungList={quizzes?.chosungQuizzes || []} />}
      {activeTab === 'flashcard' && (
        <FlashcardSection 
          flashcards={quizzes?.flashcards || []} 
          flashcardStatus={flashcardStatus || {}}
          onUpdateStatus={onUpdateFlashcardStatus}
        />
      )}
      {activeTab === 'speed' && <SpeedQuizSection speedList={quizzes?.speedQuizzes || []} />}
    </div>
  );
}

// -------------------------------------------------------------------
// 1. OX QUIZ SECTION
// -------------------------------------------------------------------
function OXQuizSection({ oxList }) {
  const [index, setIndex] = useState(0);
  const [userChoice, setUserChoice] = useState(null); // true or false
  const [streak, setStreak] = useState(0);

  const current = oxList[index] || oxList[0];
  const isAnswered = userChoice !== null;
  const isCorrect = isAnswered && userChoice === current.isCorrect;

  const handleChoose = (choice) => {
    if (isAnswered) return;
    setUserChoice(choice);
    if (choice === current.isCorrect) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setUserChoice(null);
    setIndex(prev => (prev + 1) % oxList.length);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Progress & Streak Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
        <span>문항 {index + 1} / {oxList.length}</span>
        <div className="flex items-center space-x-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
          <span>🔥</span>
          <span>연속 정답: {streak}회</span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm text-center space-y-6">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          {current.subject === 1 ? '1과목 데이터 이해' : current.subject === 2 ? '2과목 데이터분석 기획' : '3과목 데이터 분석'}
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-relaxed max-w-xl mx-auto">
          "{current.statement}"
        </h3>

        {/* Big O and X Buttons */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
          <button
            onClick={() => handleChoose(true)}
            disabled={isAnswered}
            className={`py-6 rounded-3xl border-2 font-black text-3xl transition-all shadow-sm flex flex-col items-center justify-center space-y-1 ${
              isAnswered && current.isCorrect === true
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : isAnswered && userChoice === true && !isCorrect
                  ? 'border-rose-500 bg-rose-500 text-white'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <span>⭕</span>
            <span className="text-xs font-bold">참 (O)</span>
          </button>

          <button
            onClick={() => handleChoose(false)}
            disabled={isAnswered}
            className={`py-6 rounded-3xl border-2 font-black text-3xl transition-all shadow-sm flex flex-col items-center justify-center space-y-1 ${
              isAnswered && current.isCorrect === false
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : isAnswered && userChoice === false && !isCorrect
                  ? 'border-rose-500 bg-rose-500 text-white'
                  : 'border-slate-200 dark:border-slate-700 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            <span>❌</span>
            <span className="text-xs font-bold">거짓 (X)</span>
          </button>
        </div>

        {/* Detailed Explanation upon answer */}
        {isAnswered && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fadeIn text-left">
            <div className={`p-4 rounded-2xl border ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-center space-x-2 font-black text-sm mb-1">
                <span>{isCorrect ? '🎉 정답입니다!' : '❌ 아쉽네요! 오답입니다.'}</span>
                <span>(실제 정답: {current.isCorrect ? 'O' : 'X'})</span>
              </div>
              <p className="text-xs leading-relaxed opacity-95">
                {current.explanation}
              </p>
            </div>

            {current.tip && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-300 font-medium flex items-center space-x-2">
                <span>📌</span>
                <span><strong>핵심 포인트:</strong> {current.tip}</span>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all text-center"
            >
              다음 OX 문제 풀기 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// 2. CHOSUNG BLANK QUIZ SECTION
// -------------------------------------------------------------------
function ChosungQuizSection({ chosungList }) {
  const [index, setIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const current = chosungList[index] || chosungList[0];

  const handleCheck = () => {
    setIsRevealed(true);
  };

  const handleNext = () => {
    setIsRevealed(false);
    setShowHint(false);
    setInputVal('');
    setIndex(prev => (prev + 1) % chosungList.length);
  };

  const isMatched = inputVal.trim() === current.blankWord;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
        <span>초성 문항 {index + 1} / {chosungList.length}</span>
        <button
          onClick={() => setShowHint(prev => !prev)}
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
        >
          {showHint ? '힌트 숨기기' : '💡 힌트 보기'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          핵심 용어 빈칸 맞추기
        </div>

        {/* Sentence with Blank */}
        <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          {current.sentence.split('[ 빈칸 ]').map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block px-3 py-0.5 mx-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 font-black">
                  {isRevealed ? current.blankWord : `[ 초성: ${current.chosung} ]`}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 leading-relaxed animate-fadeIn">
            <strong>💡 단서 힌트:</strong> {current.hint}
          </div>
        )}

        {/* Input box */}
        {!isRevealed ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                placeholder={`정답 단어 입력 (초성: ${current.chosung})`}
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleCheck}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all shrink-0"
              >
                정답 확인
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              * 바로 정답을 확인하고 싶다면 빈칸 상태로 [정답 확인]을 누르세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className={`p-4 rounded-2xl border ${
              isMatched
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 text-indigo-900 dark:text-indigo-200'
            }`}>
              <div className="font-black text-sm mb-1">
                {isMatched ? '🎉 정확히 맞추셨습니다!' : '💡 정답 및 핵심 개념'}
              </div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 my-2">
                정답: {current.blankWord}
              </div>
              <p className="text-xs leading-relaxed opacity-95">
                {current.explanation}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all text-center"
            >
              다음 초성 퀴즈 풀기 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// 3. FLASHCARDS SECTION
// -------------------------------------------------------------------
function FlashcardSection({ flashcards, flashcardStatus, onUpdateStatus }) {
  const [subjectFilter, setSubjectFilter] = useState('all'); // 'all', 1, 2, 3
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'memorized', 'review'
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const filteredCards = useMemo(() => {
    return flashcards.filter(c => {
      const matchSubject = subjectFilter === 'all' || c.subject === Number(subjectFilter);
      const cardStat = flashcardStatus[c.id] || 'unmarked';
      const matchStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'memorized' 
          ? cardStat === 'memorized' 
          : cardStat === 'review' || cardStat === 'unmarked';
      return matchSubject && matchStatus;
    });
  }, [flashcards, subjectFilter, statusFilter, flashcardStatus]);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500">과목:</span>
          {[
            { id: 'all', label: '전체' },
            { id: 1, label: '1과목' },
            { id: 2, label: '2과목' },
            { id: 3, label: '3과목' },
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => setSubjectFilter(sub.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                subjectFilter === sub.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">상태:</span>
          {[
            { id: 'all', label: '전체 보기' },
            { id: 'review', label: '다시보기 🔁' },
            { id: 'memorized', label: '외웠어요 ✅' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        * 카드를 클릭하면 3D 회전하며 상세 정의와 시험 팁이 표시됩니다.
      </p>

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => {
          const isFlipped = flippedCards[card.id];
          const status = flashcardStatus[card.id];

          return (
            <div
              key={card.id}
              className="relative min-h-[220px] rounded-3xl cursor-pointer perspective-1000 select-none group"
              onClick={() => toggleFlip(card.id)}
            >
              <div className={`w-full h-full min-h-[220px] p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md ${
                isFlipped
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}>
                {/* Card Top Tag */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {card.subject}과목
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {isFlipped ? '뒤집기 ↺' : '클릭하여 해설 보기 ↻'}
                  </span>
                </div>

                {/* Card Body */}
                <div className="my-auto py-2">
                  {!isFlipped ? (
                    <div className="text-center">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-500 block mb-1">
                        핵심 용어
                      </span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-slate-100">
                        {card.term}
                      </h4>
                    </div>
                  ) : (
                    <div className="space-y-2 text-left animate-fadeIn">
                      <h5 className="font-extrabold text-sm text-indigo-700 dark:text-indigo-300">
                        {card.term}
                      </h5>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        {card.definition}
                      </p>
                      {card.tip && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium pt-1 border-t border-indigo-200/50 dark:border-indigo-800/50">
                          📌 {card.tip}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Bottom Controls */}
                <div 
                  className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800"
                  onClick={e => e.stopPropagation()} // Prevent card flip on button click
                >
                  <button
                    onClick={() => onUpdateStatus(card.id, 'review')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      status === 'review'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    다시보기 🔁
                  </button>
                  <button
                    onClick={() => onUpdateStatus(card.id, 'memorized')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      status === 'memorized'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    외웠어요 ✅
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// 4. SPEED 4-CHOICE TERM QUIZ SECTION
// -------------------------------------------------------------------
function SpeedQuizSection({ speedList }) {
  const [index, setIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [score, setScore] = useState(0);

  const current = speedList[index] || speedList[0];
  const isAnswered = selectedIdx !== null;
  const isCorrect = isAnswered && selectedIdx === current.answer;

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    if (idx === current.answer) {
      setScore(prev => prev + 10);
    }
  };

  const handleNext = () => {
    setSelectedIdx(null);
    setIndex(prev => (prev + 1) % speedList.length);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
        <span>스피드 문항 {index + 1} / {speedList.length}</span>
        <div className="text-indigo-600 dark:text-indigo-400 font-black text-sm">
          점수: {score}점
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
          {current.question}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {current.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isRight = idx === current.answer;

            let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-800 dark:text-slate-200';
            if (isAnswered) {
              if (isRight) {
                btnStyle = 'border-emerald-500 bg-emerald-500 text-white font-bold ring-2 ring-emerald-400';
              } else if (isSelected) {
                btnStyle = 'border-rose-500 bg-rose-500 text-white';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`p-4 rounded-2xl border text-sm font-bold transition-all text-left flex items-center space-x-3 ${btnStyle}`}
              >
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fadeIn">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              💡 <strong>해설:</strong> {current.explanation}
            </p>
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all text-center"
            >
              다음 문제 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

window.QuizCornerView = QuizCornerView;
