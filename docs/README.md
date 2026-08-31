# TutorX AI

TutorX AI is an AI-powered learning platform for Class 10 students. The current version focuses on Tamil Nadu State Board Samacheer Kalvi Mathematics, with a structure that can expand to multiple subjects later.

## Purpose

TutorX AI helps students learn through guided tutoring, syllabus-based practice, assessments, bilingual support, and progress tracking.

## Current Features

- Student registration and login
- Personalized dashboard and progress tracking
- Class 10 Mathematics topic tree
- AI tutor with textbook-backed RAG support
- Practice assessments and score tracking
- Bilingual glossary support
- PostgreSQL-backed student records
- Backend guardrails and moderation layer for tutor questions

## Local Development

Install dependencies:

```bash
npm install
```

Start the backend API:

```bash
npm run api
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

On Windows, you can also run:

```bash
run.bat
```

## Production

Build the frontend:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The production server serves the built frontend from `dist` and the API from the same Node process.

## Environment

Copy `config/env.example` to `.env` and configure the required database and provider keys. Do not commit real secrets.

## Structure

See `docs/PROJECT_STRUCTURE.md` for the current source layout.

## Additional Documentation

- `docs/WORKFLOW.md` describes the complete application workflow.
- `docs/TECH_STACK.md` describes the technology stack and runtime architecture.
