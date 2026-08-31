import { buildTutorSystemInstruction } from '../tutor/prompts.js'

export async function createOpenAiTutorAnswer(payload) {
  const apiKey = process.env.OPENAI_API_KEY
  const passages = Array.isArray(payload.passages) ? payload.passages.join('\n\n---\n\n') : ''
  const topic = payload.topic ?? {}
  const student = payload.student ?? {}

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-5',
      input: [
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
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error?.message ?? 'OpenAI request failed')
  }

  return {
    mode: 'llm',
    answer: data.output_text,
    sources: payload.retrievedChunks ?? [],
  }
}
