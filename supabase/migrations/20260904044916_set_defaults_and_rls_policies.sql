/*
# Set defaults, constraints, and RLS policies (Step 2)

1. Deletes orphan rows with NULL user_id (from the old no-auth era).
2. Sets DEFAULT auth.uid() and NOT NULL on user_id columns.
3. Changes study_days PK to composite (user_id, day_date).
4. Replaces all USING(true) policies with auth.uid()-based ownership checks.
*/

-- Delete orphan rows from old no-auth era
DELETE FROM tasks WHERE user_id IS NULL;
DELETE FROM sessions WHERE user_id IS NULL;
DELETE FROM flashcards WHERE user_id IS NULL;
DELETE FROM test_attempts WHERE user_id IS NULL;
DELETE FROM planner_blocks WHERE user_id IS NULL;
DELETE FROM resources WHERE user_id IS NULL;
DELETE FROM study_days WHERE user_id IS NULL;
DELETE FROM group_members WHERE user_id IS NULL;
DELETE FROM leaderboard_profiles WHERE user_id IS NULL;
DELETE FROM study_groups WHERE creator_user_id IS NULL;

-- Set defaults and NOT NULL
ALTER TABLE tasks ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE sessions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE sessions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE flashcards ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE flashcards ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE test_attempts ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE test_attempts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE planner_blocks ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE planner_blocks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE resources ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE resources ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE study_days ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE study_days ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE group_members ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE group_members ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE leaderboard_profiles ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE study_groups ALTER COLUMN creator_user_id SET DEFAULT auth.uid();

-- study_days: change PK from (day_date) to (user_id, day_date)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'study_days_pkey' AND conrelid = 'study_days'::regclass) THEN
    ALTER TABLE study_days DROP CONSTRAINT study_days_pkey;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'study_days_pkey' AND conrelid = 'study_days'::regclass) THEN
    ALTER TABLE study_days ADD CONSTRAINT study_days_pkey PRIMARY KEY (user_id, day_date);
  END IF;
END $$;

-- ============================================================
-- RLS Policies
-- ============================================================

-- user_profiles (private)
DROP POLICY IF EXISTS "select_own_profile" ON user_profiles;
CREATE POLICY "select_own_profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_profile" ON user_profiles;
CREATE POLICY "insert_own_profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
CREATE POLICY "update_own_profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_profile" ON user_profiles;
CREATE POLICY "delete_own_profile" ON user_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- tasks (private)
DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- sessions (private)
DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
DROP POLICY IF EXISTS "anon_delete_sessions" ON sessions;
CREATE POLICY "select_own_sessions" ON sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_sessions" ON sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_sessions" ON sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- flashcards (private)
DROP POLICY IF EXISTS "anon_select_flashcards" ON flashcards;
DROP POLICY IF EXISTS "anon_insert_flashcards" ON flashcards;
DROP POLICY IF EXISTS "anon_update_flashcards" ON flashcards;
DROP POLICY IF EXISTS "anon_delete_flashcards" ON flashcards;
CREATE POLICY "select_own_flashcards" ON flashcards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_flashcards" ON flashcards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_flashcards" ON flashcards FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_flashcards" ON flashcards FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- test_attempts (private)
DROP POLICY IF EXISTS "anon_select_tests" ON test_attempts;
DROP POLICY IF EXISTS "anon_insert_tests" ON test_attempts;
DROP POLICY IF EXISTS "anon_delete_tests" ON test_attempts;
CREATE POLICY "select_own_tests" ON test_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_tests" ON test_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_tests" ON test_attempts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- planner_blocks (private)
DROP POLICY IF EXISTS "anon_select_planner" ON planner_blocks;
DROP POLICY IF EXISTS "anon_insert_planner" ON planner_blocks;
DROP POLICY IF EXISTS "anon_update_planner" ON planner_blocks;
DROP POLICY IF EXISTS "anon_delete_planner" ON planner_blocks;
CREATE POLICY "select_own_planner" ON planner_blocks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_planner" ON planner_blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_planner" ON planner_blocks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_planner" ON planner_blocks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- resources (private)
DROP POLICY IF EXISTS "anon_select_resources" ON resources;
DROP POLICY IF EXISTS "anon_insert_resources" ON resources;
DROP POLICY IF EXISTS "anon_delete_resources" ON resources;
CREATE POLICY "select_own_resources" ON resources FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_resources" ON resources FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_resources" ON resources FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- study_days (private)
DROP POLICY IF EXISTS "anon_select_study_days" ON study_days;
DROP POLICY IF EXISTS "anon_insert_study_days" ON study_days;
DROP POLICY IF EXISTS "anon_update_study_days" ON study_days;
CREATE POLICY "select_own_study_days" ON study_days FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_study_days" ON study_days FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_study_days" ON study_days FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- study_groups (shared: SELECT to all, writes to creator)
DROP POLICY IF EXISTS "anon_select_study_groups" ON study_groups;
DROP POLICY IF EXISTS "anon_insert_study_groups" ON study_groups;
DROP POLICY IF EXISTS "anon_delete_study_groups" ON study_groups;
CREATE POLICY "select_all_study_groups" ON study_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own_study_groups" ON study_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_user_id);
CREATE POLICY "delete_own_study_groups" ON study_groups FOR DELETE TO authenticated USING (auth.uid() = creator_user_id);

-- group_members (shared: SELECT to all, insert/delete to self)
DROP POLICY IF EXISTS "anon_select_group_members" ON group_members;
DROP POLICY IF EXISTS "anon_insert_group_members" ON group_members;
DROP POLICY IF EXISTS "anon_delete_group_members" ON group_members;
CREATE POLICY "select_all_group_members" ON group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own_group_members" ON group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_group_members" ON group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- leaderboard_profiles (shared: SELECT to all, writes to self)
DROP POLICY IF EXISTS "anon_select_leaderboard" ON leaderboard_profiles;
DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard_profiles;
DROP POLICY IF EXISTS "anon_update_leaderboard" ON leaderboard_profiles;
DROP POLICY IF EXISTS "anon_delete_leaderboard" ON leaderboard_profiles;
CREATE POLICY "select_all_leaderboard" ON leaderboard_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own_leaderboard" ON leaderboard_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_leaderboard" ON leaderboard_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_leaderboard" ON leaderboard_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_planner_user_id ON planner_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_study_days_user_id ON study_days(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard_profiles(user_id);
