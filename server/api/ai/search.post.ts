import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Entry } from '~/types'

interface SearchRequest {
  query: string
  entries: Array<{
    date: string
    mood: { value: string; note?: string }
    bullets: string[]
    events?: string[]
    people: Array<{ name: string; feeling?: string }>
    workItems?: Array<{
      projectId: string
      dailyNote?: string
      project?: { crew: string; title: string }
    }>
  }>
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const geminiApiKey = config.geminiApiKey

  if (!geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Gemini API Key not configured.',
    })
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const { query, entries } = await readBody(event) as SearchRequest

  if (!query || !entries || entries.length === 0) {
    return { success: true, results: [], explanation: '검색할 데이터가 없습니다.' }
  }

  // 엔트리 데이터를 간결하게 포맷
  const formattedEntries = entries.map(entry => {
    const parts = [`[${entry.date}]`]
    
    // 기분
    const moodMap: Record<string, string> = {
      great: '최고', good: '좋음', okay: '보통', bad: '나쁨', awful: '최악'
    }
    parts.push(`기분: ${moodMap[entry.mood.value] || entry.mood.value}`)
    if (entry.mood.note) parts.push(`(${entry.mood.note})`)
    
    // 프로젝트/크루
    if (entry.workItems && entry.workItems.length > 0) {
      const projects = entry.workItems.map(w => {
        const crew = w.project?.crew || ''
        const title = w.project?.title || ''
        const note = w.dailyNote || ''
        return `${crew}/${title}${note ? ': ' + note : ''}`
      }).join(', ')
      parts.push(`작업: ${projects}`)
    }
    
    // 메모
    if (entry.bullets.length > 0) {
      parts.push(`메모: ${entry.bullets.join(', ')}`)
    }
    
    // 이벤트
    if (entry.events && entry.events.length > 0) {
      parts.push(`이벤트: ${entry.events.join(', ')}`)
    }
    
    // 사람
    if (entry.people.length > 0) {
      const people = entry.people.map(p => p.name).join(', ')
      parts.push(`사람: ${people}`)
    }
    
    return parts.join(' | ')
  }).join('\n')

  const prompt = `당신은 일기/업무 기록 검색 도우미입니다. 아래는 사용자의 일별 기록 데이터입니다.

--- 기록 데이터 ---
${formattedEntries}
--- 끝 ---

사용자 검색 쿼리: "${query}"

위 데이터에서 사용자의 검색 쿼리와 관련된 날짜들을 찾아주세요.
반드시 아래 JSON 형식으로만 응답하세요:

{
  "dates": ["YYYY-MM-DD", "YYYY-MM-DD"],
  "explanation": "검색 결과에 대한 간단한 설명"
}

- dates: 관련된 날짜 목록 (최대 10개, 관련성 높은 순)
- explanation: 왜 이 날짜들이 관련되는지 1-2문장으로 설명

관련된 기록이 없으면 dates를 빈 배열로 반환하세요.`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    // JSON 파싱 시도
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        success: true,
        dates: parsed.dates || [],
        explanation: parsed.explanation || '검색 결과입니다.',
      }
    }
    
    return {
      success: true,
      dates: [],
      explanation: '검색 결과를 파싱할 수 없습니다.',
    }
  } catch (error: any) {
    console.error('AI Search Error:', error)
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || 'AI 검색 중 오류가 발생했습니다.',
    })
  }
})
