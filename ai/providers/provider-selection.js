export function selectLlmProvider() {
  const requested = String(process.env.LLM_PROVIDER ?? 'auto').toLowerCase()
  if (requested === 'deepseek' && process.env.DEEPSEEK_API_KEY) return 'deepseek'
  if (requested === 'gemini' && process.env.GEMINI_API_KEY) return 'gemini'
  if (requested === 'openai' && process.env.OPENAI_API_KEY) return 'openai'
  if (requested !== 'auto') return 'offline'
  if (process.env.DEEPSEEK_API_KEY) return 'deepseek'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return 'offline'
}
