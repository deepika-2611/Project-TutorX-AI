const maxTutorQuestionLength = 1200

export const tutorGuardrailMessage =
  'I can help with Tamil Nadu State Board Class 10 Mathematics only. Please ask a maths doubt from the selected chapter, and I will explain it step by step.'

const blockedTutorPatterns = [
  /\b(ignore|forget|bypass|override)\b.{0,40}\b(previous|system|developer|instruction|rules?)\b/i,
  /\b(system prompt|developer message|hidden instructions?|jailbreak|prompt injection)\b/i,
  /\b(api[_ -]?key|secret key|session secret|database_url|password hash|bearer token|private key)\b/i,
  /\b(write|create|make|build)\b.{0,30}\b(malware|virus|phishing|keylogger|exploit|ransomware)\b/i,
  /\b(suicide|self[- ]?harm|kill myself|harm myself)\b/i,
  /\b(bomb|weapon|poison|drug dealing|porn|sexual)\b/i,
  /\b(punch|hit|beat|fight|hurt|attack)\b.{0,40}\b(classmate|student|teacher|friend|parent|someone|him|her|them)\b/i,
  /\b(classmate|student|teacher|friend|parent|someone|him|her|them)\b.{0,40}\b(punch|hit|beat|fight|hurt|attack)\b/i,
]

const offTopicTutorPatterns = [
  /\b(movie|song|celebrity|cricket score|politics|election|stock market|crypto|recipe|dating)\b/i,
  /\b(science|physics|chemistry|biology|history|geography|english grammar)\b/i,
]

export function validateTutorRequest(payload, mathTopicById) {
  const question = String(payload.question ?? '').trim()
  if (question.length < 2) {
    const error = new Error('Please enter a maths question before sending.')
    error.statusCode = 400
    throw error
  }

  if (question.length > maxTutorQuestionLength) {
    const error = new Error(`Please keep the question under ${maxTutorQuestionLength} characters.`)
    error.statusCode = 400
    throw error
  }

  const topicId = String(payload.topic?.id ?? '').trim()
  const topic = topicId ? mathTopicById.get(topicId) : null
  if (topicId && !topic) {
    const error = new Error('Please choose a valid Class 10 Mathematics topic.')
    error.statusCode = 400
    throw error
  }

  if (blockedTutorPatterns.some((pattern) => pattern.test(question))) {
    return { allowed: false, message: tutorGuardrailMessage }
  }

  if (offTopicTutorPatterns.some((pattern) => pattern.test(question))) {
    return { allowed: false, message: tutorGuardrailMessage }
  }

  return {
    allowed: true,
    question,
    topic: topic
      ? {
          ...payload.topic,
          id: topic.id,
          chapterNo: topic.chapterNo,
          name: topic.title,
        }
      : payload.topic,
  }
}
