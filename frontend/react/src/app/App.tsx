import { type FormEvent, useCallback, useEffect, useState } from 'react'
import '../styles/App.css'

type Topic = {
  id: string
  chapterNo: number
  chapter: string
  tamilName: string
  name: string
  level: 'Easy' | 'Medium' | 'Hard'
  minutes: number
  mastered: number
  subtopics: string[]
  steps: string[]
  example: string
  formula: string
  doubtHint: string
}

type Note = {
  id: number
  topicId: string
  text: string
}

type Student = {
  id?: string
  name: string
  email: string
  grade: string
}

type BookSource = {
  title: string
  content: string
  updatedAt: string
}

type KnowledgeStatus = {
  documents: number
  chunks: number
  lastIngestedAt: string | null
}

type RetrievedChunk = {
  id: number
  chapterNo: number
  chapterTitle: string
  chunkIndex?: number
  content: string
  rank: number
}

const topics: Topic[] = [
  {
    id: 'relations-functions',
    chapterNo: 1,
    chapter: 'Relations and Functions',
    tamilName: 'Uravugal and Sarbugal',
    name: 'Ordered pairs and mapping',
    level: 'Easy',
    minutes: 35,
    mastered: 78,
    subtopics: [
      '1.1 Introduction',
      '1.2 Ordered Pair',
      '1.3 Cartesian Product',
      '1.4 Relations',
      '1.5 Functions',
      '1.6 Representation of Functions',
      '1.7 Types of Functions',
      '1.8 Special Cases of Functions',
      '1.9 Composition of Functions',
      '1.10 Identifying Graphs of Linear, Quadratic, Cubic and Reciprocal Functions',
    ],
    formula: 'f(x) = y',
    example: 'If f(x) = 2x + 3, then f(4) = 11.',
    doubtHint: 'Check whether every input has exactly one output.',
    steps: [
      'Start with ordered pairs like (1, 5) and identify input and output.',
      'Draw arrows from domain values to codomain values.',
      'Confirm that one input does not point to two different outputs.',
      'Practice by creating a function table and plotting points.',
    ],
  },
  {
    id: 'numbers-sequences',
    chapterNo: 2,
    chapter: 'Numbers and Sequences',
    tamilName: 'Enkal and Thodargal',
    name: 'Arithmetic progression',
    level: 'Medium',
    minutes: 45,
    mastered: 62,
    subtopics: [
      '2.1 Introduction',
      '2.2 Euclid\'s Division Lemma',
      '2.3 Euclid\'s Division Algorithm',
      '2.4 Fundamental Theorem of Arithmetic',
      '2.5 Modular Arithmetic',
      '2.6 Sequences',
      '2.7 Arithmetic Progression',
      '2.8 Series',
      '2.9 Geometric Progression',
      '2.10 Sum to n terms of a Geometric Progression',
      '2.11 Special Series',
    ],
    formula: 'a_n = a + (n - 1)d',
    example: 'For 3, 7, 11, 15: a = 3 and d = 4, so a_8 = 31.',
    doubtHint: 'Find the common difference before using the nth term formula.',
    steps: [
      'Identify the first term, common difference, and required term number.',
      'Substitute values in a_n = a + (n - 1)d.',
      'For sums, use S_n = n/2[2a + (n - 1)d].',
      'Verify the answer by writing a few terms manually.',
    ],
  },
  {
    id: 'algebra-quadratics',
    chapterNo: 3,
    chapter: 'Algebra',
    tamilName: 'Iyarkanitham',
    name: 'Quadratic equations',
    level: 'Hard',
    minutes: 50,
    mastered: 46,
    subtopics: [
      '3.1 Introduction',
      '3.2 Simultaneous Linear Equations in Three Variables',
      '3.3 GCD and LCM of Polynomials',
      '3.4 Rational Expressions',
      '3.5 Square Root of Polynomials',
      '3.6 Quadratic Equations',
      '3.7 Graph of Variations',
      '3.8 Quadratic Graphs',
      '3.9 Matrices',
    ],
    formula: 'x = (-b +/- sqrt(b^2 - 4ac)) / 2a',
    example: 'x^2 - 5x + 6 = 0 gives x = 2 or x = 3.',
    doubtHint: 'If factorisation is hard, switch to the quadratic formula.',
    steps: [
      'Write the equation in ax^2 + bx + c = 0 form.',
      'Try factorisation by finding two numbers whose product is ac.',
      'Use the quadratic formula when factors are not obvious.',
      'Substitute roots back into the original equation to check.',
    ],
  },
  {
    id: 'geometry-circles',
    chapterNo: 4,
    chapter: 'Geometry',
    tamilName: 'Vadiviyal',
    name: 'Circle theorems',
    level: 'Medium',
    minutes: 40,
    mastered: 58,
    subtopics: [
      '4.1 Introduction',
      '4.2 Similarity',
      '4.3 Thales Theorem and Angle Bisector Theorem',
      '4.4 Pythagoras Theorem',
      '4.5 Circles and Tangents',
      '4.6 Concurrency Theorems',
    ],
    formula: 'Angle in a semicircle = 90 degrees',
    example: 'If AB is a diameter and C is on the circle, angle ACB is 90 degrees.',
    doubtHint: 'Mark the radius, diameter, chord, and tangent before solving.',
    steps: [
      'Label the centre, radius, chord, diameter, and tangent clearly.',
      'Recall that equal chords subtend equal angles.',
      'Use the tangent-radius perpendicular rule when a tangent appears.',
      'Write reasons for every angle statement to score full marks.',
    ],
  },
  {
    id: 'coordinate-geometry',
    chapterNo: 5,
    chapter: 'Coordinate Geometry',
    tamilName: 'Ayatholaivu Vadiviyal',
    name: 'Distance, section and area',
    level: 'Medium',
    minutes: 45,
    mastered: 51,
    subtopics: [
      '5.1 Introduction',
      '5.2 Area of a Triangle',
      '5.3 Area of a Quadrilateral',
      '5.4 Inclination of a Line',
      '5.5 Straight Line',
      '5.6 General Form of a Straight Line',
    ],
    formula: 'Distance = sqrt((x2 - x1)^2 + (y2 - y1)^2)',
    example: 'Distance between (2, 3) and (5, 7) is sqrt(3^2 + 4^2) = 5.',
    doubtHint: 'Write the two points clearly and substitute x and y values in the correct order.',
    steps: [
      'Mark the given coordinates as (x1, y1) and (x2, y2).',
      'Choose distance, section, midpoint, or area formula based on the question.',
      'Substitute values carefully with signs.',
      'Simplify squares and roots step by step.',
    ],
  },
  {
    id: 'trigonometry',
    chapterNo: 6,
    chapter: 'Trigonometry',
    tamilName: 'Mukkonaviyal',
    name: 'Heights and distances',
    level: 'Hard',
    minutes: 55,
    mastered: 39,
    subtopics: [
      '6.1 Introduction',
      '6.2 Trigonometric Identities',
      '6.3 Heights and Distances',
    ],
    formula: 'tan(theta) = opposite / adjacent',
    example: 'If tan 45 = h / 20, then h = 20 m.',
    doubtHint: 'Draw the right triangle first; the diagram almost solves half the sum.',
    steps: [
      'Draw a right triangle from the word problem.',
      'Mark angle of elevation or depression from the horizontal line.',
      'Choose sin, cos, or tan based on the known side and unknown side.',
      'Keep units consistent and round only at the final answer.',
    ],
  },
  {
    id: 'mensuration',
    chapterNo: 7,
    chapter: 'Mensuration',
    tamilName: 'Alaviyal',
    name: 'Surface area and volume',
    level: 'Medium',
    minutes: 50,
    mastered: 43,
    subtopics: [
      '7.1 Introduction',
      '7.2 Surface Area',
      '7.3 Volume',
      '7.4 Volume and Surface Area of Combined Solids',
      '7.5 Conversion of Solids from one Shape to another with no change in Volume',
    ],
    formula: 'Cylinder volume = pi r^2 h',
    example: 'A cylinder with r = 7 cm and h = 10 cm has volume 1540 cubic cm using pi = 22/7.',
    doubtHint: 'Identify the solid first, then write the exact formula before substituting values.',
    steps: [
      'Draw or imagine the given solid and mark radius, height, and slant height.',
      'Select curved surface area, total surface area, or volume.',
      'Use the correct unit: square units for area and cubic units for volume.',
      'For combined solids, add or subtract only the visible/required parts.',
    ],
  },
  {
    id: 'statistics-probability',
    chapterNo: 8,
    chapter: 'Statistics and Probability',
    tamilName: 'Pulliyiyal and Nigalthagavu',
    name: 'Data and chance',
    level: 'Easy',
    minutes: 45,
    mastered: 57,
    subtopics: [
      '8.1 Introduction',
      '8.2 Measures of Dispersion',
      '8.3 Coefficient of Variation',
      '8.4 Probability',
      '8.5 Algebra of Events',
      '8.6 Addition Theorem of Probability',
    ],
    formula: 'P(E) = favourable outcomes / total outcomes',
    example: 'For one die, probability of getting an even number is 3/6 = 1/2.',
    doubtHint: 'List the total outcomes first, then count only the favourable outcomes.',
    steps: [
      'For statistics, arrange the data and identify the required measure.',
      'For mean, add all values and divide by the number of values.',
      'For probability, list total outcomes and favourable outcomes.',
      'Write probability as a simplified fraction whenever possible.',
    ],
  },
]

