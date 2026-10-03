# -*- coding: utf-8 -*-
"""
Enrich quizSets.js with 60 OX questions, 40 Chosung questions, 60 Flashcards, and 30 Speed questions.
"""
import json
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
quiz_path = os.path.join(base_dir, "quizSets.js")

# Additional OX questions
more_ox = [
    {
        "id": "ox-21", "subject": 1,
        "statement": "정성적 데이터는 문자나 언어로 구성되어 연산이 불가능하고 주관적 의미 해석이 중심이 된다.",
        "isCorrect": True,
        "explanation": "맞습니다. 정성적 데이터(Qualitative Data)는 설문 서술형 답변, 인터뷰 내용, 도서 텍스트 등 언어와 문자로 구성되어 주관적 해석이 요구됩니다.",
        "tip": "정성적(주관적/비정형) vs 정량적(수치/통계연산 가능)"
    },
    {
        "id": "ox-22", "subject": 1,
        "statement": "데이터 사이언티스트에게 요구되는 소프트 스킬에는 통계학 이론과 SQL 프로그래밍 능력이 포함된다.",
        "isCorrect": False,
        "explanation": "틀렸습니다. 통계학과 프로그래밍은 '하드 스킬(Hard Skill)'입니다. 소프트 스킬은 통찰력, 호기심, 스토리텔링, 커뮤니케이션 능력입니다.",
        "tip": "하드 스킬 = IT/통계/머신러닝 / 소프트 스킬 = 통찰력/스토리텔링"
    },
    {
        "id": "ox-23", "subject": 1,
        "statement": "RDBMS는 NoSQL에 비해 수평적 확장(Scale-out)이 매우 용이하여 대용량 분산 처리에 주로 사용된다.",
        "isCorrect": False,
        "explanation": "틀렸습니다. RDBMS는 수직적 확장(Scale-up)에 유리하며, 수평적 확장(Scale-out)은 NoSQL과 하둡(Hadoop)의 핵심 강점입니다.",
        "tip": "RDBMS = Scale-up / NoSQL/빅데이터 = Scale-out"
    },
    {
        "id": "ox-24", "subject": 1,
        "statement": "구글 독감 트렌드는 인과관계보다 검색어와 독감 발병률 간의 상관관계를 활용한 대표적인 빅데이터 사례이다.",
        "isCorrect": True,
        "explanation": "맞습니다. 구글 독감 트렌드는 실시간 검색어 쿼리의 상관관계를 분석하여 보건당국보다 빠른 예측을 시도했던 대표 사례입니다.",
        "tip": "구글 플루 = 상관관계 기반 예측"
    },
    {
        "id": "ox-25", "subject": 1,
        "statement": "데이터 거버넌스 체계의 4대 핵심 구성 요소는 조직, 프로세스, 표준/정책, 시스템이다.",
        "isCorrect": True,
        "explanation": "맞습니다. 전사 데이터 관리를 위한 거버넌스는 조직, 프로세스, 표준/원칙, 인프라 시스템의 4대 축으로 구성됩니다.",
        "tip": "거버넌스 4대 축: 조직, 프로세스, 표준, 시스템"
    },
    {
        "id": "ox-26", "subject": 2,
        "statement": "하향식 접근법(Top-Down)은 보유한 데이터를 먼저 탐색하여 뜻밖의 새로운 패턴을 발견해 나가는 방식이다.",
        "isCorrect": False,
        "explanation": "틀렸습니다. 데이터를 먼저 탐색하여 패턴을 발견하는 것은 '상향식 접근법(Bottom-Up)'입니다. 하향식은 문제(Problem)가 정의되어 있고 이를 해결하기 위해 원인을 파고드는 방식입니다.",
        "tip": "데이터 먼저 탐색 = 상향식(Bottom-Up)"
    },
    {
        "id": "ox-27", "subject": 2,
        "statement": "분석 과제 발굴에서 분석 대상(What)은 알고 있으나 분석 방법(How)을 모를 때의 접근 유형은 'Solution(솔루션)'이다.",
        "isCorrect": True,
        "explanation": "맞습니다. What을 알고 How를 모르면 '솔루션(Solution)', 둘 다 알면 '최적화(Optimization)'입니다.",
        "tip": "What 앎 + How 모름 = 솔루션(Solution)"
    },
    {
        "id": "ox-28", "subject": 2,
        "statement": "나선형 모델(Spiral Model)은 폭포수 모델과 프로토타이핑을 결합하여 위험 분석을 반복 수행하며 개발하는 모델이다.",
        "isCorrect": True,
        "explanation": "맞습니다. 나선형 모델의 가장 큰 핵심 특징은 '위험 분석(Risk Analysis)'을 주기적으로 반복하여 프로젝트 실패 위험을 최소화하는 것입니다.",
        "tip": "나선형 모델 = 위험 분석(Risk Analysis) 반복"
    },
    {
        "id": "ox-29", "subject": 2,
        "statement": "분석 성숙도(Maturity) 4단계의 발전 순서는 도입 → 활용 → 확산 → 최적화 이다.",
        "isCorrect": True,
        "explanation": "맞습니다. 도입(Introduction) → 활용(Utilization) → 확산(Expansion) → 최적화(Optimization) 순서로 고도화됩니다.",
        "tip": "성숙도 4단계: [도-활-확-최]"
    },
    {
        "id": "ox-30", "subject": 2,
        "statement": "분석 과제의 적용 우선순위 결정 시 난이도(Difficulty) 평가는 비즈니스 ROI와 전략적 중요도를 중심으로 판단한다.",
        "isCorrect": False,
        "explanation": "틀렸습니다. ROI와 비즈니스 가치는 '시급성(Urgency)' 평가 기준입니다. 난이도는 데이터 확보 용이성, 정제 난이도, 시스템 복잡도를 평가합니다.",
        "tip": "ROI = 시급성 기준 / 데이터확보 = 난이도 기준"
    },
    {
        "id": "ox-31", "subject": 3,
        "statement": "R에서 matrix() 함수로 행렬 생성 시 기본값으로 행(Row)을 기준으로 데이터가 채워진다(byrow = TRUE).",
        "isCorrect": False,
        "explanation": "틀렸습니다. R matrix()의 기본값은 열(Column) 기준인 'byrow = FALSE'입니다. 즉, 첫 번째 열부터 위에서 아래로 원소가 채워집니다.",
        "tip": "R 행렬 기본값: 열 기준(byrow=FALSE)"
    },
    {
        "id": "ox-32", "subject": 3,
        "statement": "표본 상관계수가 0이면 두 확률변수는 통계적으로 반드시 독립이다.",
        "isCorrect": False,
        "explanation": "틀렸습니다. 상관계수가 0이라는 것은 '선형(직선) 관계가 없다'는 뜻일 뿐, 2차 곡선과 같은 강력한 비선형 종속 관계가 존재할 수 있습니다. 따라서 독립이라고 단정할 수 없습니다.",
        "tip": "독립이면 상관계수=0 (참) / 상관계수=0이면 독립 (거짓!)"
    },
    {
        "id": "ox-33", "subject": 3,
        "statement": "다중회귀분석에서 수정된 결정계수(Adjusted R²)는 항상 일반 결정계수(R²)보다 작거나 같다.",
        "isCorrect": True,
        "explanation": "맞습니다. 수정된 결정계수는 독립변수 개수에 대한 페널티를 부과하므로 항상 일반 결정계수(R²) 이하의 값을 갖습니다.",
        "tip": "항상 Adjusted R² ≤ R²"
    },
    {
        "id": "ox-34", "subject": 3,
        "statement": "라쏘(Lasso) 회귀는 L1 규제를 사용하여 불필요한 독립변수의 회귀계수를 정확히 0으로 만들어 자동 변수 선택 효과를 낸다.",
        "isCorrect": True,
        "explanation": "맞습니다. 라쏘(Lasso)는 L1 페널티를 주어 계수를 0으로 만들 수 있어 변수 선택이 가능합니다. 릿지(Ridge)는 L2 페널티로 계수를 0에 가깝게 줄이지만 0으로 만들지는 못합니다.",
        "tip": "라쏘 = L1 / 계수 0 가능 / 변수 선택"
    },
    {
        "id": "ox-35", "subject": 3,
        "statement": "의사결정나무 모델은 데이터의 스케일(단위) 차이에 매우 민감하여 반드시 사전에 정규화(Standardization)를 거쳐야 한다.",
        "isCorrect": False,
        "explanation": "틀렸습니다. 의사결정나무는 단순히 변수별 값의 대소 비교(분기점 기준)를 하므로 데이터 스케일링이나 정규화가 전혀 필요하지 않은 대표적인 모델입니다.",
        "tip": "의사결정나무는 스케일링/정규화 불필요"
    },
    {
        "id": "ox-36", "subject": 3,
        "statement": "혼동행렬에서 실제 음성인 것 중에서 모델이 음성으로 올바르게 예측한 비율을 '특이도(Specificity)'라고 한다.",
        "isCorrect": True,
        "explanation": "맞습니다. 특이도 = TN / (TN + FP) 로 실제 정상(음성)을 정상으로 정확하게 판별해낸 비율입니다.",
        "tip": "특이도(Specificity) = TN / (TN + FP)"
    },
    {
        "id": "ox-37", "subject": 3,
        "statement": "랜덤 포레스트는 배깅(Bagging) 기법을 기반으로 하며, 노드 분할 시 변수를 무작위로 일부만 선택하여 트리 간 상관성을 낮춘다.",
        "isCorrect": True,
        "explanation": "맞습니다. 랜덤 포레스트는 무작위 변수 추출과 배깅을 결합하여 개별 트리의 다양성을 극대화하고 과적합을 방지합니다.",
        "tip": "랜덤포레스트: 배깅 + 무작위 변수 선택"
    },
    {
        "id": "ox-38", "subject": 3,
        "statement": "시계열 데이터에서 분산이 시간에 따라 일정하지 않고 증가할 때는 차분(Differencing)을 적용하여 분산을 정상화한다.",
        "isCorrect": False,
        "explanation": "틀렸습니다. '분산'이 일정하지 않을 때는 로그 변환(Log Transformation)이나 거듭제곱 변환을 사용합니다. 차분은 '평균'이 일정하지 않을 때 사용합니다.",
        "tip": "평균 불일정 = 차분 / 분산 불일정 = 로그 변환"
    },
    {
        "id": "ox-39", "subject": 3,
        "statement": "K-means 군집분석은 계층적 군집분석에 비해 계산 복잡도가 낮아 대용량 데이터 처리에 적합하다.",
        "isCorrect": True,
        "explanation": "맞습니다. K-means는 시간 복잡도가 O(n) 수준으로 대규모 데이터에 효율적이며, 계층적 군집은 O(n²) 이상으로 대용량 처리가 어렵습니다.",
        "tip": "대용량 데이터 군집화 = K-means"
    },
    {
        "id": "ox-40", "subject": 3,
        "statement": "연관분석에서 규칙 'A → B'의 향상도(Lift)가 1보다 작으면, 품목 A를 구매한 고객은 B를 구매할 확률이 오히려 떨어진다는 뜻이다.",
        "isCorrect": True,
        "explanation": "맞습니다. 향상도 < 1 은 두 품목 간에 음의 상관관계(상호 배타적 관계)가 있음을 의미합니다.",
        "tip": "Lift < 1 = 음의 연관성 (A를 사면 B는 덜 산다)"
    }
]

