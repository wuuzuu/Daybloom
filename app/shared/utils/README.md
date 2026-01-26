# daybloom-utils

Daybloom 프로젝트에서 사용하는 공통 유틸리티 함수들

## 설치

이 저장소는 Git 서브모듈로 사용됩니다.

```bash
git submodule add https://github.com/wuuzuu/daybloom-utils.git shared/utils
```

## 포함된 유틸리티

### date.ts
- `formatDate()` - 날짜를 YYYY-MM-DD 형식으로 포맷
- `getToday()` - 오늘 날짜 반환
- `getWeekRange()` - 주어진 날짜의 주 범위 반환
- `getDatesInRange()` - 두 날짜 사이의 모든 날짜 배열
- `getCalendarDays()` - 캘린더 뷰용 날짜 정보

### avatar.ts
- `getAvatarUrl()` - DiceBear API를 사용한 아바타 URL 생성
- `avatar` 객체 - 다양한 스타일의 아바타 헬퍼

### uuid.ts
- `generateUUID()` - UUID v4 생성

## 사용법

```typescript
import { formatDate, getToday } from './shared/utils/date'
import { avatar } from './shared/utils/avatar'
import { generateUUID } from './shared/utils/uuid'
```