const defaultBookText = `Tamil Nadu State Board Grade 10 Mathematics sample knowledge base.

Arithmetic Progression: A sequence is an arithmetic progression when the difference between any two consecutive terms is constant. The nth term is a_n = a + (n - 1)d, where a is the first term, d is the common difference, and n is the term number. The sum of first n terms is S_n = n/2[2a + (n - 1)d].

Quadratic Equations: A quadratic equation has the form ax^2 + bx + c = 0. If it can be factorised, split the middle term. Otherwise use x = (-b +/- sqrt(b^2 - 4ac)) / 2a. The discriminant b^2 - 4ac tells the nature of roots.

Circle Theorems: The angle in a semicircle is 90 degrees. The tangent at any point of a circle is perpendicular to the radius through the point of contact. Equal chords of a circle subtend equal angles at the centre.

Trigonometry: In a right triangle, sin theta = opposite / hypotenuse, cos theta = adjacent / hypotenuse, and tan theta = opposite / adjacent. Heights and distances problems should first be converted into a right-triangle diagram.

Relations and Functions: A relation is a set of ordered pairs. A function is a special relation where each input has exactly one output.`

const defaultBook: BookSource = {
  title: 'Grade 10 Math Sample Book',
  content: defaultBookText,
  updatedAt: new Date().toISOString(),
}

