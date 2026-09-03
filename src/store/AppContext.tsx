import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Task, Session, Flashcard, TestAttempt, PlannerBlock, Resource, StudyDay, StudyGroup, GroupMember, LeaderboardProfile } from '@/lib/supabase';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/components/toast';
import type { ToastType } from '@/components/toast';

type Stats = {
  streak: number;
  longestStreak: number;
  xp: number;
  todayStudyMinutes: number;
  tasksCompleted: number;
  tasksTotal: number;
  testAccuracy: number | null;
  globalRank: number | null;
  percentile: number | null;
};

type AppState = {
  user: UserProfile;
  stats: Stats;
  tasks: Task[];
  sessions: Session[];
  flashcards: Flashcard[];
  testAttempts: TestAttempt[];
  plannerBlocks: PlannerBlock[];
  resources: Resource[];
  studyDays: StudyDay[];
  heatmap: number[];
  loaded: boolean;
};

type AppContextValue = AppState & {
  showToast: (text: string, type?: ToastType) => void;
  setUser: (u: Partial<UserProfile>) => void;
  addTask: (title: string, subject: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addSession: (subject: string, durationMin: number, mode: string) => Promise<void>;
  addFlashcard: (question: string, answer: string, subject: string) => Promise<void>;
  rateFlashcard: (id: string, difficulty: string) => Promise<void>;
  addTestAttempt: (name: string, score: number, total: number, timeSpent: string) => Promise<void>;
  addPlannerBlock: (time: string, label: string, subject: string, color: string) => Promise<void>;
  deletePlannerBlock: (id: string) => Promise<void>;
  addResource: (icon: string, title: string, meta: string, outputs: { label: string; color: string }[]) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  signOut: () => void;
  studyGroups: StudyGroup[];
  myGroups: StudyGroup[];
  leaderboard: LeaderboardProfile[];
  upsertLeaderboard: (profile: { name: string; initials: string; exam: string; xp: number; streak: number; total_minutes: number; tests_taken: number; best_score_pct: number | null }) => Promise<void>;
  createGroup: (name: string, description: string, icon: string) => Promise<{ success: boolean; accessCode?: string; error?: string }>;
  joinGroup: (accessCode: string) => Promise<{ success: boolean; error?: string; group?: StudyGroup }>;
  leaveGroup: (groupId: string) => Promise<void>;
  getGroupMembers: (groupId: string) => Promise<GroupMember[]>;
};

const defaultUser: UserProfile = {
  name: '',
  initials: '',
  exam: '',
  dailyHours: 8,
  level: 'Intermediate',
  plan: 'free',
  joinedAt: null,
  email: '',
  phone: '',
};

const defaultStats: Stats = {
  streak: 0,
  longestStreak: 0,
  xp: 0,
  todayStudyMinutes: 0,
  tasksCompleted: 0,
  tasksTotal: 0,
  testAccuracy: null,
  globalRank: null,
  percentile: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

const STORAGE_KEY = 'focus_coach_user';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const showToast = useToast();
  const [user, setUserState] = useState<UserProfile>(defaultUser);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [plannerBlocks, setPlannerBlocks] = useState<PlannerBlock[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [studyDays, setStudyDays] = useState<StudyDay[]>([]);
  const [heatmap, setHeatmap] = useState<number[]>(Array(84).fill(0));
  const [loaded, setLoaded] = useState(false);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardProfile[]>([]);

  const computeStats = useCallback(
    (allTasks: Task[], allSessions: Session[], allTests: TestAttempt[], allStudyDays: StudyDay[]) => {
      const today = todayStr();
      const todayMinutes = allSessions
        .filter((s) => s.session_date === today)
        .reduce((sum, s) => sum + s.duration_min, 0);
      const todayTasks = allTasks.filter((t) => t.due_date === today);
      const tasksCompleted = todayTasks.filter((t) => t.done).length;
      const tasksTotal = todayTasks.length;

      let streak = 0;
      const d = new Date();
      const todayStudied = allStudyDays.some((sd) => sd.day_date === today && sd.minutes > 0);
      if (!todayStudied) d.setDate(d.getDate() - 1);
      while (true) {
        const ds = d.toISOString().slice(0, 10);
        const sd = allStudyDays.find((s) => s.day_date === ds);
        if (sd && sd.minutes > 0) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else break;
      }

      const xp =
        allTasks.filter((t) => t.done).length * 5 +
        allSessions.reduce((sum, s) => sum + Math.floor(s.duration_min / 25) * 10, 0);

      let testAccuracy: number | null = null;
      if (allTests.length > 0) {
        const totalPct = allTests.reduce((sum, t) => sum + (t.score / t.total) * 100, 0);
        testAccuracy = Math.round(totalPct / allTests.length);
      }

      const globalRank = xp > 0 ? Math.max(1, Math.floor(10000 - xp * 2)) : null;
      const percentile = globalRank !== null ? Math.max(1, Math.round((globalRank / 10000) * 100)) : null;

      setStats({
        streak,
        longestStreak: Math.max(streak, 0),
        xp,
        todayStudyMinutes: todayMinutes,
        tasksCompleted,
        tasksTotal,
        testAccuracy,
        globalRank,
        percentile,
      });
    },
    [],
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUserState({ ...defaultUser, ...u });
      } catch {
        // ignore
      }
    }
  }, []);

  const loadData = useCallback(async () => {
    const [tasksRes, sessionsRes, flashcardsRes, testsRes, plannerRes, resourcesRes, studyDaysRes, groupsRes, lbRes] =
      await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('sessions').select('*').order('created_at', { ascending: false }),
        supabase.from('flashcards').select('*').order('created_at', { ascending: false }),
        supabase.from('test_attempts').select('*').order('created_at', { ascending: false }),
        supabase.from('planner_blocks').select('*').order('block_date', { ascending: false }),
        supabase.from('resources').select('*').order('created_at', { ascending: false }),
        supabase.from('study_days').select('*').order('day_date', { ascending: false }),
        supabase.from('study_groups').select('*').order('created_at', { ascending: false }),
        supabase.from('leaderboard_profiles').select('*').order('xp', { ascending: false }),
      ]);

    const allTasks = (tasksRes.data || []) as Task[];
    const allSessions = (sessionsRes.data || []) as Session[];
    const allFlashcards = (flashcardsRes.data || []) as Flashcard[];
    const allTests = (testsRes.data || []) as TestAttempt[];
    const allPlanner = (plannerRes.data || []) as PlannerBlock[];
    const allResources = (resourcesRes.data || []) as Resource[];
    const allStudyDays = (studyDaysRes.data || []) as StudyDay[];
    const allGroups = (groupsRes.data || []) as StudyGroup[];
    const allLeaderboard = (lbRes.data || []) as LeaderboardProfile[];

    setTasks(allTasks);
    setSessions(allSessions);
    setFlashcards(allFlashcards);
    setTestAttempts(allTests);
    setPlannerBlocks(allPlanner.filter((b) => b.block_date === todayStr()));
    setResources(allResources);
    setStudyDays(allStudyDays);
    setStudyGroups(allGroups);
    setLeaderboard(allLeaderboard);

    // Load my groups (groups where this user is a member)
    if (user.email) {
      const { data: myMemberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('member_email', user.email);
      if (myMemberships && myMemberships.length > 0) {
        const myGroupIds = myMemberships.map((m: { group_id: string }) => m.group_id);
        const myGroupsList = allGroups.filter((g) => myGroupIds.includes(g.id));
        setMyGroups(myGroupsList);
      }
    }

    const heat = Array(84).fill(0);
    const today = new Date();
    for (let i = 0; i < 84; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - (83 - i));
      const ds = d.toISOString().slice(0, 10);
      const sd = allStudyDays.find((s) => s.day_date === ds);
      if (sd && sd.minutes > 0) {
        heat[i] = Math.min(4, Math.ceil(sd.minutes / 60));
      }
    }
    setHeatmap(heat);

    computeStats(allTasks, allSessions, allTests, allStudyDays);
    setLoaded(true);
  }, [computeStats]);

  const setUser = useCallback((u: Partial<UserProfile>) => {
    setUserState((prev) => {
      const next = { ...prev, ...u };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addTask = useCallback(
    async (title: string, subject: string) => {
      const { data } = await supabase
        .from('tasks')
        .insert({ title, subject, due_date: todayStr() })
        .select()
        .single();
      if (data) {
        setTasks((prev) => [data as Task, ...prev]);
        const updated = [data as Task, ...tasks];
        computeStats(updated, sessions, testAttempts, studyDays);
      }
    },
    [tasks, sessions, testAttempts, studyDays, computeStats],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const newDone = !task.done;
      await supabase.from('tasks').update({ done: newDone }).eq('id', id);
      const updated = tasks.map((t) => (t.id === id ? { ...t, done: newDone } : t));
      setTasks(updated);
      computeStats(updated, sessions, testAttempts, studyDays);
      showToast(newDone ? 'Task completed! +5 XP' : 'Task reopened', newDone ? 'green' : 'gold');
    },
    [tasks, sessions, testAttempts, studyDays, computeStats, showToast],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await supabase.from('tasks').delete().eq('id', id);
      const updated = tasks.filter((t) => t.id !== id);
      setTasks(updated);
      computeStats(updated, sessions, testAttempts, studyDays);
    },
    [tasks, sessions, testAttempts, studyDays, computeStats],
  );

  const addSession = useCallback(
    async (subject: string, durationMin: number, mode: string) => {
      const today = todayStr();
      const { data } = await supabase
        .from('sessions')
        .insert({ subject, duration_min: durationMin, mode, session_date: today })
        .select()
        .single();
      if (data) {
        const newSessions = [data as Session, ...sessions];
        setSessions(newSessions);

        const existing = studyDays.find((s) => s.day_date === today);
        if (existing) {
          const newMinutes = existing.minutes + durationMin;
          const newSessionsCount = existing.sessions + 1;
          await supabase
            .from('study_days')
            .update({ minutes: newMinutes, sessions: newSessionsCount })
            .eq('day_date', today);
          const newStudyDays = studyDays.map((s) =>
            s.day_date === today ? { ...s, minutes: newMinutes, sessions: newSessionsCount } : s,
          );
          setStudyDays(newStudyDays);
          computeStats(tasks, newSessions, testAttempts, newStudyDays);
        } else {
          await supabase.from('study_days').insert({ day_date: today, minutes: durationMin, sessions: 1 });
          const newStudyDays = [...studyDays, { day_date: today, minutes: durationMin, sessions: 1 }];
          setStudyDays(newStudyDays);
          computeStats(tasks, newSessions, testAttempts, newStudyDays);
        }

        setHeatmap((prev) => {
          const next = [...prev];
          const todayMinutes = (studyDays.find((s) => s.day_date === today)?.minutes || 0) + durationMin;
          next[83] = Math.min(4, Math.ceil(todayMinutes / 60));
          return next;
        });
      }
    },
    [sessions, studyDays, tasks, testAttempts, computeStats],
  );

  const addFlashcard = useCallback(async (question: string, answer: string, subject: string) => {
    const { data } = await supabase
      .from('flashcards')
      .insert({ question, answer, subject })
      .select()
      .single();
    if (data) {
      setFlashcards((prev) => [data as Flashcard, ...prev]);
    }
  }, []);

  const rateFlashcard = useCallback(
    async (id: string, difficulty: string) => {
      const card = flashcards.find((f) => f.id === id);
      if (!card) return;
      const days: Record<string, number> = { again: 1, hard: 3, good: 7, easy: 14 };
      const next = new Date();
      next.setDate(next.getDate() + (days[difficulty] || 7));
      await supabase
        .from('flashcards')
        .update({ difficulty, next_review: next.toISOString().slice(0, 10) })
        .eq('id', id);
      setFlashcards((prev) =>
        prev.map((f) => (f.id === id ? { ...f, difficulty, next_review: next.toISOString().slice(0, 10) } : f)),
      );
    },
    [flashcards],
  );

  const addTestAttempt = useCallback(
    async (name: string, score: number, total: number, timeSpent: string) => {
      const { data } = await supabase
        .from('test_attempts')
        .insert({ name, score, total, time_spent: timeSpent })
        .select()
        .single();
      if (data) {
        const newTests = [data as TestAttempt, ...testAttempts];
        setTestAttempts(newTests);
        computeStats(tasks, sessions, newTests, studyDays);
      }
    },
    [testAttempts, tasks, sessions, studyDays, computeStats],
  );

  const addPlannerBlock = useCallback(async (time: string, label: string, subject: string, color: string) => {
    const { data } = await supabase
      .from('planner_blocks')
      .insert({ block_time: time, label, subject, color, block_date: todayStr() })
      .select()
      .single();
    if (data) {
      setPlannerBlocks((prev) => [...prev, data as PlannerBlock]);
    }
  }, []);

  const deletePlannerBlock = useCallback(async (id: string) => {
    await supabase.from('planner_blocks').delete().eq('id', id);
    setPlannerBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addResource = useCallback(
    async (icon: string, title: string, meta: string, outputs: { label: string; color: string }[]) => {
      const { data } = await supabase
        .from('resources')
        .insert({ icon, title, meta, outputs })
        .select()
        .single();
      if (data) {
        setResources((prev) => [data as Resource, ...prev]);
      }
    },
    [],
  );

  const deleteResource = useCallback(async (id: string) => {
    await supabase.from('resources').delete().eq('id', id);
    setResources((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const upsertLeaderboard = useCallback(
    async (profile: { name: string; initials: string; exam: string; xp: number; streak: number; total_minutes: number; tests_taken: number; best_score_pct: number | null }) => {
      const { data } = await supabase
        .from('leaderboard_profiles')
        .upsert(profile, { onConflict: 'name' })
        .select()
        .single();
      if (data) {
        const { data: lbData } = await supabase.from('leaderboard_profiles').select('*').order('xp', { ascending: false });
        if (lbData) setLeaderboard(lbData as LeaderboardProfile[]);
      }
    },
    [],
  );

  const createGroup = useCallback(
    async (name: string, description: string, icon: string): Promise<{ success: boolean; accessCode?: string; error?: string }> => {
      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase
        .from('study_groups')
        .insert({ name, description, icon, access_code: accessCode, creator_name: user.name || 'Anonymous' })
        .select()
        .single();
      if (error || !data) {
        return { success: false, error: error?.message || 'Failed to create group' };
      }
      const newGroup = data as StudyGroup;
      setStudyGroups((prev) => [newGroup, ...prev]);

      // Auto-join creator
      if (user.email) {
        await supabase.from('group_members').insert({
          group_id: newGroup.id,
          member_name: user.name,
          member_email: user.email,
          member_phone: user.phone || '',
        });
        setMyGroups((prev) => [...prev, newGroup]);
      }
      return { success: true, accessCode };
    },
    [user.name, user.email, user.phone],
  );

  const joinGroup = useCallback(
    async (accessCode: string): Promise<{ success: boolean; error?: string; group?: StudyGroup }> => {
      const { data: groupData, error: groupError } = await supabase
        .from('study_groups')
        .select('*')
        .eq('access_code', accessCode.toUpperCase())
        .maybeSingle();
      if (groupError || !groupData) {
        return { success: false, error: 'Invalid access code. No group found.' };
      }
      const group = groupData as StudyGroup;

      // Check if already a member
      const { data: existing } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('member_email', user.email)
        .maybeSingle();
      if (existing) {
        return { success: false, error: 'You are already a member of this group.' };
      }

      const { error: joinError } = await supabase.from('group_members').insert({
        group_id: group.id,
        member_name: user.name,
        member_email: user.email,
        member_phone: user.phone || '',
      });
      if (joinError) {
        return { success: false, error: joinError.message };
      }
      setMyGroups((prev) => (prev.find((g) => g.id === group.id) ? prev : [...prev, group]));
      return { success: true, group };
    },
    [user.name, user.email, user.phone],
  );

  const leaveGroup = useCallback(
    async (groupId: string): Promise<void> => {
      await supabase.from('group_members').delete().eq('group_id', groupId).eq('member_email', user.email);
      setMyGroups((prev) => prev.filter((g) => g.id !== groupId));
    },
    [user.email],
  );

  const getGroupMembers = useCallback(
    async (groupId: string): Promise<GroupMember[]> => {
      const { data } = await supabase.from('group_members').select('*').eq('group_id', groupId).order('joined_at', { ascending: false });
      return (data || []) as GroupMember[];
    },
    [],
  );

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUserState(defaultUser);
    setStats(defaultStats);
    setTasks([]);
    setSessions([]);
    setFlashcards([]);
    setTestAttempts([]);
    setPlannerBlocks([]);
    setResources([]);
    setStudyDays([]);
    setHeatmap(Array(84).fill(0));
    setStudyGroups([]);
    setMyGroups([]);
    setLeaderboard([]);
    setLoaded(false);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const value: AppContextValue = {
    user,
    stats,
    tasks,
    sessions,
    flashcards,
    testAttempts,
    plannerBlocks,
    resources,
    studyDays,
    heatmap,
    loaded,
    showToast,
    setUser,
    addTask,
    toggleTask,
    deleteTask,
    addSession,
    addFlashcard,
    rateFlashcard,
    addTestAttempt,
    addPlannerBlock,
    deletePlannerBlock,
    addResource,
    deleteResource,
    signOut,
    studyGroups,
    myGroups,
    leaderboard,
    upsertLeaderboard,
    createGroup,
    joinGroup,
    leaveGroup,
    getGroupMembers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
