export type PageKey =
  | 'dashboard'
  | 'focus'
  | 'planner'
  | 'games'
  | 'library'
  | 'flashcards'
  | 'tests'
  | 'groups'
  | 'leaderboard'
  | 'exams'
  | 'analytics';

export type UserProfile = {
  name: string;
  initials: string;
  exam: string;
  dailyHours: number;
  level: string;
  plan: 'free' | 'premium';
  joinedAt: string | null;
  email: string;
  phone: string;
};

export type ToastMsg = {
  id: number;
  text: string;
  type: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};