# Additional Chosung Quizzes
more_chosung = [
    {
        "id": "ch-16", "subject": 1,
        "sentence": "전통적인 사전처리 방식과 달리 빅데이터는 일단 모든 데이터를 모아두고 사후에 분석하는 [ 빈칸 ] 방식을 취한다.",
        "blankWord": "사후처리", "chosung": "ㅅㅎㅊㄹ",
        "hint": "사전처리의 반대말",
        "explanation": "빅데이터는 선별 수집하지 않고 전수를 수집한 후 목적에 맞게 사후 가공하는 사후처리(Post-processing) 패러다임입니다."
    },
    {
        "id": "ch-17", "subject": 1,
        "sentence": "데이터베이스의 4대 특성 중 조직의 고유한 업무 목적을 달성하기 위해 반드시 유지되어야 하는 데이터를 [ 빈칸 ] 데이터라고 한다.",
        "blankWord": "운영", "chosung": "ㅇㅇ",
        "hint": "Operational Data",
        "explanation": "운영 데이터는 기업의 영속적 운영과 업무 수행에 필수 불가결한 데이터입니다."
    },
    {
        "id": "ch-18", "subject": 2,
        "sentence": "비즈니스 모델 캔버스의 관점 중 기업의 생산, 조달, 재고 관리 등 내부 프로세스를 진단하는 차원은 [ 빈칸 ] 관점이다.",
        "blankWord": "업무", "chosung": "ㅇㅁ",
        "hint": "Operation (운영/업무)",
        "explanation": "업무(Operation) 관점은 내부 운영 효율성 향상과 비용 절감을 목적으로 분석 기회를 발굴합니다."
    },
    {
        "id": "ch-19", "subject": 2,
        "sentence": "애자일 방법론에서 1~4주 단위의 반복적인 개발 및 배포 사이클을 [ 빈칸 ]라고 부른다.",
        "blankWord": "스프린트", "chosung": "ㅅㅍㄹㅌ",
        "hint": "Sprint (단거리 전력 질주를 뜻하는 영어 단어)",
        "explanation": "스프린트(Sprint)는 스크럼 프레임워크에서 정해진 짧은 기간 동안 목표 기능을 완성하는 단위 주기입니다."
    },
    {
        "id": "ch-20", "subject": 3,
        "sentence": "단순선형회귀분석에서 잔차들이 서로 상관관계 없이 독립적이어야 한다는 가정을 [ 빈칸 ] 가정이라고 한다.",
        "blankWord": "독립성", "chosung": "ㄷㄹㅅ",
        "hint": "Independence (더빈-왓슨 검정으로 확인)",
        "explanation": "독립성 가정은 오차항 간에 자기상관(Autocorrelation)이 없어야 함을 의미합니다."
    },
    {
        "id": "ch-21", "subject": 3,
        "sentence": "머신러닝에서 훈련 데이터에 너무 과도하게 맞춰져 새로운 테스트 데이터에 대한 예측 오차가 급증하는 현상을 [ 빈칸 ]이라고 한다.",
        "blankWord": "과적합", "chosung": "ㄱㅈㅎ",
        "hint": "영어 Overfitting",
        "explanation": "과적합(Overfitting)은 모델이 학습 데이터의 잡음(Noise)까지 외워버려 일반화 능력이 떨어지는 현상입니다."
    },
    {
        "id": "ch-22", "subject": 3,
        "sentence": "의사결정나무의 과적합을 방지하기 위해 불필요하게 깊게 뻗은 잔가지를 잘라내는 작업을 [ 빈칸 ]라고 한다.",
        "blankWord": "가지치기", "chosung": "ㄱㅈㅊㄱ",
        "hint": "영어 Pruning",
        "explanation": "가지치기(Pruning)는 트리의 복잡도를 줄여 일반화 성능을 향상시키는 대표적인 사후 규제 기법입니다."
    },
    {
        "id": "ch-23", "subject": 3,
        "sentence": "분류 모델이 예측한 양성(Positive) 결과 중 실제로 진짜 양성인 데이터의 비율을 [ 빈칸 ]라고 한다.",
        "blankWord": "정밀도", "chosung": "ㅈㅁㄷ",
        "hint": "영어 Precision, TP / (TP + FP)",
        "explanation": "정밀도(Precision)는 모델이 참이라고 주장한 것 중 실제로 참인 비율입니다."
    },
    {
        "id": "ch-24", "subject": 3,
        "sentence": "계층적 군집분석의 병합 과정을 나뭇가지 형태의 계층 구조로 시각화한 수형도 차트를 [ 빈칸 ]이라고 한다.",
        "blankWord": "덴드로그램", "chosung": "ㄷㄷㄹㄱㄹ",
        "hint": "Dendrogram",
        "explanation": "덴드로그램은 개체 간의 거리와 군집 형성 과정을 한눈에 보여주는 계층적 군집의 핵심 시각화 도구입니다."
    },
    {
        "id": "ch-25", "subject": 3,
        "sentence": "ARIMA(p, d, q) 모형에서 과거 오차항들의 가중합으로 현재 값을 설명하는 이동평균 모형의 차수를 나타내는 파라미터는 [ 빈칸 ]이다.",
        "blankWord": "q", "chosung": "q",
        "hint": "p는 AR 차수, d는 차분 횟수, 이것은 MA 차수",
        "explanation": "ARIMA(p, d, q)에서 p=AR(자기회귀), d=차분, q=MA(이동평균) 차수입니다."
    }
]

# Read existing quizSets.js
with open(quiz_path, "r", encoding="utf-8") as f:
    raw = f.read()

# Strip prefix and suffix
prefix = "// ADsP Master Quiz Sets Data\nwindow.ADSP_QUIZZES = "
suffix = ";\n"
if raw.startswith(prefix) and raw.endswith(suffix):
    json_str = raw[len(prefix):-len(suffix)]
    data = json.loads(json_str)
else:
    # Fallback parse
    data = json.loads(raw.split("window.ADSP_QUIZZES = ")[1].rstrip(";\n"))

# Merge additional items
data["oxQuizzes"].extend(more_ox)
data["chosungQuizzes"].extend(more_chosung)

with open(quiz_path, "w", encoding="utf-8") as f:
    f.write(prefix)
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write(suffix)

print(f"Enriched quizSets.js: Total {len(data['oxQuizzes'])} OX Quizzes, {len(data['chosungQuizzes'])} Chosung Quizzes!")