const quizBank = [
  {
    topicId: 'relations-functions',
    question: 'Which rule is a function?',
    options: ['Every input has one output', 'One input has many outputs', 'No input has output'],
    answer: 0,
  },
  {
    topicId: 'numbers-sequences',
    question: 'Find the 6th term of 5, 8, 11, ...',
    options: ['18', '20', '23'],
    answer: 1,
  },
  {
    topicId: 'algebra-quadratics',
    question: 'Roots of x^2 - 7x + 12 = 0 are',
    options: ['3 and 4', '2 and 6', '1 and 12'],
    answer: 0,
  },
  {
    topicId: 'geometry-circles',
    question: 'Angle in a semicircle is',
    options: ['45 degrees', '90 degrees', '180 degrees'],
    answer: 1,
  },
  {
    topicId: 'coordinate-geometry',
    question: 'Distance between (0, 0) and (3, 4) is',
    options: ['5', '7', '25'],
    answer: 0,
  },
  {
    topicId: 'trigonometry',
    question: 'tan(theta) is equal to',
    options: ['Adjacent / hypotenuse', 'Opposite / adjacent', 'Opposite / hypotenuse'],
    answer: 1,
  },
  {
    topicId: 'mensuration',
    question: 'Volume of a cylinder is',
    options: ['pi r^2 h', '2 pi r', '4 pi r^2'],
    answer: 0,
  },
  {
    topicId: 'statistics-probability',
    question: 'Probability is always between',
    options: ['0 and 1', '1 and 10', '-1 and 1'],
    answer: 0,
  },
]

const reminders = [
  { time: '06:30 PM', title: 'AP formula revision', status: 'Today' },
  { time: '07:15 PM', title: 'Geometry theorem test', status: 'Tomorrow' },
  { time: '08:00 PM', title: 'Update notes and doubts', status: 'Daily' },
]

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function getRelevantPassages(book: string, question: string, topic: Topic) {
  const queryWords = new Set(
    `${question} ${topic.chapter} ${topic.name} ${topic.formula}`
      .toLowerCase()
      .replace(/[^a-z0-9_+\-\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2),
  )

  return book
    .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
    .map((passage) => {
      const lowered = passage.toLowerCase()
      const score = [...queryWords].filter((word) => lowered.includes(word)).length
      return { passage: passage.trim(), score }
    })
    .filter((item) => item.passage.length > 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.passage)
}

function buildLocalTutorAnswer(question: string, topic: Topic, passages: string[]) {
  const guidance = passages.length
    ? `Relevant idea: ${passages[0]}`
    : `Relevant idea: Start from ${topic.chapter} and identify the known values.`

  return `Question: ${question}\n\n${guidance}\n\nStep-by-step: ${topic.doubtHint} Use ${topic.formula}. First identify the known values, then substitute them carefully, simplify one line at a time, and verify the answer with the original question.`
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? 'API request failed')
  }
  return data
}

