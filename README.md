# TRACE

Daily 기록(Entry) CRUD + Weekly 요약 생산성 앱 MVP

## 기술 스택

- Nuxt 4
- Vue 3 (Composition API)
- TypeScript
- Pinia (상태 관리)
- TailwindCSS
- dayjs (날짜 처리)
- localStorage (로컬 저장)

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 프로젝트 구조

```
/
├── pages/           # 페이지 라우팅
│   ├── index.vue   # Dashboard
│   ├── entry/
│   │   └── [date].vue  # Entry 생성/수정
│   └── weekly.vue  # Weekly 요약
├── stores/         # Pinia stores
│   ├── entries.ts
│   └── weekly.ts
├── plugins/        # Nuxt plugins
│   └── storage.client.ts  # Storage adapter
├── utils/          # 유틸리티 함수
│   ├── date.ts
│   ├── summary.ts
│   └── uuid.ts
└── types/          # TypeScript 타입 정의
    └── index.ts
```

## 주요 기능

- Daily Entry CRUD
- Weekly 요약 (자동 집계)
- 로컬 저장 (localStorage)
- Mood 추적
- People 태그
- Bullets 기록

## TODO

- [ ] IndexedDB로 마이그레이션
- [ ] 검색 기능
- [ ] 자동화 (리마인더, 템플릿)

