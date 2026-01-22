import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { entries, weekStart, weekEnd } = body

  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey
  
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'GEMINI_API_KEY not configured'
    })
  }

  if (!entries || entries.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No entries provided'
    })
  }

  // 엔트리 데이터를 요약용으로 변환
  const entriesText = entries.slice(0, 7).map((entry: any) => {
    const date = entry.date
    const mood = entry.mood?.value || '보통'
    const moodNote = entry.mood?.note ? `(${entry.mood.note.slice(0, 30)})` : ''
    const projects = entry.workItems?.map((w: any) => 
      w.project?.title || w.project?.crew
    ).filter(Boolean).join(', ') || ''
    const people = entry.people?.slice(0, 3).map((p: any) => p.name).join(', ') || ''
    
    return `- ${date}: 기분 ${mood}${moodNote}, 프로젝트: ${projects || '없음'}, 사람: ${people || '없음'}`
  }).join('\n')

  const prompt = `아래는 ${weekStart} ~ ${weekEnd} 주간 기록이야:

${entriesText}

위 기록을 바탕으로 주간 요약을 작성해줘:

📊 **이번 주 한눈에 보기**: 총 ${entries.length}일 기록, 주요 활동 1-2문장

💼 **프로젝트 진행**: 각 프로젝트별 간단 정리

😊 **기분 트렌드**: 전반적인 기분과 특이사항

💡 **인사이트**: 패턴이나 제안 1개

한국어로, 이모지 사용해서 읽기 좋게 작성해줘. 간결하게!`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return {
      success: true,
      summary: text,
      weekStart,
      weekEnd,
      entriesCount: entries.length
    }
  } catch (error: any) {
    console.error('Gemini API error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to generate summary'
    })
  }
})