function App() {
  const [student, setStudent] = useState<Student | null>(() => readStorage('kalvi-student', null))
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', grade: '10' })
  const [authError, setAuthError] = useState('')
  const [selectedTopicId, setSelectedTopicId] = useState(topics[1].id)
  const [completed, setCompleted] = useState<string[]>(() => readStorage('kalvi-completed', ['relations-functions']))
  const [credits, setCredits] = useState(() => Number(localStorage.getItem('kalvi-credits') ?? 120))
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [doubt, setDoubt] = useState('Why do we use n - 1 in AP formula?')
  const [answer, setAnswer] = useState('')
  const [answerStatus, setAnswerStatus] = useState<'idle' | 'loading' | 'local' | 'llm'>('idle')
  const [, setAnswerSources] = useState<RetrievedChunk[]>([])
  const [chapterChunks, setChapterChunks] = useState<RetrievedChunk[]>([])
  const [knowledgeStatus, setKnowledgeStatus] = useState<KnowledgeStatus | null>(null)
  const [knowledgeMessage, setKnowledgeMessage] = useState('')
  const [book, setBook] = useState<BookSource>(() => readStorage('kalvi-book', defaultBook))
  const [bookDraft, setBookDraft] = useState(book.content)
  const [notes, setNotes] = useState<Note[]>(() =>
    readStorage('kalvi-notes', [{ id: 1, topicId: topics[1].id, text: 'AP la common difference first identify pannanum.' }]),
  )
  const [noteDraft, setNoteDraft] = useState('')

  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? topics[0]
  const selectedQuiz = quizBank.find((quiz) => quiz.topicId === selectedTopicId) ?? quizBank[0]
  const completedPercent = Math.round((completed.length / topics.length) * 100)
  const score = Object.entries(quizAnswers).filter(([topicId, chosenAnswer]) => {
    return quizBank.find((quiz) => quiz.topicId === topicId)?.answer === chosenAnswer
  }).length

  const refreshKnowledgeStatus = useCallback(async () => {
    try {
      const data = await apiRequest<{ knowledgeBase: KnowledgeStatus }>('/api/rag/status')
      setKnowledgeStatus(data.knowledgeBase)
    } catch {
      setKnowledgeStatus(null)
    }
  }, [])

  const loadSelectedChapterContext = useCallback(async () => {
    try {
      const data = await apiRequest<{ chunks: RetrievedChunk[] }>(`/api/rag/chapter?chapterNo=${selectedTopic.chapterNo}`)
      setChapterChunks(data.chunks)
    } catch {
      setChapterChunks([])
    }
  }, [selectedTopic.chapterNo])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshKnowledgeStatus()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refreshKnowledgeStatus])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSelectedChapterContext()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadSelectedChapterContext])

  useEffect(() => {
    localStorage.setItem('kalvi-completed', JSON.stringify(completed))
  }, [completed])

  useEffect(() => {
    localStorage.setItem('kalvi-credits', String(credits))
  }, [credits])

  useEffect(() => {
    localStorage.setItem('kalvi-notes', JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    localStorage.setItem('kalvi-book', JSON.stringify(book))
  }, [book])

  useEffect(() => {
    if (!student?.id) return

    apiRequest<{ book: BookSource | null }>(`/api/book?studentId=${student.id}`)
      .then((data) => {
        if (!data.book) return
        const nextBook = {
          title: data.book.title,
          content: data.book.content,
          updatedAt: data.book.updatedAt ?? new Date().toISOString(),
        }
        setBook(nextBook)
        setBookDraft(nextBook.content)
      })
      .catch(() => {
        // The local sample book keeps the UI usable while DB setup is pending.
      })
  }, [student])

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')

    try {
      const path = authMode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const data = await apiRequest<{ student: Student }>(path, {
        method: 'POST',
        body: JSON.stringify({
          name: authForm.name || authForm.email.split('@')[0] || 'Student',
          email: authForm.email,
          password: authForm.password,
          grade: authForm.grade,
        }),
      })
      setStudent(data.student)
      localStorage.setItem('kalvi-student', JSON.stringify(data.student))
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to authenticate')
    }
  }

  function logout() {
    setStudent(null)
    localStorage.removeItem('kalvi-student')
  }

  function completeTopic() {
    if (!completed.includes(selectedTopic.id)) {
      setCompleted((current) => [...current, selectedTopic.id])
      setCredits((current) => current + 25)
      if (student?.id) {
        apiRequest('/api/progress', {
          method: 'POST',
          body: JSON.stringify({
            studentId: student.id,
            topicId: selectedTopic.id,
            eventType: 'topic_completed',
            credits: 25,
          }),
        }).catch(() => undefined)
      }
    }
  }

  function answerQuiz(chosenAnswer: number) {
    const previous = quizAnswers[selectedTopic.id]
    setQuizAnswers((current) => ({ ...current, [selectedTopic.id]: chosenAnswer }))
    if (chosenAnswer === selectedQuiz.answer && previous !== chosenAnswer) {
      setCredits((current) => current + 10)
    }
  }

  function addNote() {
    if (!noteDraft.trim()) return
    const nextNote = { id: Date.now(), topicId: selectedTopic.id, text: noteDraft.trim() }
    setNotes((current) => [nextNote, ...current])
    if (student?.id) {
      apiRequest('/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          studentId: student.id,
          topicId: selectedTopic.id,
          text: nextNote.text,
        }),
      }).catch(() => undefined)
    }
    setNoteDraft('')
  }

  function saveBook() {
    const nextBook = {
      title: 'Uploaded Grade 10 Math Book',
      content: bookDraft,
      updatedAt: new Date().toISOString(),
    }
    setBook(nextBook)
    if (student?.id) {
      apiRequest('/api/book', {
        method: 'POST',
        body: JSON.stringify({
          studentId: student.id,
          title: nextBook.title,
          content: nextBook.content,
        }),
      }).catch(() => undefined)
    }
  }

  function uploadBook(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const content = String(reader.result ?? '')
      setBookDraft(content)
      setBook({
        title: file.name,
        content,
        updatedAt: new Date().toISOString(),
      })
      if (student?.id) {
        apiRequest('/api/book', {
          method: 'POST',
          body: JSON.stringify({
            studentId: student.id,
            title: file.name,
            content,
          }),
        }).catch(() => undefined)
      }
    }
    reader.readAsText(file)
  }

  async function ingestPdfBook() {
    setKnowledgeMessage('Ingesting PDF into Postgres knowledge base...')
    try {
      const data = await apiRequest<{
        knowledgeBase: { chunks: number; document: { title: string; totalPages: number } }
      }>('/api/rag/ingest', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      setKnowledgeMessage(`Stored ${data.knowledgeBase.chunks} textbook chunks from ${data.knowledgeBase.document.title}.`)
      await refreshKnowledgeStatus()
      await loadSelectedChapterContext()
    } catch (error) {
      setKnowledgeMessage(error instanceof Error ? error.message : 'Unable to ingest PDF')
    }
  }

  async function previewSelectedChapter() {
    setKnowledgeMessage('Retrieving textbook chunks for selected chapter...')
    try {
      const data = await apiRequest<{ chunks: RetrievedChunk[] }>('/api/rag/retrieve', {
        method: 'POST',
        body: JSON.stringify({
          question: doubt,
          topic: selectedTopic,
        }),
      })
      setAnswerSources(data.chunks)
      setChapterChunks(data.chunks)
      setKnowledgeMessage(`Found ${data.chunks.length} chunks for Chapter ${selectedTopic.chapterNo}.`)
    } catch (error) {
      setKnowledgeMessage(error instanceof Error ? error.message : 'Unable to retrieve chapter chunks')
    }
  }

  async function askTutor() {
    if (!doubt.trim()) return
    setAnswerStatus('loading')
    const passages = getRelevantPassages(book.content, doubt, selectedTopic)

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: doubt,
          topic: selectedTopic,
          passages,
          student,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.answer) {
          setAnswer(data.answer)
          setAnswerStatus('llm')
          setAnswerSources(data.sources ?? [])
          return
        }
      }
    } catch {
      // Local fallback keeps the prototype usable without backend/API setup.
    }

    setAnswer(buildLocalTutorAnswer(doubt, selectedTopic, passages))
    setAnswerSources([])
    setAnswerStatus('local')
  }

  if (!student) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div>
            <p className="eyebrow">Student Access</p>
            <h1>{authMode === 'register' ? 'Create your TutorX AI account' : 'Welcome back'}</h1>
            <p className="auth-copy">Login state is stored locally for this prototype. Production should use SQL-backed auth with encrypted passwords.</p>
          </div>
          <form onSubmit={submitAuth}>
            {authMode === 'register' && (
              <label>
                Full name
                <input
                  required
                  value={authForm.name}
                  onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Student name"
                />
              </label>
            )}
            <label>
              Email
              <input
                required
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="student@example.com"
              />
            </label>
            <label>
              Password
              <input
                required
                minLength={4}
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Minimum 4 characters"
              />
            </label>
            <label>
              Grade
              <input
                value={authForm.grade}
                onChange={(event) => setAuthForm((current) => ({ ...current, grade: event.target.value }))}
              />
            </label>
            <button type="submit">{authMode === 'register' ? 'Register' : 'Login'}</button>
          </form>
          {authError && <p className="error-text">{authError}</p>}
          <button className="ghost-button" type="button" onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}>
            {authMode === 'register' ? 'I already have an account' : 'Create new account'}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Student summary">
        <div>
          <p className="eyebrow">TN State Board Grade {student.grade}</p>
          <h1>TutorX AI Math Tutor</h1>
        </div>
        <div className="student-strip">
          <span>{student.name}</span>
          <span>Credits: {credits}</span>
          <span>Progress: {completedPercent}%</span>
          <span>Quiz Score: {score}/{quizBank.length}</span>
          <button className="small-button" type="button" onClick={logout}>Logout</button>
        </div>
      </section>

      <section className="dashboard-grid">
        <aside className="panel syllabus-panel" aria-label="Syllabus topics">
          <div className="panel-heading">
            <p className="eyebrow">Syllabus Voice</p>
            <h2>Samacheer Topics</h2>
          </div>
          <div className="topic-list">
            {topics.map((topic) => (
              <button
                className={`topic-button ${topic.id === selectedTopic.id ? 'active' : ''}`}
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                type="button"
              >
                <span>
                  <strong>Chapter {topic.chapterNo}: {topic.chapter}</strong>
                  <small>{topic.tamilName}</small>
                  <small>{topic.subtopics.length} textbook topics</small>
                  <span className="sidebar-subtopics">
                    {topic.subtopics.map((subtopic) => (
                      <small key={subtopic}>{subtopic}</small>
                    ))}
                  </span>
                </span>
                <em>{completed.includes(topic.id) ? 'Done' : topic.level}</em>
              </button>
            ))}
          </div>
        </aside>

        <section className="panel lesson-panel" aria-label="Lesson">
          <div className="lesson-header">
            <div>
            <p className="eyebrow">Selected Chapter {selectedTopic.chapterNo}</p>
            <h2>{selectedTopic.chapter}</h2>
            <p className="chapter-subtitle">{selectedTopic.name}</p>
            </div>
            <button type="button" onClick={completeTopic}>Mark studied</button>
          </div>

          <div className="formula-row">
            <div>
              <span>Formula</span>
              <strong>{selectedTopic.formula}</strong>
            </div>
            <div>
              <span>Time</span>
              <strong>{selectedTopic.minutes} min</strong>
            </div>
            <div>
              <span>Mastery</span>
              <strong>{selectedTopic.mastered}%</strong>
            </div>
          </div>

          <ol className="step-list">
            {selectedTopic.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>

          <div className="example-box">
            <span>Worked example</span>
            <p>{selectedTopic.example}</p>
          </div>

          <div className="subtopic-box">
            <span>All PDF topics in this chapter</span>
            <div>
              {selectedTopic.subtopics.map((subtopic) => (
                <em key={subtopic}>{subtopic}</em>
              ))}
            </div>
          </div>

          <div className="chapter-context-box">
            <span>Stored PDF context for this chapter</span>
            {chapterChunks.length ? (
              <div>
                {chapterChunks.slice(0, 8).map((chunk) => (
                  <p key={chunk.id}>{chunk.content}</p>
                ))}
              </div>
            ) : (
              <p>PDF context is not stored yet. Click "Ingest uploaded PDF" in the knowledge base panel, then this area will show textbook content for the selected chapter.</p>
            )}
          </div>
        </section>

        <section className="panel ai-panel" aria-label="AI doubt helper">
          <div className="panel-heading">
            <p className="eyebrow">Book-Grounded Tutor</p>
            <h2>Ask Tutor</h2>
          </div>
          <textarea value={doubt} onChange={(event) => setDoubt(event.target.value)} />
          <button type="button" onClick={askTutor}>Ask from book</button>
          <div className="ai-answer">
            <strong>{answerStatus === 'llm' ? 'LLM response' : answerStatus === 'local' ? 'Local book response' : 'Ready'}</strong>
            <p>{answer || 'Upload/paste a book, ask a doubt, and the tutor will retrieve the closest book passages before answering.'}</p>
          </div>
          <div className="agent-stack">
            <span>Retriever</span>
            <span>LLM Endpoint Ready</span>
            <span>Doubt Agent</span>
          </div>
        </section>

        <section className="panel book-panel" aria-label="Math book knowledge base">
          <div className="panel-heading">
            <p className="eyebrow">Postgres RAG Knowledge Base</p>
            <h2>10th Math PDF</h2>
          </div>
          <div className="rag-status">
            <span>Documents: {knowledgeStatus?.documents ?? 0}</span>
            <span>Chunks: {knowledgeStatus?.chunks ?? 0}</span>
            <span>Chapter: {selectedTopic.chapterNo}</span>
          </div>
          <div className="book-actions">
            <button type="button" onClick={ingestPdfBook}>Ingest uploaded PDF</button>
            <button className="ghost-button" type="button" onClick={previewSelectedChapter}>Preview chapter chunks</button>
          </div>
          {knowledgeMessage && <p className="status-text">{knowledgeMessage}</p>}
          <label className="file-picker">
            Optional text fallback
            <input type="file" accept=".txt,text/plain" onChange={(event) => uploadBook(event.target.files?.[0])} />
          </label>
          <textarea value={bookDraft} onChange={(event) => setBookDraft(event.target.value)} />
          <div className="book-actions">
            <button type="button" onClick={saveBook}>Save book text</button>
            <span>{book.title} saved</span>
          </div>
        </section>

        <section className="panel test-panel" aria-label="Topic test">
          <div className="panel-heading">
            <p className="eyebrow">Topic Test</p>
            <h2>{selectedQuiz.question}</h2>
          </div>
          <div className="quiz-options">
            {selectedQuiz.options.map((option, index) => {
              const selected = quizAnswers[selectedTopic.id] === index
              const correct = selected && index === selectedQuiz.answer
              const wrong = selected && index !== selectedQuiz.answer

              return (
                <button
                  className={`${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}
                  key={option}
                  onClick={() => answerQuiz(index)}
                  type="button"
                >
                  {option}
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel progress-panel" aria-label="Progress analytics">
          <div className="panel-heading">
            <p className="eyebrow">SQL + PowerBI Ready</p>
            <h2>Learning Analytics</h2>
          </div>
          <div className="progress-bar">
            <span style={{ width: `${completedPercent}%` }} />
          </div>
          <div className="metric-grid">
            <div>
              <strong>{completed.length}</strong>
              <span>topics studied</span>
            </div>
            <div>
              <strong>{topics.length - completed.length}</strong>
              <span>pending</span>
            </div>
            <div>
              <strong>{credits}</strong>
              <span>credits earned</span>
            </div>
          </div>
          <code>students, book_chunks, tutor_sessions, quiz_attempts, progress_events</code>
        </section>

        <section className="panel planner-panel" aria-label="Timetable and reminders">
          <div className="panel-heading">
            <p className="eyebrow">Timetable</p>
            <h2>Today Plan</h2>
          </div>
          <div className="reminder-list">
            {reminders.map((item) => (
              <div key={item.title}>
                <strong>{item.time}</strong>
                <span>{item.title}</span>
                <em>{item.status}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="panel notes-panel" aria-label="Notes">
          <div className="panel-heading">
            <p className="eyebrow">Notes</p>
            <h2>My Revision</h2>
          </div>
          <div className="note-input">
            <input
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Write a quick note..."
            />
            <button type="button" onClick={addNote}>Add</button>
          </div>
          <div className="notes-list">
            {notes
              .filter((note) => note.topicId === selectedTopic.id)
              .map((note) => <p key={note.id}>{note.text}</p>)}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
