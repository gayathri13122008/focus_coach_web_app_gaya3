import { useState } from 'react';
import {
  LayoutDashboard,
  Timer,
  CalendarDays,
  Sparkles,
  Library,
  Layers,
  FileText,
  Users,
  Trophy,
  GraduationCap,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import type { PageKey } from '@/lib/types';
import { useApp } from '@/store/AppContext';

const navItems: { key: PageKey; label: string; icon: typeof LayoutDashboard; gradient: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, gradient: 'var(--gradient-warm)' },
  { key: 'focus', label: 'Focus Timer', icon: Timer, gradient: 'var(--gradient-cool)' },
  { key: 'planner', label: 'Planner', icon: CalendarDays, gradient: 'var(--gradient-fresh)' },
  { key: 'ai', label: 'AI Coach', icon: Sparkles, gradient: 'var(--gradient-instagram)' },
  { key: 'library', label: 'Library', icon: Library, gradient: 'var(--gradient-sunny)' },
  { key: 'flashcards', label: 'Flashcards', icon: Layers, gradient: 'var(--gradient-cool)' },
  { key: 'tests', label: 'Tests', icon: FileText, gradient: 'var(--gradient-warm)' },
  { key: 'groups', label: 'Study Groups', icon: Users, gradient: 'var(--gradient-fresh)' },
  { key: 'leaderboard', label: 'Leaderboard', icon: Trophy, gradient: 'var(--gradient-sunny)' },
  { key: 'exams', label: 'Exam Modules', icon: GraduationCap, gradient: 'var(--gradient-cool)' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, gradient: 'var(--gradient-warm)' },
];

const pageLabels: Record<PageKey, string> = {
  dashboard: 'Dashboard',
  focus: 'Focus Timer',
  planner: 'Planner',
  ai: 'AI Coach',
  library: 'Library',
  flashcards: 'Flashcards',
  tests: 'Tests',
  groups: 'Study Groups',
  leaderboard: 'Leaderboard',
  exams: 'Exam Modules',
  analytics: 'Analytics',
};

export function AppShell({ page, onNavigate, children }: { page: PageKey; onNavigate: (p: PageKey) => void; children: React.ReactNode }) {
  const { user, stats, signOut } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const firstName = user.name.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 250,
          flexShrink: 0,
          background: 'var(--bg-deep)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
        className="sidebar-desktop"
      >
        {/* Logo */}
        <div style={{ padding: '24px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'var(--gradient-instagram)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(139,92,246,0.3)',
            }}>
              <Sparkles size={18} color="#FFF" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                FocusCoach
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
                AI STUDY COMPANION
              </div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--gradient-instagram)',
            boxShadow: 'var(--shadow-md)',
          }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                border: '2px solid rgba(255,255,255,0.4)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {user.initials || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name || 'New User'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                {user.exam ? `${user.plan.toUpperCase()} · ${user.exam}` : user.plan.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setMobileOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '11px 14px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: active ? item.gradient : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                  marginBottom: 4,
                  transition: 'var(--transition)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                  boxShadow: active ? '0 4px 14px rgba(139,92,246,0.2)' : 'none',
                }}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '12px 12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={signOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '11px 14px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              transition: 'var(--transition)',
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.4)', zIndex: 90, backdropFilter: 'blur(4px)' }}
          className="sidebar-overlay"
        />
      )}

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 250, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="main-content">
        {/* Top bar */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 28px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setMobileOpen(true)}
              className="mobile-menu-btn"
              style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <Menu size={22} />
            </button>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
              {pageLabels[page]}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {stats.streak > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--accent)',
                background: 'var(--warning-glow)',
                padding: '5px 12px',
                borderRadius: 20,
              }}>
                🔥 {stats.streak}d
              </div>
            )}
            {stats.xp > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--teal)',
                background: 'var(--teal-glow)',
                padding: '5px 12px',
                borderRadius: 20,
              }}>
                ✦ {stats.xp.toLocaleString()} XP
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }} className="page-scroll">
          {children}
        </main>
      </div>
    </div>
  );
}
