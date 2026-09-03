import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Task = {
  id: string;
  title: string;
  subject: string;
  done: boolean;
  due_date: string;
  created_at: string;
};

export type Session = {
  id: string;
  subject: string;
  duration_min: number;
  mode: string;
  session_date: string;
  created_at: string;
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  subject: string;
  difficulty: string;
  next_review: string;
  created_at: string;
};

export type TestAttempt = {
  id: string;
  name: string;
  score: number;
  total: number;
  time_spent: string;
  attempt_date: string;
  created_at: string;
};

export type PlannerBlock = {
  id: string;
  block_time: string;
  label: string;
  subject: string;
  color: string;
  block_date: string;
  created_at: string;
};

export type Resource = {
  id: string;
  icon: string;
  title: string;
  meta: string;
  outputs: { label: string; color: string }[];
  created_at: string;
};

export type StudyDay = {
  day_date: string;
  minutes: number;
  sessions: number;
};

export type StudyGroup = {
  id: string;
  name: string;
  description: string;
  icon: string;
  access_code: string;
  creator_name: string;
  created_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  member_name: string;
  member_email: string;
  member_phone: string;
  joined_at: string;
};

export type LeaderboardProfile = {
  id: string;
  name: string;
  initials: string;
  exam: string;
  xp: number;
  streak: number;
  total_minutes: number;
  tests_taken: number;
  best_score_pct: number | null;
  last_active: string;
  updated_at: string;
};
