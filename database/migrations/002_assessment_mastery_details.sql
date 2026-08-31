alter table assessment_attempts
  add column if not exists duration_seconds integer not null default 0,
  add column if not exists answers jsonb not null default '[]'::jsonb,
  add column if not exists skill_performance jsonb not null default '{}'::jsonb,
  add column if not exists weak_areas jsonb not null default '[]'::jsonb,
  add column if not exists recommendations jsonb not null default '[]'::jsonb;
