# Daybloom 🌸

일상 기록과 감정 추적을 위한 개인 생산성 앱

## 기술 스택

- **Framework**: Nuxt 4 + Vue 3 (Composition API)
- **Language**: TypeScript
- **State**: Pinia
- **Styling**: TailwindCSS
- **Backend**: Supabase (Auth + Database)
- **AI**: Google Gemini API
- **Charts**: Chart.js + vue-chartjs
- **Network Graph**: vis-network
- **Date**: dayjs

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정 (.env 파일 생성)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 프로젝트 구조

```
app/
├── pages/
│   ├── index.vue            # 홈 (오늘의 기분 + 타임라인)
│   ├── calendar.vue         # 월간 캘린더 뷰
│   ├── mood-chart.vue       # 무드 차트
│   ├── people.vue           # 인물 관계 네트워크
│   ├── search.vue           # 검색 (키워드 + AI 스마트 검색)
│   ├── weekly.vue           # Weekly 요약 + AI 분석
│   ├── login.vue            # 로그인
│   ├── signup.vue           # 회원가입
│   └── entry/
│       └── [date].vue       # Entry 생성/수정
│
├── components/
│   ├── Calendar/
│   │   └── MonthCalendar.vue
│   ├── Chart/
│   │   └── MoodLineChart.vue
│   ├── Common/
│   │   └── MoodBadge.vue
│   ├── Entry/
│   │   ├── EntryCard.vue
│   │   ├── EntryForm.vue
│   │   ├── EntryList.vue
│   │   └── EntryView.vue
│   ├── People/
│   │   ├── MoodHeatmap.vue
│   │   └── NetworkGraph.vue
│   ├── Search/
│   │   └── SearchResultCard.vue
│   └── Weekly/
│       ├── TopPeople.vue
│       ├── WeeklyNotesForm.vue
│       ├── WeeklyNotesView.vue
│       └── WeeklyStats.vue
│
├── composables/
│   ├── useBodyScrollLock.ts # 모달 배경 스크롤 방지
│   ├── useDarkMode.ts       # 다크모드 토글
│   └── useMood.ts           # 무드 관련 유틸
│
├── stores/
│   ├── entries.ts           # Entry 상태 관리
│   ├── projects.ts          # 프로젝트 상태 관리
│   ├── search.ts            # 검색 상태 관리
│   └── weekly.ts            # Weekly 상태 관리
│
├── server/
│   └── api/
│       └── ai/
│           ├── search.post.ts   # AI 스마트 검색 API
│           └── summary.post.ts  # AI 주간 요약 API
│
├── utils/
│   ├── avatar.ts            # 아바타 생성
│   ├── date.ts              # 날짜 유틸
│   ├── summary.ts           # 요약 생성
│   └── uuid.ts              # UUID 생성
│
└── types/
    └── index.ts             # TypeScript 타입 정의
```

## 주요 기능

### 🔐 인증
- Supabase 기반 이메일/비밀번호 로그인
- Google OAuth 로그인
- 계정별 데이터 분리

### 📝 Daily Entry
- 하루 기록 CRUD
- 5단계 무드 트래킹 (great, good, okay, bad, awful)
- 무드 상세 설명 입력
- 만난 사람 태그 + 감정 기록
- 프로젝트/업무 기록 (Jira 링크 연동)

### 📅 Calendar
- 월간 캘린더 뷰
- 날짜별 무드 + 프로젝트명 표시
- 반응형 모바일 최적화

### 📊 Mood Chart
- 시간에 따른 무드 변화 라인 차트
- 트렌드 시각화

### 👥 People
- 인물 관계 네트워크 그래프 (vis-network)
- 무드 히트맵으로 관계 분석

### 🔍 Search
- **키워드 검색**: 기록, 이벤트, 사람, 기분, 크루 검색
- **✨ AI 스마트 검색**: 자연어로 검색 (예: "지난달 KCN에서 버그 수정한 날 찾아줘")
- 검색 결과 캐싱 (뒤로가기 시 유지)

### 📋 Weekly Summary
- 주간 자동 집계 (Entry 수, 무드 분포)
- Top People 표시
- **체크리스트 형식 할 일 관리**
  - Enter 키로 빠른 저장
  - 자동 포커스
- **✨ AI 주간 요약**: Gemini 기반 자동 분석

### 💾 데이터 관리
- JSON 형식 데이터 내보내기 (백업)
- Supabase 클라우드 동기화

### 🌙 Dark Mode
- 시스템 설정 연동
- 수동 토글 지원

### 📱 모바일 최적화
- 전체 화면 슬라이드 메뉴
- 하단 네비게이션 바
- 반응형 UI 컴포넌트
