# Application Workflow

TutorX AI is an AI-based mathematics tutoring system for Class 10 students. The current product focuses on Tamil Nadu State Board Samacheer Kalvi Mathematics and supports student accounts, syllabus navigation, AI doubt solving, textbook-grounded retrieval, assessments, notes, and progress analytics.

## 1. System Startup

1. The developer installs dependencies with `npm install`.
2. The backend starts with `npm run api`, which runs `backend/server.js`.
3. The backend loads `.env` values through `config/env.js`.
4. If `DATABASE_URL` is configured, PostgreSQL is initialized using `database/schema.sql`.
5. The frontend starts with `npm run dev`.
6. Vite serves `frontend/static/index.html` and proxies `/api` requests to `http://127.0.0.1:8787`.

Production uses `npm run build` to generate `dist/`, then `npm start` serves the built frontend and backend API from the same Node process.

## 2. Student Authentication Workflow

1. A student opens the application.
2. The frontend checks local storage for an existing auth session.
3. If a token exists, the frontend calls `GET /api/auth/session`.
4. The backend validates the bearer token signature and checks the hashed token in `student_sessions`.
5. If valid, the student dashboard loads.
6. If invalid or missing, the login/register screen is shown.

Registration:

1. Student enters name, email, date of birth, gender, and password.
2. Frontend validates basic fields.
3. Backend receives `POST /api/auth/register`.
4. Backend validates required fields, email format, gender, and password strength.
5. Password is hashed with `crypto.scryptSync`.
6. Student is inserted into `students`.
7. A signed session token is created and stored as a hash in `student_sessions`.
8. Frontend saves `{ student, token }` in local storage.

Login:

1. Student enters email and password.
2. Backend receives `POST /api/auth/login`.
3. Backend finds the student by username/email.
4. Password is verified against the stored hash.
5. A new session token is issued.
6. Frontend stores the session and loads the app.

Logout:

1. Frontend calls `POST /api/auth/logout`.
2. Backend marks the current session as revoked.
3. Frontend clears local auth state.

## 3. Dashboard Workflow

1. After login, the frontend calls `GET /api/student/dashboard?studentId=...`.
2. Backend authorizes that the requested student ID matches the logged-in student.
3. Backend collects:
   - completed topics
   - completed chapters
   - tutor session count
   - saved notes count
   - assessment statistics
   - recent learning activity
4. Frontend renders progress cards, activity timeline, subject progress, and achievement badges.

Progress data is built from `student_topic_progress`, `chapter_progress`, `assessment_attempts`, `notes`, and `tutor_sessions`.

## 4. Syllabus And Learning Workflow

1. Curriculum content is loaded from `data/curriculum/class-10-math.js`.
2. The frontend displays Class 10 Mathematics chapters and topics.
3. Student selects a topic in the tutor room or assessment area.
4. The UI displays the selected topic, summary, sample dialogue, and available practice questions.
5. When a topic is completed, the frontend calls `POST /api/progress`.
6. Backend stores a progress event and upserts `student_topic_progress`.
7. If all topics in a chapter are complete, backend records `chapter_progress`.
8. Dashboard metrics update from persisted student progress.

## 5. AI Tutor Workflow

1. Student selects a mathematics topic.
2. Student asks a doubt in the tutor chat.
3. Frontend sends `POST /api/tutor` with:
   - student context
   - topic context
   - question
   - chat history/passages where available
4. Backend verifies the logged-in student.
5. Backend validates the question:
   - non-empty
   - under length limit
   - valid mathematics topic
   - not a prompt injection attempt
   - not unsafe or off-topic
6. If moderation is enabled and `OPENAI_API_KEY` exists, backend calls the moderation endpoint.
7. Backend retrieves relevant textbook chunks from PostgreSQL if the RAG knowledge base is available.
8. Backend selects the LLM provider:
   - DeepSeek if configured
   - Gemini if configured
   - OpenAI if configured
   - offline fallback if no provider is configured
