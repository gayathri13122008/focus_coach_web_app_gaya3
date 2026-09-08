/*
# Add user_id columns (Step 1)

Adds nullable user_id columns WITHOUT defaults to avoid issues with existing rows.
Defaults will be set in step 2 after cleanup.
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  initials text NOT NULL DEFAULT '',
  exam text NOT NULL DEFAULT '',
  daily_hours integer NOT NULL DEFAULT 8,
  level text NOT NULL DEFAULT 'Intermediate',
  phone text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE planner_blocks ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE study_days ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE leaderboard_profiles ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS creator_user_id uuid;
