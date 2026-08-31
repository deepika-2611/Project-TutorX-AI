const moderationScoreThresholds = {
  harassment: 0.72,
  'harassment/threatening': 0.35,
  hate: 0.65,
  'hate/threatening': 0.35,
  illicit: 0.45,
  'illicit/violent': 0.2,
  'self-harm': 0.25,
  'self-harm/intent': 0.2,
  'self-harm/instructions': 0.1,
  sexual: 0.55,
  'sexual/minors': 0.01,
  violence: 0.35,
  'violence/graphic': 0.2,
}

const moderationBlockedMessage =
  'I cannot help with that request. Please ask a safe Class 10 Mathematics question, and I will explain it step by step.'

const selfHarmSupportMessage =
  'I am sorry you are feeling this way. Please pause and talk to a trusted adult, parent, teacher, or local emergency support now. I can continue helping with Class 10 Mathematics when you are safe.'

export async function moderateTutorQuestion(question) {
  const moderationEnabled = String(process.env.MODERATION_ENABLED ?? 'true').toLowerCase() !== 'false'
  const moderationModel = process.env.MODERATION_MODEL ?? 'omni-moderation-latest'

  if (!moderationEnabled || !process.env.OPENAI_API_KEY) {
    return { allowed: true, skipped: true }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: moderationModel,
        input: question,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message ?? 'Moderation request failed')
    }

    const result = data.results?.[0]
    const flaggedCategories = Object.entries(result.categories ?? {})
      .filter(([, flagged]) => Boolean(flagged))
      .map(([category]) => category)

    const scoreCategories = Object.entries(result.category_scores ?? {})
      .filter(([category, score]) => Number(score) >= (moderationScoreThresholds[category] ?? 1))
      .map(([category]) => category)

    const categories = [...new Set([...flaggedCategories, ...scoreCategories])]
    if (!result?.flagged && !categories.length) {
      return { allowed: true, categories: [] }
    }

    console.info('[moderation] tutor_question_blocked', { categories })

    return {
      allowed: false,
      categories,
      message: categories.some((category) => category.startsWith('self-harm'))
        ? selfHarmSupportMessage
        : moderationBlockedMessage,
    }
  } catch (error) {
    console.warn('[moderation] unavailable', { message: error.message })
    return { allowed: true, skipped: true }
  }
}
