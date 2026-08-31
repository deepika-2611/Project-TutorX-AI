# Project Structure

TutorX AI is organized around clear product modules for a Class 10 AI mathematics tutoring system.

```text
frontend/
  static/   Current Vite-served TutorX AI UI.
  react/    React prototype and future React app surface.
backend/    API server, routes, server-side business flow.
auth/       Password hashing, session tokens, authorization helpers.
database/   PostgreSQL schema, migrations, and DB utility scripts.
ai/         LLM providers, tutor prompts, moderation, RAG, and agent logic.
data/       Class 10 math curriculum, glossary data, textbooks, questions.
config/     Environment and application configuration helpers.
docs/       Setup notes, requirements, and architecture documentation.
tests/      Unit, integration, and AI/RAG tests.
scripts/    Local developer automation.
```

## Current Entry Points

- Default frontend: `frontend/static/index.html`
- Static frontend scripts: `frontend/static/scripts/`
- Static frontend styles: `frontend/static/styles/styles.css`
- React prototype: `frontend/react/`
- Backend API: `backend/server.js`
- Database schema: `database/schema.sql`
- Initial migration: `database/migrations/001_initial_schema.sql`
- Curriculum source: `data/curriculum/class-10-math.js`
- Textbook PDF: `data/textbooks/`
- Agent placeholder: `ai/agents/crewflow.py`

## Notes

The static frontend is currently the production build target because it was the app already wired through Vite. The React app is preserved separately so no functionality is lost.

Future cleanup should continue splitting `backend/server.js` into route and non-AI service modules, then centralize the duplicate React-only topic data into `data/curriculum/class-10-math.js`.
