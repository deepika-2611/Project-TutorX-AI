import { buildTutorSystemInstruction } from '../tutor/prompts.js'

export async function createGeminiTutorAnswer(payload) {
  const passages = Array.isArray(payload.passages) ? payload.passages.join('\n\n---\n\n') : ''
  const topic = payload.topic ?? {}
  const student = payload.student ?? {}
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: buildTutorSystemInstruction(),
          },
        ],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Student: ${student.name ?? 'Student'}, Grade: ${student.grade ?? '10'}
Topic: ${topic.chapter ?? ''} - ${topic.name ?? ''}
Formula: ${topic.formula ?? ''}
Textbook context:
${passages || 'No matching textbook passage was retrieved.'}

Question:
${payload.question}`,
            },
          ],
        },
      ],
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error?.message ?? 'Gemini request failed')
  }

  return {
    mode: 'gemini',
    answer: data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n') ?? '',
    sources: payload.retrievedChunks ?? [],
  }
}
