# Daybloom 🌸

일상 기록과 감정 추적을 위한 개인 생산성 앱

## 기술 스택

- **Framework**: Nuxt 4 + Vue 3 (Composition API)
- **Language**: TypeScript
- **State**: Pinia
- **Styling**: TailwindCSS
- **Charts**: Chart.js + vue-chartjs
- **Network Graph**: vis-network
- **Date**: dayjs
- **Storage**: localStorage

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 정적 생성
npm run generate
```

## 프로젝트 구조

```
app/
├── pages/                    # 페이지 라우팅
│   ├── index.vue            # Dashboard (홈)
│   ├── calendar.vue         # 월간 캘린더 뷰
│   ├── mood-chart.vue       # 무드 차트
│   ├── people.vue           # 인물 관계 네트워크
│   ├── search.vue           # 검색
│   ├── weekly.vue           # Weekly 요약
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
│   ├── useDarkMode.ts       # 다크모드 토글
│   └── useMood.ts           # 무드 관련 유틸
│
├── stores/
│   ├── entries.ts           # Entry 상태 관리
│   └── weekly.ts            # Weekly 상태 관리
│
├── plugins/
│   └── storage.client.ts    # localStorage 어댑터
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

### 📝 Daily Entry
- 하루 기록 CRUD (bullets, events, tomorrow)
- 5단계 무드 트래킹 (great, good, okay, bad, awful)
- 만난 사람 태그 + 감정 기록

### 📅 Calendar
- 월간 캘린더 뷰
- 날짜별 무드 한눈에 보기

### 📊 Mood Chart
- 시간에 따른 무드 변화 라인 차트
- 트렌드 시각화

### 👥 People
- 인물 관계 네트워크 그래프 (vis-network)
- 무드 히트맵으로 관계 분석

### 🔍 Search
- 키워드 기반 Entry 검색
- 빠른 기록 탐색

### 📋 Weekly Summary
- 주간 자동 집계 (Entry 수, 무드 분포)
- Top People 표시
- 하이라이트 & 다음 주 실험 메모

### 🌙 Dark Mode
- 시스템 설정 연동
- 수동 토글 지원