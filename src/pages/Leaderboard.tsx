import { useState, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, SectionTitle, Tag, EmptyState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import type { LeaderboardProfile } from '@/lib/supabase';

type LbType = 'global' | 'weekly';

export function Leaderboard() {
  const { user, stats, leaderboard } = useApp();
  const [type, setType] = useState<LbType>('global');
  const [weeklyData, setWeeklyData] = useState<LeaderboardProfile[]>([]);

  // For weekly view, we just show the same data for now (since we don't track weekly XP separately)
  useEffect(() => {
    if (type === 'weekly') {
      // Refresh from DB for the weekly tab
      supabase
        .from('leaderboard_profiles')
        .select('*')
        .order('xp', { ascending: false })
        .then(({ data }) => {
          if (data) setWeeklyData(data as LeaderboardProfile[]);
        });
    }
  }, [type]);

  const displayData = type === 'weekly' && weeklyData.length > 0 ? weeklyData : leaderboard;

  // Find current user's position
  const myEntry = displayData.find((p) => p.name === user.name);
  const myRank = myEntry ? displayData.findIndex((p) => p.name === user.name) + 1 : null;

  // If user has XP but isn't in the leaderboard yet, we show them at the bottom
  const showUserRow = stats.xp > 0 && !myEntry;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)' }}>Leaderboard</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
          {myRank ? `Your rank: #${myRank} out of ${displayData.length} students` : 'Study consistently to earn a rank'}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['global', 'weekly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: 20,
              background: type === t ? 'var(--gold-glow)' : 'var(--bg-panel)',
              color: type === t ? 'var(--gold)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
            }}
          >
            {t === 'global' ? 'Global' : 'Weekly'}
          </button>
        ))}
      </div>

      {displayData.length === 0 && !showUserRow ? (
        <Card>
          <EmptyState
            icon="◆"
            title="No leaderboard entries yet"
            sub="Be the first to appear on the leaderboard! Complete focus sessions and tasks to earn XP — your profile will appear here automatically."
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayData.map((p, i) => {
            const rank = i + 1;
            const medals = ['🥇', '🥈', '🥉'];
            const rankDisplay = rank <= 3 ? medals[rank - 1] : `#${rank}`;
            const isMe = p.name === user.name;
            const avatarColors = ['var(--gold)', 'var(--teal)', 'var(--blue)', 'var(--purple)', 'var(--green)', 'var(--orange)'];
            const avatarColor = avatarColors[i % avatarColors.length];
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  background: isMe ? 'var(--gold-glow)' : 'var(--bg-card)',
                  border: `1px solid ${isMe ? 'var(--gold)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius)',
                }}
              >
                <div style={{ width: 32, textAlign: 'center', fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 700, color: rank <= 3 ? 'var(--gold)' : 'var(--text-muted)' }}>
                  {rankDisplay}
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {p.initials || p.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}{isMe ? ' (You)' : ''}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {p.exam ? `${p.exam} · ` : ''}{p.xp.toLocaleString()} XP{p.streak > 0 ? ` · 🔥 ${p.streak}d` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{p.xp.toLocaleString()}</div>
                  {p.tests_taken > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.tests_taken} tests</div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Show current user at bottom if they have XP but aren't in leaderboard yet */}
          {showUserRow && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                background: 'var(--gold-glow)',
                border: '1px solid var(--gold)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div style={{ width: 32, textAlign: 'center', fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                —
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                {user.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name} (You)</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {user.exam ? `${user.exam} · ` : ''}{stats.xp.toLocaleString()} XP{stats.streak > 0 ? ` · 🔥 ${stats.streak}d` : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{stats.xp.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
