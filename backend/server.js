import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { getBearerToken, signSession, tokenHash, verifySessionTokenSignature } from '../auth/session.js'
import { hashPassword, verifyPassword } from '../auth/password.js'
import { ingestPdfKnowledgeBase } from '../ai/rag/ingestion.js'
import { getChapterChunks, getKnowledgeStatus, retrieveBookChunks } from '../ai/rag/retrieval.js'
import { selectLlmProvider } from '../ai/providers/provider-selection.js'
import { createTutorAnswer, saveTutorSession } from '../ai/tutor/tutor.service.js'
import { loadEnvFile } from '../config/env.js'
import { curriculumData } from '../data/curriculum/class-10-math.js'

loadEnvFile()

const { Pool } = pg
const port = Number(process.env.PORT ?? 8787)
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const staticRoot = path.join(projectRoot, 'dist')
const defaultPdfPath =
  process.env.MATH_BOOK_PDF ??
  path.join(projectRoot, 'data', 'textbooks', 'Class_10_Mathematics_English_2025_Edition-www.tntextbooks.in.pdf')
const databaseUrl = process.env.DATABASE_URL
const sessionSecret = process.env.SESSION_SECRET ?? process.env.DEEPSEEK_API_KEY ?? crypto.randomBytes(32).toString('hex')
const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
    })
  : null

const schemaSql = fs.readFileSync(path.join(projectRoot, 'database', 'schema.sql'), 'utf8')

async function createStudentSession(studentId) {
  const db = requireDb()
  const issuedAt = Date.now()
  const token = signSession(studentId, sessionSecret, issuedAt)
  const expiresAt = new Date(issuedAt + 1000 * 60 * 60 * 24 * 30)
  await db.query(
    `insert into student_sessions (student_id, token_hash, expires_at)
     values ($1, $2, $3)`,
    [studentId, tokenHash(token), expiresAt],
  )
  return token
}

async function getAuthorizedStudentId(request, requestedStudentId) {
  const db = requireDb()
  const token = getBearerToken(request)
  const studentId = verifySessionTokenSignature(token, sessionSecret)
  if (!studentId) {
    const error = new Error('Login is required')
    error.statusCode = 401
    throw error
  }
  const sessionResult = await db.query(
    `select id
     from student_sessions
     where student_id = $1
       and token_hash = $2
       and revoked_at is null
       and expires_at > now()`,
    [studentId, tokenHash(token)],
  )
  if (!sessionResult.rows[0]) {
    const error = new Error('Session expired. Please log in again.')
    error.statusCode = 401
    throw error
  }
  if (requestedStudentId && requestedStudentId !== studentId) {
    const error = new Error('You can only access records for the logged-in student')
    error.statusCode = 403
    throw error
  }
  return studentId
}

async function revokeStudentSession(request) {
  const token = getBearerToken(request)
  if (!token) return
  const studentId = verifySessionTokenSignature(token, sessionSecret)
  if (!studentId) return
  await requireDb().query(
    `update student_sessions
     set revoked_at = now()
     where student_id = $1 and token_hash = $2 and revoked_at is null`,
    [studentId, tokenHash(token)],
  )
}

async function initDb() {
  if (!pool) return
  await pool.query('create extension if not exists pgcrypto')
  await pool.query(schemaSql)
  await pool.query('alter table students add column if not exists username text')
  await pool.query('alter table students add column if not exists dob date')
  await pool.query('alter table students add column if not exists gender text')
  await pool.query(`create table if not exists student_sessions (
    id uuid primary key default gen_random_uuid(),
    student_id uuid references students(id) on delete cascade,
    token_hash text unique not null,
    issued_at timestamptz not null default now(),
    expires_at timestamptz not null,
    revoked_at timestamptz
  )`)
  await pool.query('create unique index if not exists students_username_unique_idx on students(lower(username)) where username is not null')
  await pool.query('create index if not exists student_sessions_student_idx on student_sessions(student_id, expires_at desc)')
  await pool.query('create index if not exists progress_events_student_idx on progress_events(student_id, created_at desc)')
  await pool.query('create index if not exists student_topic_progress_student_idx on student_topic_progress(student_id, completed_at desc)')
  await pool.query('create index if not exists assessment_attempts_student_idx on assessment_attempts(student_id, created_at desc)')
  await pool.query('alter table assessment_attempts add column if not exists duration_seconds integer not null default 0')
  await pool.query(`alter table assessment_attempts add column if not exists answers jsonb not null default '[]'::jsonb`)
  await pool.query(`alter table assessment_attempts add column if not exists skill_performance jsonb not null default '{}'::jsonb`)
  await pool.query(`alter table assessment_attempts add column if not exists weak_areas jsonb not null default '[]'::jsonb`)
  await pool.query(`alter table assessment_attempts add column if not exists recommendations jsonb not null default '[]'::jsonb`)
}

