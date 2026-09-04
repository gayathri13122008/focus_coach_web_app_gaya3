import { useState, useEffect } from 'react';
import { ToastProvider } from '@/components/toast';
import { AppProvider, useApp } from '@/store/AppContext';
import { AppShell } from '@/components/AppShell';
import { Onboarding } from '@/pages/Onboarding';
import { Dashboard } from '@/pages/Dashboard';
import { FocusTimer } from '@/pages/FocusTimer';
import { Planner } from '@/pages/Planner';
import { Games } from '@/pages/Games';
import { Library } from '@/pages/Library';
import { Flashcards } from '@/pages/Flashcards';
import { Tests } from '@/pages/Tests';
import { StudyGroups } from '@/pages/StudyGroups';
import { Leaderboard } from '@/pages/Leaderboard';
import { ExamModules } from '@/pages/ExamModules';
import { Analytics } from '@/pages/Analytics';
import type { PageKey } from '@/lib/types';

function AppContent() {
  const { user, loaded } = useApp();
  const [page, setPage] = useState<PageKey>('dashboard');

  if (!user.name) {
    return <Onboarding />;
  }

  return (
    <AppShell page={page} onNavigate={setPage}>
      {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
      {page === 'focus' && <FocusTimer />}
      {page === 'planner' && <Planner />}
      {page === 'games' && <Games onNavigate={setPage} />}
      {page === 'library' && <Library onNavigate={setPage} />}
      {page === 'flashcards' && <Flashcards onNavigate={setPage} />}
      {page === 'tests' && <Tests />}
      {page === 'groups' && <StudyGroups />}
      {page === 'leaderboard' && <Leaderboard />}
      {page === 'exams' && <ExamModules />}
      {page === 'analytics' && <Analytics />}
    </AppShell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}
