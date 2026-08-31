import { createDeepSeekTutorAnswer } from '../providers/deepseek.provider.js'
import { createGeminiTutorAnswer } from '../providers/gemini.provider.js'
import { createOpenAiTutorAnswer } from '../providers/openai.provider.js'
import { selectLlmProvider } from '../providers/provider-selection.js'
import { retrieveBookChunks } from '../rag/retrieval.js'
import { validateTutorRequest } from './guardrails.js'
import { moderateTutorQuestion } from './moderation.js'

export async function createTutorAnswer(payload, { pool, mathTopicById }) {
  const guardrail = validateTutorRequest(payload, mathTopicById)
  if (!guardrail.allowed) {
    return {
      mode: 'guardrail',
      answer: guardrail.message,
      sources: [],
    }
  }

  payload = {
    ...payload,
    question: guardrail.question,
    topic: guardrail.topic,
  }

  const moderation = await moderateTutorQuestion(payload.question)
  if (!moderation.allowed) {
    return {
      mode: 'moderation',
      answer: moderation.message,
      sources: [],
    }
  }

  let retrievedChunks = []
  if (pool) {
    retrievedChunks = await retrieveBookChunks(pool, payload)
  }

  const enrichedPayload = {
    ...payload,
    passages: retrievedChunks.length ? retrievedChunks.map((chunk) => chunk.content) : payload.passages,
    retrievedChunks,
  }

  const provider = selectLlmProvider()
  if (provider === 'deepseek') {
    return await createDeepSeekTutorAnswer(enrichedPayload)
  }

  if (provider === 'gemini') {
    return await createGeminiTutorAnswer(enrichedPayload)
  }

  if (provider === 'offline') {
    return {
      mode: 'missing_api_key',
      answer: null,
      sources: enrichedPayload.retrievedChunks ?? [],
    }
  }

  return await createOpenAiTutorAnswer(enrichedPayload)
}

export async function saveTutorSession(pool, payload, result) {
  if (!pool || !payload.student?.id) return

  await pool.query(
    `insert into tutor_sessions (student_id, topic_id, question, answer, source_passages, mode)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      payload.student.id,
      payload.topic?.id ?? null,
      payload.question,
      result.answer,
      JSON.stringify(result.sources ?? payload.passages ?? []),
      result.mode,
    ],
  )
}
