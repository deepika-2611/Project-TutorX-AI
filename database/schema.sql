create extension if not exists pgcrypto;

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  username text unique,
  name text not null,
  email text unique not null,
  grade text not null default '10',
  dob date,
  gender text,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists student_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  token_hash text unique not null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create index if not exists student_sessions_student_idx on student_sessions(student_id, expires_at desc);

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  title text not null,
  content text not null,
  updated_at timestamptz not null default now()
);

create table if not exists book_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_path text,
  total_pages integer,
  created_at timestamptz not null default now()
);

create table if not exists book_chunks (
  id bigserial primary key,
  document_id uuid references book_documents(id) on delete cascade,
  chapter_no integer,
  chapter_title text,
  chunk_index integer not null,
  content text not null,
  search_vector tsvector generated always as (to_tsvector('english', content)) stored,
  created_at timestamptz not null default now()
);

create index if not exists book_chunks_search_idx on book_chunks using gin(search_vector);
create index if not exists book_chunks_chapter_idx on book_chunks(chapter_no);

create table if not exists progress_events (
  id bigserial primary key,
  student_id uuid references students(id) on delete cascade,
  topic_id text not null,
  event_type text not null,
  credits integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists student_topic_progress (
  student_id uuid references students(id) on delete cascade,
  topic_id text not null,
  chapter_no integer not null,
  credits integer not null default 0,
  completed_at timestamptz not null default now(),
  primary key (student_id, topic_id)
);

create table if not exists chapter_progress (
  student_id uuid references students(id) on delete cascade,
  chapter_no integer not null,
  completed_at timestamptz not null default now(),
  primary key (student_id, chapter_no)
);

create table if not exists assessment_attempts (
  id bigserial primary key,
  student_id uuid references students(id) on delete cascade,
  topic_id text not null,
  chapter_no integer not null,
  score integer not null,
  total_questions integer not null,
  percentage integer not null,
  duration_seconds integer not null default 0,
  answers jsonb not null default '[]'::jsonb,
  skill_performance jsonb not null default '{}'::jsonb,
  weak_areas jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists progress_events_student_idx on progress_events(student_id, created_at desc);
create index if not exists student_topic_progress_student_idx on student_topic_progress(student_id, completed_at desc);
create index if not exists assessment_attempts_student_idx on assessment_attempts(student_id, created_at desc);

create table if not exists notes (
  id bigserial primary key,
  student_id uuid references students(id) on delete cascade,
  topic_id text not null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists tutor_sessions (
  id bigserial primary key,
  student_id uuid references students(id) on delete set null,
  topic_id text,
  question text not null,
  answer text,
  source_passages jsonb not null default '[]'::jsonb,
  mode text not null,
  created_at timestamptz not null default now()
);
