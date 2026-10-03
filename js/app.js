// ADsP Master App - Core Application Engine
// Handles Navigation, State, Exam Engine, Timer, Scoring, Quiz Corner, Notes, Search

// React hooks (useState, useEffect, useMemo, useRef) are declared globally at bundle top

// LocalStorage Keys
const STORAGE_KEYS = {
  THEME: 'adsp_theme',
  EXAM_HISTORY: 'adsp_exam_history',
  WRONG_QUESTIONS: 'adsp_wrong_questions',
  BOOKMARKS: 'adsp_bookmarks',
  FLASHCARD_STATUS: 'adsp_flashcard_status',
  SOLVED_QUIZZES: 'adsp_solved_quizzes',
  DAILY_STREAK: 'adsp_daily_streak'
};

// Helper: LocalStorage getter/setter
const storage = {
  get: (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn("Storage error", e);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }
};

// Confetti trigger helper
const triggerConfetti = () => {
  if (window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      window.confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      window.confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  }
};

// Main App Component
function App() {
  // Navigation tabs: 'dashboard', 'exam-select', 'exam-runner', 'practice', 'quiz-corner', 'wrong-notes', 'search'
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => storage.get(STORAGE_KEYS.THEME, 'light'));
  
  // Data sets from global window
  const exams = window.ADSP_EXAMS || [];
  const quizzes = window.ADSP_QUIZZES || { oxQuizzes: [], chosungQuizzes: [], flashcards: [], speedQuizzes: [] };
  
  // App state
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || 'exam-48');
  const [examMode, setExamMode] = useState('real'); // 'real' (timed with OMR) or 'practice' (immediate feedback)
  const [subjectFilter, setSubjectFilter] = useState('all'); // 'all', 1, 2, 3
  
  // Storage synchronized state
  const [wrongQuestions, setWrongQuestions] = useState(() => storage.get(STORAGE_KEYS.WRONG_QUESTIONS, []));
  const [bookmarks, setBookmarks] = useState(() => storage.get(STORAGE_KEYS.BOOKMARKS, []));
  const [examHistory, setExamHistory] = useState(() => storage.get(STORAGE_KEYS.EXAM_HISTORY, []));
  const [flashcardStatus, setFlashcardStatus] = useState(() => storage.get(STORAGE_KEYS.FLASHCARD_STATUS, {})); // { cardId: 'memorized' | 'review' }

  // Sync theme
  useEffect(() => {
    storage.set(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync collections
  useEffect(() => { storage.set(STORAGE_KEYS.WRONG_QUESTIONS, wrongQuestions); }, [wrongQuestions]);
  useEffect(() => { storage.set(STORAGE_KEYS.BOOKMARKS, bookmarks); }, [bookmarks]);
  useEffect(() => { storage.set(STORAGE_KEYS.EXAM_HISTORY, examHistory); }, [examHistory]);
  useEffect(() => { storage.set(STORAGE_KEYS.FLASHCARD_STATUS, flashcardStatus); }, [flashcardStatus]);

  // Toggle bookmark helper
  const toggleBookmark = (questionId) => {
    setBookmarks(prev => 
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    );
  };

  // Add to wrong questions helper
  const addWrongQuestion = (question) => {
    setWrongQuestions(prev => {
      if (prev.some(q => q.id === question.id)) return prev;
      return [question, ...prev];
    });
  };

  // Remove from wrong questions
  const removeWrongQuestion = (questionId) => {
    setWrongQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  // Record completed exam
  const handleExamFinish = (result) => {
    setExamHistory(prev => [result, ...prev]);
    // Auto-record wrong questions
    result.wrongQuestionsList.forEach(q => addWrongQuestion(q));
    if (result.isPass) {
      triggerConfetti();
    }
  };

  // Render navigation bar
  const renderNavbar = () => (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setCurrentTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 font-black text-xl tracking-tight">
              AD
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  ADsP 마스터
                </span>
                <span className="text-[10px] uppercase font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  2026 합격
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">데이터분석 준전문가 기출 & 퀴즈 풀패키지</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {[
              { id: 'dashboard', label: '대시보드', icon: '📊' },
              { id: 'concept-book', label: '개념 마스터북', icon: '📖' },
              { id: 'exam-select', label: '기출문제 풀이', icon: '📝' },
              { id: 'quiz-corner', label: '단어/문장 퀴즈', icon: '⚡' },
              { id: 'wrong-notes', label: '오답노트 & 북마크', icon: '📑', badge: wrongQuestions.length + bookmarks.length },
              { id: 'search', label: '검색 & 용어사전', icon: '🔍' },
            ].map(nav => (
              <button
                key={nav.id}
                onClick={() => setCurrentTab(nav.id)}
                className={`relative px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                  currentTab === nav.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{nav.icon}</span>
                <span>{nav.label}</span>
                {nav.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-rose-500 text-white leading-none">
                    {nav.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right controls: Theme toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="다크/라이트 모드 전환"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Mobile Nav Scrollbar */}
        <div className="flex md:hidden overflow-x-auto space-x-1 pb-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'dashboard', label: '홈' },
            { id: 'concept-book', label: '개념서' },
            { id: 'exam-select', label: '기출문제' },
            { id: 'quiz-corner', label: '퀴즈코너' },
            { id: 'wrong-notes', label: `오답(${wrongQuestions.length})` },
            { id: 'search', label: '검색사전' },
          ].map(nav => (
            <button
              key={nav.id}
              onClick={() => setCurrentTab(nav.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                currentTab === nav.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased flex flex-col">
      {renderNavbar()}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView 
            exams={exams}
            quizzes={quizzes}
            examHistory={examHistory}
            wrongCount={wrongQuestions.length}
            bookmarkCount={bookmarks.length}
            onStartExam={(examId, mode, subject) => {
              setSelectedExamId(examId);
              setExamMode(mode);
              setSubjectFilter(subject || 'all');
              setCurrentTab('exam-runner');
            }}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'concept-book' && (
          <ConceptBookView 
            onNavigateToExam={(subjectId) => {
              setSubjectFilter(subjectId || 'all');
              setCurrentTab('exam-select');
            }}
          />
        )}

        {currentTab === 'exam-select' && (
          <ExamSelectView 
            exams={exams}
            examHistory={examHistory}
            onSelectExam={(examId, mode, subject) => {
              setSelectedExamId(examId);
              setExamMode(mode);
              setSubjectFilter(subject || 'all');
              setCurrentTab('exam-runner');
            }}
          />
        )}

        {currentTab === 'exam-runner' && (
          <ExamRunnerView 
            exam={exams.find(e => e.id === selectedExamId) || exams[0]}
            mode={examMode}
            subjectFilter={subjectFilter}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            onAddWrongQuestion={addWrongQuestion}
            onFinishExam={handleExamFinish}
            onExit={() => setCurrentTab('exam-select')}
          />
        )}

        {currentTab === 'quiz-corner' && (
          <QuizCornerView 
            quizzes={quizzes}
            flashcardStatus={flashcardStatus}
            onUpdateFlashcardStatus={(id, status) => {
              setFlashcardStatus(prev => ({ ...prev, [id]: status }));
            }}
          />
        )}

        {currentTab === 'wrong-notes' && (
          <WrongNotesView 
            wrongQuestions={wrongQuestions}
            bookmarks={bookmarks}
            allExams={exams}
            onRemoveWrongQuestion={removeWrongQuestion}
            onToggleBookmark={toggleBookmark}
          />
        )}

        {currentTab === 'search' && (
          <SearchView 
            exams={exams}
            quizzes={quizzes}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ADsP 마스터 (데이터분석 준전문가 합격 퀴즈 & 기출 풀패키지)</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>100% 오프라인 & 자동 저장</span>
            </span>
            <span>과락 방지 (각 과목 40% 이상, 총점 60점 이상 합격)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

window.ADSP_APP = App;