function requireDb() {
  if (!pool) {
    const error = new Error('DATABASE_URL is not configured')
    error.statusCode = 503
    throw error
  }
  return pool
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > 1_500_000) {
        request.destroy()
        reject(new Error('Request body too large'))
      }
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  })
  response.end(JSON.stringify(payload))
}

const staticMimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

function sendStaticFile(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`)
  const pathname = decodeURIComponent(url.pathname)
  const requestedPath = pathname === '/' ? '/index.html' : pathname
  let filePath = path.resolve(staticRoot, `.${requestedPath}`)

  if (!filePath.startsWith(staticRoot)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Forbidden')
    return
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(staticRoot, 'index.html')
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }

    response.writeHead(200, {
      'Content-Type': staticMimeTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    })
    response.end(data)
  })
}

function logAuthEvent(event, details = {}) {
  const safeDetails = Object.fromEntries(
    Object.entries(details).filter(([key]) => !['password', 'passwordHash', 'token'].includes(key)),
  )
  console.info(`[auth] ${event}`, safeDetails)
}

function publicStudent(row) {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    grade: row.grade,
    dob: row.dob,
    gender: row.gender,
  }
}

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters long'
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter'
  if (!/\d/.test(password)) return 'Password must include a number'
  return ''
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function registerStudent(payload) {
  const db = requireDb()
  const email = String(payload.email ?? '').trim().toLowerCase()
  const username = email
  const name = String(payload.name ?? '').trim()
  const password = String(payload.password ?? '')
  const grade = String(payload.grade ?? '10').trim() || '10'
  const dob = String(payload.dob ?? '').trim()
  const gender = String(payload.gender ?? '').trim().toLowerCase()
  const passwordError = validatePassword(password)

  if (!name || !email || !dob || !gender || passwordError) {
    logAuthEvent('register_validation_failed', {
      nameProvided: Boolean(name),
      emailProvided: Boolean(email),
      dobProvided: Boolean(dob),
      genderProvided: Boolean(gender),
      passwordLength: password.length,
    })
    const error = new Error(passwordError || 'Name, email, date of birth, and gender are required')
    error.statusCode = 400
    throw error
  }

  if (!validateEmail(email)) {
    const error = new Error('Please enter a valid email address')
    error.statusCode = 400
    throw error
  }

  if (Number.isNaN(Date.parse(dob))) {
    const error = new Error('Please enter a valid date of birth')
    error.statusCode = 400
    throw error
  }

  if (!['female', 'male', 'non_binary', 'prefer_not_to_say'].includes(gender)) {
    const error = new Error('Please select a valid gender')
    error.statusCode = 400
    throw error
  }

  let result
  try {
    result = await db.query(
      `insert into students (
         username,
         name,
         email,
         grade,
         dob,
         gender,
         password_hash
       )
       values ($1, $2, $3, $4, $5, $6, $7)
       returning
         id,
         username,
         name,
         email,
         grade,
         dob,
         gender`,
      [
        username,
        name,
        email,
        grade,
        dob,
        gender,
        hashPassword(password),
      ],
    )
  } catch (error) {
    if (error.code === '23505') {
      logAuthEvent('register_duplicate', { username, email })
      const friendly = new Error('That username or email is already registered. Please log in or choose another username.')
      friendly.statusCode = 409
      throw friendly
    }
    logAuthEvent('register_database_error', { username, code: error.code, message: error.message })
    throw error
  }

  logAuthEvent('register_success', { studentId: result.rows[0].id, username })
  return publicStudent(result.rows[0])
}

async function loginStudent(payload) {
  const db = requireDb()
  const username = String(payload.username ?? payload.email ?? '').trim().toLowerCase()
  const password = String(payload.password ?? '')
  if (!username || !password) {
    logAuthEvent('login_validation_failed', {
      usernameProvided: Boolean(username),
      passwordProvided: Boolean(password),
    })
    const error = new Error('Username and password are required')
    error.statusCode = 400
    throw error
  }

  const result = await db.query(
    'select * from students where lower(username) = $1 or lower(email) = $1',
    [username],
  )
  const row = result.rows[0]

  if (!row) {
    logAuthEvent('login_failed', {
      username,
      reason: 'student_not_found',
    })
    const error = new Error('User does not exist')
    error.statusCode = 401
    throw error
  }

  if (!verifyPassword(password, row.password_hash)) {
    logAuthEvent('login_failed', {
      username,
      reason: 'wrong_password',
    })
    const error = new Error('Password is wrong')
    error.statusCode = 401
    throw error
  }

  logAuthEvent('login_success', { studentId: row.id, username: row.username })
  return publicStudent(row)
}

const mathChapters = curriculumData.maths.chapters
const mathTopics = mathChapters.flatMap((chapter) =>
  chapter.topics.map((topic) => ({
    ...topic,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
  })),
)
const mathTopicById = new Map(mathTopics.map((topic) => [topic.id, topic]))
const mathChapterCount = mathChapters.length
const mathTopicCount = mathTopics.length

function getChapterNo(chapter) {
  return Number(chapter.chapterNo ?? chapter.topics[0]?.chapterNo ?? 0)
}

function buildTopicProgress(rows) {
  const completed = new Set(rows.map((row) => row.topic_id))
  return mathChapters.map((chapter) => {
    const completedTopics = chapter.topics.filter((topic) => completed.has(topic.id)).length
    const totalTopics = chapter.topics.length
    return {
      chapterNo: getChapterNo(chapter),
      title: chapter.title,
      completedTopics,
      totalTopics,
      percentage: totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0,
    }
  })
}

async function getStudentDashboard(studentId) {
  const db = requireDb()
  if (!studentId) {
    const error = new Error('studentId is required')
    error.statusCode = 400
    throw error
  }

  const studentResult = await db.query(
    `select
       id,
       username,
       name,
       email,
       grade,
       dob,
       gender
     from students
     where id = $1
     limit 1`,
    [studentId],
  )

  if (!studentResult.rows[0]) {
    const error = new Error('Student not found')
    error.statusCode = 404
    throw error
  }

  const [topicProgressResult, chapterProgressResult, sessionsResult, notesResult, assessmentResult, recentResult] =
    await Promise.all([
      db.query(
        `select topic_id, chapter_no, credits, completed_at
         from student_topic_progress
         where student_id = $1
         order by completed_at desc`,
        [studentId],
      ),
      db.query(
        `select chapter_no, completed_at
         from chapter_progress
         where student_id = $1
         order by completed_at desc`,
        [studentId],
      ),
      db.query('select count(*)::int as count from tutor_sessions where student_id = $1', [studentId]),
      db.query('select count(*)::int as count from notes where student_id = $1', [studentId]),
      db.query(
        `select
           count(*)::int as attempts,
           count(*) filter (where percentage >= 70)::int as passed,
           coalesce(round(avg(percentage)), 0)::int as average
         from assessment_attempts
         where student_id = $1`,
        [studentId],
      ),
      db.query(
        `select activity_type as "activityType", topic_id as "topicId", chapter_no as "chapterNo", percentage, created_at as "createdAt"
         from (
           select 'chapter_completed' as activity_type, null::text as topic_id, chapter_no, null::int as percentage, completed_at as created_at
           from chapter_progress
           where student_id = $1
           union all
           select 'topic_completed' as activity_type, topic_id, chapter_no, null::int as percentage, completed_at as created_at
           from student_topic_progress
           where student_id = $1
           union all
           select 'assessment_completed' as activity_type, topic_id, chapter_no, percentage, created_at
           from assessment_attempts
           where student_id = $1
         ) recent
         order by created_at desc
         limit 8`,
        [studentId],
      ),
    ])

  const completedTopicIds = topicProgressResult.rows
    .map((row) => row.topic_id)
    .filter((topicId) => mathTopicById.has(topicId))
  const completedChapterNos = chapterProgressResult.rows.map((row) => Number(row.chapter_no))
  const completedChapters = chapterProgressResult.rows.length
  const completedTopics = completedTopicIds.length
  const completionPercentage = mathTopicCount ? Math.round((completedTopics / mathTopicCount) * 100) : 0

  return {
    ...publicStudent(studentResult.rows[0]),
    credits: topicProgressResult.rows.reduce((sum, row) => sum + Number(row.credits ?? 0), 0),
    completedTopics,
    totalTopics: mathTopicCount,
    completedTopicIds,
    completedChapterNos,
    completedChapters,
    totalChapters: mathChapterCount,
    remainingChapters: Math.max(mathChapterCount - completedChapters, 0),
    completionPercentage,
    topicProgress: buildTopicProgress(topicProgressResult.rows),
    tutorSessions: sessionsResult.rows[0]?.count ?? 0,
    notes: notesResult.rows[0]?.count ?? 0,
    assessments: assessmentResult.rows[0] ?? { attempts: 0, passed: 0, average: 0 },
    recentActivity: recentResult.rows,
  }
}

async function saveBook(payload) {
  const db = requireDb()
  const studentId = payload.studentId
  const title = String(payload.title ?? 'Grade 10 Math Book')
  const content = String(payload.content ?? '')

  if (!studentId || !content.trim()) {
    const error = new Error('studentId and book content are required')
    error.statusCode = 400
    throw error
  }

  const result = await db.query(
    `insert into books (student_id, title, content)
     values ($1, $2, $3)
     returning id, title, content, updated_at as "updatedAt"`,
    [studentId, title, content],
  )
  return result.rows[0]
}

async function getLatestBook(studentId) {
  const db = requireDb()
  const result = await db.query(
    `select id, title, content, updated_at as "updatedAt"
     from books
     where student_id = $1
     order by updated_at desc
     limit 1`,
    [studentId],
  )
  return result.rows[0] ?? null
}

async function saveProgress(payload) {
  const db = requireDb()
  const topicId = String(payload.topicId ?? '')
  const topic = mathTopicById.get(topicId)
  if (!topic) {
    const error = new Error('Only Mathematics topic progress can be saved')
    error.statusCode = 400
    throw error
  }

  const credits = Number(payload.credits ?? 0)
  const client = await db.connect()
  try {
    await client.query('begin')
    await client.query(
      `insert into progress_events (student_id, topic_id, event_type, credits)
       values ($1, $2, $3, $4)`,
      [payload.studentId, topicId, payload.eventType ?? 'topic_completed', credits],
    )
    await client.query(
      `insert into student_topic_progress (student_id, topic_id, chapter_no, credits)
       values ($1, $2, $3, $4)
       on conflict (student_id, topic_id)
       do update set credits = greatest(student_topic_progress.credits, excluded.credits)`,
      [payload.studentId, topicId, topic.chapterNo, credits],
    )

    const chapterTopics = mathChapters.find((chapter) => getChapterNo(chapter) === topic.chapterNo)?.topics ?? []
    const completedResult = await client.query(
      `select count(*)::int as completed
       from student_topic_progress
       where student_id = $1 and chapter_no = $2`,
      [payload.studentId, topic.chapterNo],
    )
    const chapterCompleted = completedResult.rows[0].completed >= chapterTopics.length
    if (chapterCompleted) {
      await client.query(
        `insert into chapter_progress (student_id, chapter_no)
         values ($1, $2)
         on conflict (student_id, chapter_no) do nothing`,
        [payload.studentId, topic.chapterNo],
      )
    }

    await client.query('commit')
    return { saved: true, chapterCompleted, chapterNo: topic.chapterNo }
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

async function saveAssessmentAttempt(payload) {
  const db = requireDb()
  const topic = mathTopicById.get(String(payload.topicId ?? ''))
  if (!topic) {
    const error = new Error('Only Mathematics assessment results can be saved')
    error.statusCode = 400
    throw error
  }

  const score = Number(payload.score ?? 0)
  const totalQuestions = Number(payload.totalQuestions ?? 0)
  const percentage = Number(payload.percentage ?? 0)
  if (!Number.isFinite(score) || !Number.isFinite(totalQuestions) || totalQuestions < 1) {
    const error = new Error('Assessment score and total question count are required')
    error.statusCode = 400
    throw error
  }

  const result = await db.query(
    `insert into assessment_attempts (
       student_id,
       topic_id,
       chapter_no,
       score,
       total_questions,
       percentage,
       duration_seconds,
       answers,
       skill_performance,
       weak_areas,
       recommendations
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     returning
       id,
       topic_id as "topicId",
       chapter_no as "chapterNo",
       score,
       total_questions as "totalQuestions",
       percentage,
       duration_seconds as "durationSeconds",
       answers,
       skill_performance as "skillPerformance",
       weak_areas as "weakAreas",
       recommendations,
       created_at as "createdAt"`,
    [
      payload.studentId,
      topic.id,
      topic.chapterNo,
      score,
      totalQuestions,
      percentage,
      Number(payload.durationSeconds ?? 0),
      JSON.stringify(payload.answers ?? []),
      JSON.stringify(payload.skillPerformance ?? {}),
      JSON.stringify(payload.weakAreas ?? []),
      JSON.stringify(payload.recommendations ?? []),
    ],
  )
  return result.rows[0]
}

async function saveNote(payload) {
  const db = requireDb()
  const result = await db.query(
    `insert into notes (student_id, topic_id, note)
     values ($1, $2, $3)
     returning id, topic_id as "topicId", note as text, created_at`,
    [payload.studentId, payload.topicId, payload.text],
  )
  return result.rows[0]
}

async function handleRoute(request, payload) {
  const url = new URL(request.url, `http://${request.headers.host}`)

  if (request.method === 'GET' && url.pathname === '/api/health') {
    const provider = selectLlmProvider()
    return {
      database: Boolean(pool),
      llm: provider !== 'offline',
      provider,
      configured: {
        deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
        gemini: Boolean(process.env.GEMINI_API_KEY),
        openai: Boolean(process.env.OPENAI_API_KEY),
      },
    }
  }

  if (request.method === 'GET' && url.pathname === '/api/rag/status') {
    return { knowledgeBase: await getKnowledgeStatus(requireDb()) }
  }

  if (request.method === 'POST' && url.pathname === '/api/rag/ingest') {
    return { knowledgeBase: await ingestPdfKnowledgeBase(requireDb(), payload.filePath ?? defaultPdfPath) }
  }

  if (request.method === 'POST' && url.pathname === '/api/rag/retrieve') {
    return { chunks: await retrieveBookChunks(requireDb(), payload) }
  }

  if (request.method === 'GET' && url.pathname === '/api/rag/chapter') {
    return { chunks: await getChapterChunks(requireDb(), url.searchParams.get('chapterNo')) }
  }

  if (request.method === 'GET' && url.pathname === '/api/student/dashboard') {
    const studentId = await getAuthorizedStudentId(request, url.searchParams.get('studentId'))
    return { dashboard: await getStudentDashboard(studentId) }
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/register') {
    const student = await registerStudent(payload)
    return { student, token: await createStudentSession(student.id) }
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    const student = await loginStudent(payload)
    return { student, token: await createStudentSession(student.id) }
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
    await revokeStudentSession(request)
    return { ok: true }
  }

  if (request.method === 'GET' && url.pathname === '/api/auth/session') {
    const studentId = await getAuthorizedStudentId(request)
    const studentResult = await requireDb().query(
      `select
         id,
         username,
         name,
         email,
         grade,
         dob,
         gender
       from students
       where id = $1
       limit 1`,
      [studentId],
    )
    return { student: publicStudent(studentResult.rows[0]) }
  }

  if (request.method === 'POST' && url.pathname === '/api/book') {
    const studentId = await getAuthorizedStudentId(request, payload.studentId)
    return { book: await saveBook({ ...payload, studentId }) }
  }

  if (request.method === 'GET' && url.pathname === '/api/book') {
    const studentId = await getAuthorizedStudentId(request, url.searchParams.get('studentId'))
    return { book: await getLatestBook(studentId) }
  }

  if (request.method === 'POST' && url.pathname === '/api/progress') {
    const studentId = await getAuthorizedStudentId(request, payload.studentId)
    return await saveProgress({ ...payload, studentId })
  }

  if (request.method === 'POST' && url.pathname === '/api/assessments') {
    const studentId = await getAuthorizedStudentId(request, payload.studentId)
    return { assessment: await saveAssessmentAttempt({ ...payload, studentId }) }
  }

  if (request.method === 'POST' && url.pathname === '/api/notes') {
    const studentId = await getAuthorizedStudentId(request, payload.studentId)
    return { note: await saveNote({ ...payload, studentId }) }
  }

  if (request.method === 'POST' && url.pathname === '/api/tutor') {
    const studentId = await getAuthorizedStudentId(request, payload.student?.id)
    payload.student = { ...(payload.student ?? {}), id: studentId }
    const result = await createTutorAnswer(payload, { pool, mathTopicById })
    await saveTutorSession(pool, payload, result)
    return result
  }

  const error = new Error('Not found')
  error.statusCode = 404
  throw error
}

const server = http.createServer(async (request, response) => {
  if (!request.url?.startsWith('/api')) {
    sendStaticFile(request, response)
    return
  }

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  try {
    const body = request.method === 'GET' ? '{}' : await readBody(request)
    const payload = JSON.parse(body || '{}')
    const result = await handleRoute(request, payload)
    sendJson(response, 200, result)
  } catch (error) {
    console.error(`[api] ${request.method} ${request.url}`, {
      statusCode: error.statusCode ?? 500,
      message: error instanceof Error ? error.message : 'Unknown server error',
    })
    sendJson(response, error.statusCode ?? 500, {
      error: error instanceof Error ? error.message : 'Unknown server error',
    })
  }
})

initDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`TutorX AI API running on http://127.0.0.1:${port}`)
      console.log(pool ? 'PostgreSQL connected' : 'PostgreSQL disabled: set DATABASE_URL')
    })
  })
  .catch((error) => {
    console.error('Failed to initialize PostgreSQL:', error.message)
    process.exit(1)
  })
