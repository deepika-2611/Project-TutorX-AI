# Technology Stack

This document describes the current TutorX AI technology stack and the role each tool plays in the application.

## Application Type

TutorX AI is a full-stack JavaScript application for Class 10 mathematics tutoring. It includes:

- browser-based student UI
- Node.js backend API
- PostgreSQL database
- AI tutor integration
- textbook-grounded RAG workflow
- student authentication and progress tracking

## Frontend

| Technology | Usage |
| --- | --- |
| HTML | Primary static application shell in `frontend/static/index.html`. |
| CSS | Main UI styling in `frontend/static/styles/styles.css`; React prototype styles in `frontend/react/src/styles/`. |
| JavaScript ES Modules | Static frontend logic in `frontend/static/scripts/`. |
| React | Preserved prototype/future app in `frontend/react`. |
| TypeScript | React prototype source and type checking. |
| Vite | Development server, build tool, proxy for `/api`, and static app bundling. |

Current primary frontend:

```text
frontend/static
```

React prototype:

```text
frontend/react
```

## Backend

| Technology | Usage |
| --- | --- |
| Node.js | Runtime for the API server. |
| Native `http` module | HTTP server and route handling. |
| JavaScript ES Modules | Backend module system through `"type": "module"`. |
| `crypto` | Password hashing, session signing, token hashing, and secure comparisons. |
| `fs` / `path` | Static file serving, environment loading, schema loading, and PDF access. |

Backend entry point:

```text
backend/server.js
```

The backend currently uses native routing in `server.js`. The project structure is prepared for future route/service extraction.

## Database

| Technology | Usage |
| --- | --- |
| PostgreSQL | Main relational database for students, sessions, books, progress, notes, assessments, RAG chunks, and tutor sessions. |
| `pg` | Node PostgreSQL client. |
| `pgcrypto` | UUID generation through `gen_random_uuid()`. |
| PostgreSQL full-text search | RAG retrieval using `tsvector`, GIN indexes, `plainto_tsquery`, and `ts_rank_cd`. |

Schema:

```text
database/schema.sql
database/migrations/001_initial_schema.sql
```

Main tables:

```text
students
student_sessions
books
book_documents
book_chunks
progress_events
student_topic_progress
chapter_progress
assessment_attempts
notes
tutor_sessions
```

`assessment_attempts` stores both summary scores and detailed mastery data, including answer review, skill performance, weak areas, recommendations, and duration.

## AI And LLM Stack

| Technology | Usage |
| --- | --- |
| OpenAI Responses API | Optional LLM provider for tutor answers. |
| OpenAI Moderation API | Optional safety moderation for student questions. |
| DeepSeek Chat Completions | Optional LLM provider. |
| Gemini Generate Content API | Optional LLM provider. |
| Provider auto-selection | Backend chooses DeepSeek, Gemini, OpenAI, or offline mode based on env keys. |
| Prompt guardrails | Tutor system instruction and regex checks limit behavior to safe Class 10 math tutoring. |

AI-related folders:

```text
ai/tutor
ai/providers
ai/rag
ai/agents
```

AI implementation now lives in `ai/`. The backend imports those modules and calls them from API routes.

## RAG Stack

| Technology | Usage |
| --- | --- |
| `pdf-parse` | Extracts text from the Class 10 Mathematics PDF. |
| PostgreSQL `tsvector` | Stores searchable chunk vectors. |
| GIN index | Speeds up full-text retrieval over textbook chunks. |
| Chapter detection | Maps textbook chunks to Class 10 math chapters. |

Textbook source:

```text
data/textbooks/Class_10_Mathematics_English_2025_Edition-www.tntextbooks.in.pdf
```

Curriculum data:

```text
data/curriculum/class-10-math.js
```

## Authentication Stack

| Technology | Usage |
| --- | --- |
| `crypto.scryptSync` | Password hashing with salt. |
| HMAC SHA-256 | Session token signing. |
| SHA-256 token hash | Stores hashed session tokens in the database. |
| Bearer tokens | Frontend sends session token through `Authorization: Bearer ...`. |
| PostgreSQL sessions | Server validates active, non-revoked, non-expired sessions. |

Auth modules:

```text
auth/password.js
auth/session.js
```

## Configuration

| File | Usage |
| --- | --- |
| `.env` | Local secrets and runtime configuration. Ignored by git. |
| `config/env.example` | Safe template for required env variables. |
| `config/env.js` | Shared `.env` loader. |
| `vite.config.ts` | Default static frontend Vite config. |
| `frontend/react/vite.config.ts` | React prototype Vite config. |
| `tsconfig*.json` | TypeScript configuration. |
| `eslint.config.js` | Linting configuration. |

Important environment variables:

```text
DATABASE_URL
PGSSL
LLM_PROVIDER
DEEPSEEK_API_KEY
GEMINI_API_KEY
OPENAI_API_KEY
MODERATION_ENABLED
MATH_BOOK_PDF
PORT
SESSION_SECRET
```

## Development Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm run api` | Start backend API. |
| `npm run dev` | Start default static frontend. |
| `npm run dev:react` | Start React prototype. |
| `npm run build` | Build default frontend. |
| `npm run build:react` | Build React prototype. |
| `npm run lint` | Run ESLint. |
| `npm run db:check` | Verify PostgreSQL connection. |
| `npm run db:tables` | List database tables and row counts. |
| `npm start` | Start production server. |

## Deployment Model

The current deployment model is:

1. Build frontend with `npm run build`.
2. Start backend with `npm start`.
3. Backend serves static files from `dist/`.
4. Backend exposes `/api/*` endpoints from the same Node process.
5. PostgreSQL and LLM provider credentials are supplied through environment variables.

## Testing Stack

Testing folders are prepared but no test framework is currently configured.

Recommended next additions:

- Vitest for unit tests
- Supertest or native fetch-based integration tests for API routes
- focused AI tests for tutor guardrails and RAG chunking
- database integration tests using a test PostgreSQL instance

## Current Production Readiness Notes

Already present:

- structured project folders
- PostgreSQL schema
- session-based authentication
- student-specific authorization
- AI provider selection
- RAG ingestion and retrieval
- moderation/guardrail layer
- frontend build and lint checks

Recommended next improvements:

- split `backend/server.js` into route/service files
- add automated tests
- add migration runner
- improve React app auth token handling before making React the primary frontend
