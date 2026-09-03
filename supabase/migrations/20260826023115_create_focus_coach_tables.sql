/*
# Focus Coach — Core Tables (single-tenant, no auth)

1. Purpose
   Persist study data for the Focus Coach app: tasks, focus sessions,
   flashcards, test attempts, planner blocks, library resources, and
   daily study aggregates. Single-user app — no sign-in, so all tables
   are accessible by the anon role.

2. New Tables
   - tasks: daily study tasks (title, subject, done, due_date)
   - sessions: focus timer sessions (subject, duration_min, mode, date)
   - flashcards: spaced-repetition cards (question, answer, subject, difficulty, next_review)
   - test_attempts: completed test scores (name, score, total, time_spent, date)
   - planner_blocks: time-blocked schedule entries (time, label, subject, color)
   - resources: uploaded study materials (icon, title, meta, outputs JSON)
   - study_days: daily aggregate of study minutes (date, minutes, sessions)

3. Security
   - RLS enabled on every table.
   - All policies use `TO anon, authenticated` with `USING (true)` /
     `WITH CHECK (true)` because this is an intentionally single-tenant
     app with no sign-in — the anon-key client must read and write its
     own data.
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL DEFAULT 'General',
  done boolean NOT NULL DEFAULT false,
  due_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL DEFAULT 'General Study',
  duration_min integer NOT NULL,
  mode text NOT NULL DEFAULT 'pomodoro',
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
CREATE POLICY "anon_select_sessions" ON sessions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
CREATE POLICY "anon_insert_sessions" ON sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sessions" ON sessions;
CREATE POLICY "anon_delete_sessions" ON sessions FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  subject text NOT NULL DEFAULT 'General',
  difficulty text NOT NULL DEFAULT 'good',
  next_review date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_flashcards" ON flashcards;
CREATE POLICY "anon_select_flashcards" ON flashcards FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_flashcards" ON flashcards;
CREATE POLICY "anon_insert_flashcards" ON flashcards FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_flashcards" ON flashcards;
CREATE POLICY "anon_update_flashcards" ON flashcards FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_flashcards" ON flashcards;
CREATE POLICY "anon_delete_flashcards" ON flashcards FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  time_spent text NOT NULL DEFAULT '--',
  attempt_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tests" ON test_attempts;
CREATE POLICY "anon_select_tests" ON test_attempts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tests" ON test_attempts;
CREATE POLICY "anon_insert_tests" ON test_attempts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tests" ON test_attempts;
CREATE POLICY "anon_delete_tests" ON test_attempts FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS planner_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_time text NOT NULL,
  label text NOT NULL,
  subject text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'var(--gold)',
  block_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE planner_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_planner" ON planner_blocks;
CREATE POLICY "anon_select_planner" ON planner_blocks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_planner" ON planner_blocks;
CREATE POLICY "anon_insert_planner" ON planner_blocks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_planner" ON planner_blocks;
CREATE POLICY "anon_update_planner" ON planner_blocks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_planner" ON planner_blocks;
CREATE POLICY "anon_delete_planner" ON planner_blocks FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT '📄',
  title text NOT NULL,
  meta text NOT NULL DEFAULT '',
  outputs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_resources" ON resources;
CREATE POLICY "anon_select_resources" ON resources FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_resources" ON resources;
CREATE POLICY "anon_insert_resources" ON resources FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_resources" ON resources;
CREATE POLICY "anon_delete_resources" ON resources FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS study_days (
  day_date date PRIMARY KEY NOT NULL,
  minutes integer NOT NULL DEFAULT 0,
  sessions integer NOT NULL DEFAULT 0
);

ALTER TABLE study_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_study_days" ON study_days;
CREATE POLICY "anon_select_study_days" ON study_days FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_study_days" ON study_days;
CREATE POLICY "anon_insert_study_days" ON study_days FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_study_days" ON study_days;
CREATE POLICY "anon_update_study_days" ON study_days FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review);
CREATE INDEX IF NOT EXISTS idx_planner_date ON planner_blocks(block_date);