9. Backend sends the tutor prompt, topic context, student context, and textbook chunks to the selected provider.
10. AI response and sources are returned to the frontend.
11. Backend saves the tutor session in `tutor_sessions`.

Tutor behavior is constrained to Class 10 Tamil Nadu State Board Mathematics and should explain steps rather than only giving final answers.

## 6. RAG Knowledge Base Workflow

1. The textbook PDF lives in `data/textbooks/`.
2. The frontend can trigger `POST /api/rag/ingest`.
3. Backend reads the PDF path from `MATH_BOOK_PDF` or the default textbook path.
4. `pdf-parse` extracts text from the PDF.
5. Backend normalizes the text, detects chapters, and chunks content.
6. Existing chunks for the same source path are removed.
7. New document metadata is inserted into `book_documents`.
8. Chunks are inserted into `book_chunks`.
9. PostgreSQL full-text search indexes `book_chunks.search_vector`.

Retrieval:

1. Frontend calls `POST /api/rag/retrieve` or `GET /api/rag/chapter`.
2. Backend ranks chunks with PostgreSQL full-text search.
3. Matching chapter chunks are returned as AI grounding context.

## 7. Assessment Workflow

1. Assessment questions come from syllabus-aligned question banks in the curriculum data.
2. Student selects a topic test.
3. Frontend creates a fresh attempt by shuffling questions and answer options.
4. Questions increase across easy, medium, and hard levels where available.
5. Student answers each question and receives immediate explanation feedback.
6. Frontend tracks each selected answer, correct answer, skill, difficulty, weak area, and recommendation.
7. After completion, frontend calculates score, mastery percentage, skill-wise performance, weak areas, and recommended practice.
8. Frontend calls `POST /api/assessments`.
9. Backend verifies the student and validates the topic.
10. Assessment result is saved in `assessment_attempts`, including detailed JSON answer review and weak-area analysis.
11. Dashboard analytics update on the next refresh.

## 8. Notes Workflow

1. Student writes a topic-specific revision note.
2. Frontend calls `POST /api/notes`.
3. Backend verifies the logged-in student.
4. Note is stored in the `notes` table.
5. Dashboard includes note counts in saved records.

## 9. Book Text Workflow

1. Student can save custom/fallback book text from the UI.
2. Frontend calls `POST /api/book`.
3. Backend verifies ownership through bearer-token authorization.
4. Book content is saved in `books`.
5. Frontend can later call `GET /api/book?studentId=...` to load the latest student-specific book.

## 10. Security And Guardrail Workflow

The application protects student data and tutor behavior through:

- bearer token sessions
- hashed session token storage
- password hashing with salt
- per-student authorization checks
- tutor scope validation
- blocked prompt-injection patterns
- optional OpenAI moderation
- no exposure of provider keys or server secrets to the frontend

## 11. Current Frontend Modes

Default app:

- Path: `frontend/static`
- Served by: Vite root config in `vite.config.ts`
- Production output: `dist/`
- Status: current primary interface

React prototype:

- Path: `frontend/react`
- Dev command: `npm run dev:react`
- Build command: `npm run build:react`
- Production output: `dist-react/`
- Status: preserved prototype/future migration target

## 12. Main API Endpoints

```text
GET  /api/health
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/session
GET  /api/student/dashboard
POST /api/tutor
GET  /api/rag/status
POST /api/rag/ingest
POST /api/rag/retrieve
GET  /api/rag/chapter
POST /api/book
GET  /api/book
POST /api/progress
POST /api/assessments
POST /api/notes
```

## 13. Future Workflow Improvements

- Split `backend/server.js` into route and service modules.
- Move tutor prompts, moderation, providers, chunking, and retrieval into `ai/`.
- Centralize duplicate React topic data into the shared curriculum file.
- Add unit tests for auth, RAG chunking, tutor guardrails, and dashboard calculations.
- Add integration tests for protected student workflows.
- Add migrations for future schema changes instead of editing only `schema.sql`.
