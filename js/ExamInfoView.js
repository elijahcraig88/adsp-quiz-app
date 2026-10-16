// ADsP Master App - Official Exam Guide & Interactive Score Simulator View

function ExamInfoView() {
  // Interactive Score Calculator State (Question counts answered correctly)
  const [s1Correct, setS1Correct] = useState(7); // out of 10
  const [s2Correct, setS2Correct] = useState(7); // out of 10
  const [s3Correct, setS3Correct] = useState(18); // out of 30

  const s1Score = s1Correct * 2; // max 20, cutoff < 8 (4 questions)
  const s2Score = s2Correct * 2; // max 20, cutoff < 8 (4 questions)
  const s3Score = s3Correct * 2; // max 60, cutoff < 24 (12 questions)
  const totalScore = s1Score + s2Score + s3Score;

  const s1Cutoff = s1Score < 8;
  const s2Cutoff = s2Score < 8;
  const s3Cutoff = s3Score < 24;
  const anyCutoff = s1Cutoff || s2Cutoff || s3Cutoff;
  const isPass = totalScore >= 60 && !anyCutoff;

  const schedule2026 = [
    {
      round: '제48회',
      applyPeriod: '2026. 01. 19 (월) ~ 01. 23 (금)',
      examDate: '2026. 02. 21 (토) 10:00',
      prelimDate: '2026. 03. 06 (금)',
      finalDate: '2026. 03. 20 (금)',
      badge: '상반기 1차'
    },
    {
      round: '제49회',
      applyPeriod: '2026. 04. 13 (월) ~ 04. 17 (금)',
      examDate: '2026. 05. 16 (토) 10:00',
      prelimDate: '2026. 05. 29 (금)',
      finalDate: '2026. 06. 12 (금)',
      badge: '상반기 2차'
    },
    {
      round: '제50회',
      applyPeriod: '2026. 07. 13 (월) ~ 07. 17 (금)',
      examDate: '2026. 08. 15 (토) 10:00',
      prelimDate: '2026. 08. 28 (금)',
      finalDate: '2026. 09. 11 (금)',
      badge: '하반기 1차'
    },
    {
      round: '제51회',
      applyPeriod: '2026. 10. 05 (월) ~ 10. 09 (금)',
      examDate: '2026. 11. 07 (토) 10:00',
      prelimDate: '2026. 11. 20 (금)',
      finalDate: '2026. 12. 04 (금)',
      badge: '하반기 2차'
    }
  ];

  const passRateHistory = [
    { year: '2021년 (제28~31회)', applicants: '약 38,000명', passRate: '46.2%', trend: '비전공자 응시 급증 시기' },
    { year: '2022년 (제32~35회)', applicants: '약 51,000명', passRate: '42.8%', trend: '3과목 계산·응용 문항 강화' },
    { year: '2023년 (제36~39회)', applicants: '약 64,000명', passRate: '39.5%', trend: '지엽적 개념·R 결과 해석 심화' },
    { year: '2024년 (제40~43회)', applicants: '약 75,000명', passRate: '43.1%', trend: '단답형 폐지 → 전 문항 객관식 50문항 개편' },
    { year: '2025~2026년 최근 추세', applicants: '연 85,000명+', passRate: '35% ~ 45% 내외', trend: '단순 암기 지양, 선지 함정 및 실무 복합형 출제' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs font-extrabold backdrop-blur-sm">
            <span>ℹ️ 국가공인 데이터분석 준전문가 (ADsP) 공식 시험 가이드</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            ADsP 시험 기본 정보 & 합격 전략 총정리
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl leading-relaxed">
            한국데이터산업진흥원(K-Data)이 주관하는 국가공인 민간자격시험(제2014-01호) ADsP의 시행 횟수, 연간 시험 일정, 시험 시간, 합격/과락 기준, 역대 합격률 및 응시료를 한눈에 확인하세요.
          </p>
        </div>

        {/* Top 5 Quick Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5">
            <div className="text-[11px] text-indigo-200 font-bold">매년 시행 횟수</div>
            <div className="text-lg sm:text-xl font-black mt-0.5">연 4회 정기</div>
            <div className="text-[10px] text-indigo-200 mt-0.5">2월 · 5월 · 8월 · 11월</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5">
            <div className="text-[11px] text-indigo-200 font-bold">시험 시간</div>
            <div className="text-lg sm:text-xl font-black mt-0.5">총 90분</div>
            <div className="text-[10px] text-indigo-200 mt-0.5">10:00~11:30 (09:30 입실)</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5">
            <div className="text-[11px] text-indigo-200 font-bold">문항 수 / 형태</div>
            <div className="text-lg sm:text-xl font-black mt-0.5">객관식 50문항</div>
            <div className="text-[10px] text-indigo-200 mt-0.5">4지선다 (단답형 폐지!)</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5">
            <div className="text-[11px] text-indigo-200 font-bold">합격 & 과락 기준</div>
            <div className="text-lg sm:text-xl font-black mt-0.5">총점 60점 이상</div>
            <div className="text-[10px] text-amber-300 font-bold mt-0.5">과목별 40% 미만 과락</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-indigo-200 font-bold">응시료 / 자격</div>
            <div className="text-lg sm:text-xl font-black mt-0.5">50,000원</div>
            <div className="text-[10px] text-indigo-200 mt-0.5">학력·경력 응시제한 없음</div>
          </div>
        </div>
      </div>

      {/* Section 1: 과목별 문항 수 · 배점 · 과락 기준표 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <span>📊</span>
              <span>과목별 문항 수 · 배점 · 합격 및 과락 기준</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              제40회(2024년)부터 주관식 단답형(10문항)이 전면 폐지되고 전 문항 4지선다 객관식(문항당 2점, 총 50문항 100점 만점)으로 개편되었습니다.
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
            ✓ 문항당 각 2점 · 총 100점 만점
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 rounded-tl-xl">과목명</th>
                <th className="py-3 px-4">주요 출제 단원</th>
                <th className="py-3 px-4 text-center">문항 수</th>
                <th className="py-3 px-4 text-center">배점 (만점)</th>
                <th className="py-3 px-4 text-center rounded-tr-xl">과락 면제 기준 (40% 이상)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-black text-indigo-600 dark:text-indigo-400">1과목: 데이터 이해</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">데이터의 이해(DIKW, DB, DW/Lake), 데이터의 가치와 미래(빅데이터 3V/4V, 비식별화, 위기요인), 가치창조를 위한 데이터 사이언스와 전략 인사이트</td>
                <td className="py-3.5 px-4 text-center font-bold">10문항</td>
                <td className="py-3.5 px-4 text-center font-bold">20점 (20%)</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-black text-xs">
                    최소 4문항 (8점) 이상 필수
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-black text-purple-600 dark:text-purple-400">2과목: 데이터 분석 기획</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">데이터 분석 기획의 이해(KDD, CRISP-DM, 하향식/상향식), 분석 마스터 플랜(우선순위 시급성/난이도, 준비도/성숙도 4분면, 분석 거버넌스 및 조직 구조)</td>
                <td className="py-3.5 px-4 text-center font-bold">10문항</td>
                <td className="py-3.5 px-4 text-center font-bold">20점 (20%)</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-black text-xs">
                    최소 4문항 (8점) 이상 필수
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">3과목: 데이터 분석</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">R기초와 데이터 마트(결측치, 이상치, reshape2/plyr), 통계분석(표본추출, 가설검정, 분산분석, 회귀분석, 시계열), 정형 데이터 마이닝(분류, 혼동행렬/ROC, 군집, 연관분석)</td>
                <td className="py-3.5 px-4 text-center font-bold">30문항</td>
                <td className="py-3.5 px-4 text-center font-bold">60점 (60%)</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-black text-xs">
                    최소 12문항 (24점) 이상 필수
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50/70 dark:bg-indigo-950/40 font-black text-slate-900 dark:text-slate-100 border-t-2 border-indigo-200 dark:border-indigo-800">
                <td className="py-3.5 px-4 rounded-bl-xl">합계 (최종 합격 기준)</td>
                <td className="py-3.5 px-4 text-indigo-700 dark:text-indigo-300">세 과목 모두 과락(40% 미만)이 없으면서 총점 60점(30문항) 이상 득점 시 최종 합격</td>
                <td className="py-3.5 px-4 text-center">총 50문항</td>
                <td className="py-3.5 px-4 text-center">100점 만점</td>
                <td className="py-3.5 px-4 text-center rounded-br-xl text-emerald-600 dark:text-emerald-400">
                  총 30문항 (60점) 이상 합격!
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Warnings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-xs space-y-1">
            <div className="font-black text-rose-700 dark:text-rose-300">🚨 과락(40% 미만) 주의보!</div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              총점이 60점(30개)을 넘더라도 <strong>1과목이나 2과목에서 3문제 이하(6점 이하)</strong>를 맞히거나, <strong>3과목에서 11문제 이하(22점 이하)</strong>를 맞히면 <strong>과락으로 즉시 불합격</strong> 처리됩니다.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-xs space-y-1">
            <div className="font-black text-indigo-700 dark:text-indigo-300">🎯 가장 이상적인 합격 목표 점수 조합</div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              분량이 적고 암기 효율이 높은 <strong>1과목(8문제=16점 목표) + 2과목(8문제=16점 목표)에서 32점을 확보</strong>하면, 가장 어려운 <strong>3과목은 30문제 중 절반인 14~15문제(28~30점)만 맞혀도 안전하게 합격(60~62점)</strong>할 수 있습니다!
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: 실시간 합격 · 과락 시뮬레이션 계산기 */}
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <span>🧮</span>
              <span>실시간 합격 · 과락 시뮬레이션 계산기</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              슬라이더를 움직여 과목별 맞힌 문항 수에 따른 총점과 과락 여부를 즉시 시뮬레이션해 보세요.
            </p>
          </div>
          <div className={`px-4 py-2 rounded-2xl font-black text-sm flex items-center space-x-2 ${
            isPass
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-rose-600 text-white shadow-md'
          }`}>
            <span>{isPass ? '🎉 최종 합격 (PASS)' : '⚠️ 불합격 (FAIL)'}</span>
            <span>·</span>
            <span>총점 {totalScore}점 ({s1Correct + s2Correct + s3Correct}/50문항)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Subject 1 Slider */}
          <div className={`p-4 rounded-2xl border ${s1Cutoff ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'} space-y-2`}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">1과목 데이터 이해</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded ${s1Cutoff ? 'bg-rose-600 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'}`}>
                {s1Correct}/10문항 ({s1Score}점) {s1Cutoff ? '🚨과락' : '✓통과'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={s1Correct}
              onChange={e => setS1Correct(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>0문항 (0점)</span>
              <span className="text-rose-500 font-bold">과락선: 4문항(8점)</span>
              <span>10문항 (20점)</span>
            </div>
          </div>

          {/* Subject 2 Slider */}
          <div className={`p-4 rounded-2xl border ${s2Cutoff ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'} space-y-2`}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-purple-600 dark:text-purple-400">2과목 데이터 분석 기획</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded ${s2Cutoff ? 'bg-rose-600 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'}`}>
                {s2Correct}/10문항 ({s2Score}점) {s2Cutoff ? '🚨과락' : '✓통과'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={s2Correct}
              onChange={e => setS2Correct(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>0문항 (0점)</span>
              <span className="text-rose-500 font-bold">과락선: 4문항(8점)</span>
              <span>10문항 (20점)</span>
            </div>
          </div>

          {/* Subject 3 Slider */}
          <div className={`p-4 rounded-2xl border ${s3Cutoff ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'} space-y-2`}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">3과목 데이터 분석</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded ${s3Cutoff ? 'bg-rose-600 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'}`}>
                {s3Correct}/30문항 ({s3Score}점) {s3Cutoff ? '🚨과락' : '✓통과'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={s3Correct}
              onChange={e => setS3Correct(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>0문항 (0점)</span>
              <span className="text-rose-500 font-bold">과락선: 12문항(24점)</span>
              <span>30문항 (60점)</span>
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
          <span>
            판정 결과 상세: {isPass
              ? `총점 ${totalScore}점(≥60점)이며 전 과목 40% 이상 득점하여 합격 기준을 완벽히 충족했습니다!`
              : anyCutoff
                ? `총점은 ${totalScore}점이나, 과락 기준 미달 과목(${[s1Cutoff && '1과목(<8점)', s2Cutoff && '2과목(<8점)', s3Cutoff && '3과목(<24점)'].filter(Boolean).join(', ')})이 발생하여 불합격입니다.`
                : `과락인 과목은 없으나 총점이 ${totalScore}점으로 합격 기준(60점)에 ${60 - totalScore}점(${(60 - totalScore) / 2}문항) 부족합니다.`
            }
          </span>
          <button
            onClick={() => { setS1Correct(8); setS2Correct(8); setS3Correct(15); }}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            추천 안전 합격선(16+16+30=62점) 세팅하기 ↺
          </button>
        </div>
      </div>

      {/* Section 3: 연간 시험 일정 (연 4회 정기 시행) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <span>📅</span>
              <span>매년 시험 시행 횟수 및 2026년 정기시험 일정 (연 4회)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ADsP는 매년 <strong>2월 · 5월 · 8월 · 11월 (연 4회)</strong> 토요일 오전에 전국 고사장에서 정기 시행됩니다. (원서접수: 데이터자격검정 dataq.or.kr)
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-xs font-extrabold">
            주관: 한국데이터산업진흥원 (K-Data)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 rounded-tl-xl">회차 구분</th>
                <th className="py-3 px-4">원서 접수 기간</th>
                <th className="py-3 px-4">시험 시행일 (토요일)</th>
                <th className="py-3 px-4">사전 점수 (가답안) 발표</th>
                <th className="py-3 px-4 rounded-tr-xl">최종 합격자 발표</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {schedule2026.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-black text-indigo-600 dark:text-indigo-400">
                    {row.round} <span className="ml-1 text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">{row.badge}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{row.applyPeriod}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">{row.examDate}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.prelimDate}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{row.finalDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-400">
          * 수험표는 시험일 약 2주 전 금요일부터 출력 가능하며, 세부 일시는 한국데이터산업진흥원 데이터자격검정(www.dataq.or.kr) 공고에 따라 일부 조정될 수 있습니다.
        </p>
      </div>

      {/* Section 4: 시험 시간 · 입퇴실 규정 & 응시료 · 준비물 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 시험 시간 & 입퇴실 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>⏰</span>
            <span>시험 시간 및 고사장 입·퇴실 규정</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="font-bold text-slate-600 dark:text-slate-300">입실 마감 시각</span>
              <span className="font-black text-rose-600 dark:text-rose-400">오전 09:30 까지 (09:30 이후 입실 절대 불가)</span>
            </div>
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="font-bold text-slate-600 dark:text-slate-300">시험 진행 시간</span>
              <span className="font-black text-indigo-600 dark:text-indigo-400">오전 10:00 ~ 11:30 (총 90분간 진행)</span>
            </div>
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="font-bold text-slate-600 dark:text-slate-300">중도 퇴실 가능 시각</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">시험 시작 30분 경과 후 (10:30 이후) 퇴실 가능</span>
            </div>
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="font-bold text-slate-600 dark:text-slate-300">시험 방식</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">PBT (종이 문제지 + OMR 카드 컴퓨터용 사인펜 마킹)</span>
            </div>
          </div>
        </div>

        {/* 응시료 & 준비물 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>💳</span>
            <span>응시료 · 환불 규정 및 필수 준비물</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="font-bold text-slate-600 dark:text-slate-300">응시 수수료</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">50,000원 (부가세 포함)</span>
            </div>
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="font-bold text-slate-600 dark:text-slate-300">응시료 환불 규정</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">접수기간 내 취소: 100% 환불<br/>접수 마감 후 ~ 시험 5일 전: 50% 환불</span>
            </div>
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="font-bold text-slate-600 dark:text-slate-300">필수 지참 신분증</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">주민등록증, 운전면허증, 기간만료 전 여권, 모바일 신분증(정부24/PASS)</span>
            </div>
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="font-bold text-slate-600 dark:text-slate-300">필기구 및 계산기</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">컴퓨터용 흑색 사인펜, 수정테이프 가능<br/>(전자계산기 지참 및 사용 불가!)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: 역대 합격률 추이 및 최근 출제 경향 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <span>📈</span>
              <span>ADsP 역대 합격률 추이 및 최근 출제 트렌드</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ADsP의 평균 합격률은 <strong>약 35% ~ 45% 내외</strong>로, 회차별 난이도에 따라 편차가 있어 기출 선지의 정확한 오답 원리 학습이 필수입니다.
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-extrabold">
            평균 합격률: 약 40.5%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 rounded-tl-xl">연도 (회차)</th>
                <th className="py-3 px-4">연간 응시 인원</th>
                <th className="py-3 px-4 text-center">평균 합격률</th>
                <th className="py-3 px-4 rounded-tr-xl">핵심 출제 경향 및 난이도 특징</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {passRateHistory.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-black text-slate-900 dark:text-slate-100">{item.year}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.applicants}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black">
                      {item.passRate}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.ExamInfoView = ExamInfoView;
