import { buildTutorSystemInstruction } from '../tutor/prompts.js'

export async function createDeepSeekTutorAnswer(payload) {
  const passages = Array.isArray(payload.passages) ? payload.passages.join('\n\n---\n\n') : ''
  const topic = payload.topic ?? {}
  const student = payload.student ?? {}

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash',
      messages: [
        {
          role: 'system',
          content: buildTutorSystemInstruction(),
        },
        {
          role: 'user',
          content: `Student: ${student.name ?? 'Student'}, Grade: ${student.grade ?? '10'}
Topic: ${topic.chapter ?? ''} - ${topic.name ?? ''}
Formula: ${topic.formula ?? ''}
Textbook context:
${passages || 'No matching textbook passage was retrieved.'}

Question:
${payload.question}`,
        },
      ],
      thinking: { type: process.env.DEEPSEEK_THINKING ?? 'disabled' },
      stream: false,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error?.message ?? 'DeepSeek request failed')
  }

  return {
    mode: 'deepseek',
    answer: data.choices?.[0]?.message?.content ?? '',
    sources: payload.retrievedChunks ?? [],
  }
}
