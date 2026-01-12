import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(isoWeek)
dayjs.extend(customParseFormat)

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export function formatDate(date: Date | string | number): string {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getToday(): string {
  return formatDate(new Date())
}

/**
 * 주어진 날짜의 주 범위를 반환 (월요일 시작 기준)
 * @param dateStr YYYY-MM-DD 형식의 날짜 문자열
 * @param weekStartsOnMonday 월요일 시작 여부 (기본값: true)
 * @returns { weekStart: string, weekEnd: string }
 */
export function getWeekRange(
  dateStr: string,
  weekStartsOnMonday: boolean = true
): { weekStart: string; weekEnd: string } {
  const date = dayjs(dateStr)
  
  if (weekStartsOnMonday) {
    const weekStart = date.startOf('isoWeek')
    const weekEnd = date.endOf('isoWeek')
    return {
      weekStart: weekStart.format('YYYY-MM-DD'),
      weekEnd: weekEnd.format('YYYY-MM-DD'),
    }
  } else {
    const weekStart = date.startOf('week')
    const weekEnd = date.endOf('week')
    return {
      weekStart: weekStart.format('YYYY-MM-DD'),
      weekEnd: weekEnd.format('YYYY-MM-DD'),
    }
  }
}

/**
 * 두 날짜 사이의 모든 날짜를 배열로 반환
 * @param from 시작 날짜 (YYYY-MM-DD)
 * @param to 종료 날짜 (YYYY-MM-DD)
 * @returns 날짜 문자열 배열
 */
export function getDatesInRange(from: string, to: string): string[] {
  const dates: string[] = []
  let current = dayjs(from)
  const end = dayjs(to)
  
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  
  return dates
}

/**
 * 주어진 주의 이전 주 시작일 반환
 */
export function getPreviousWeek(weekStart: string): string {
  return dayjs(weekStart).subtract(1, 'week').startOf('isoWeek').format('YYYY-MM-DD')
}

/**
 * 주어진 주의 다음 주 시작일 반환
 */
export function getNextWeek(weekStart: string): string {
  return dayjs(weekStart).add(1, 'week').startOf('isoWeek').format('YYYY-MM-DD')
}

/**
 * 주어진 월의 모든 날짜 정보 반환 (캘린더 뷰용)
 * @param year 년도
 * @param month 월 (1-12)
 * @returns 캘린더 그리드를 위한 날짜 배열 (이전/다음 월 포함)
 */
export function getCalendarDays(year: number, month: number): Array<{
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}> {
  const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  const lastDay = firstDay.endOf('month')
  const today = getToday()
  
  const days: Array<{
    date: string
    day: number
    isCurrentMonth: boolean
    isToday: boolean
  }> = []
  
  // 이전 월의 날짜들 (월요일 시작 기준)
  const startDayOfWeek = firstDay.isoWeekday() // 1(월) ~ 7(일)
  for (let i = startDayOfWeek - 1; i > 0; i--) {
    const date = firstDay.subtract(i, 'day')
    days.push({
      date: date.format('YYYY-MM-DD'),
      day: date.date(),
      isCurrentMonth: false,
      isToday: date.format('YYYY-MM-DD') === today,
    })
  }
  
  // 현재 월의 날짜들
  let current = firstDay
  while (current.isBefore(lastDay) || current.isSame(lastDay, 'day')) {
    days.push({
      date: current.format('YYYY-MM-DD'),
      day: current.date(),
      isCurrentMonth: true,
      isToday: current.format('YYYY-MM-DD') === today,
    })
    current = current.add(1, 'day')
  }
  
  // 다음 월의 날짜들 (6주 채우기)
  const remainingDays = 42 - days.length // 6주 x 7일
  for (let i = 1; i <= remainingDays; i++) {
    const date = lastDay.add(i, 'day')
    days.push({
      date: date.format('YYYY-MM-DD'),
      day: date.date(),
      isCurrentMonth: false,
      isToday: date.format('YYYY-MM-DD') === today,
    })
  }
  
  return days
}

/**
 * 월 이름 반환
 */
export function getMonthName(month: number): string {
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]
  return monthNames[month - 1]
}

