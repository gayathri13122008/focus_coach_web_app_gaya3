import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, SectionTitle, Button, Input, ProgressBar, Tag } from '@/components/ui';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function Planner() {
  const { plannerBlocks, addPlannerBlock, deletePlannerBlock, stats, user, studyDays, showToast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [time, setTime] = useState('');
  const [label, setLabel] = useState('');
  const [subject, setSubject] = useState('');

  const handleAdd = async () => {
    if (!time.trim() || !label.trim()) return;
    await addPlannerBlock(time.trim(), label.trim(), subject.trim() || 'General', 'var(--gold)');
    setTime('');
    setLabel('');
    setSubject('');
    setShowAdd(false);
    showToast('Time block added', 'teal');
  };

  // Weekly hours from studyDays
  const weeklyHours = days.map((_, i) => {
    const d = new Date();
    const dayOfWeek = (d.getDay() + 6) % 7; // 0=Mon
    const offset = i - dayOfWeek;
    const target = new Date(d);
    target.setDate(d.getDate() + offset);
    const ds = target.toISOString().slice(0, 10);
    const sd = studyDays.find((s) => s.day_date === ds);
    return sd ? Math.round((sd.minutes / 60) * 10) / 10 : 0;
  });

  const studyPct = Math.min(100, (stats.todayStudyMinutes / (user.dailyHours * 60)) * 100);
  const taskPct = stats.tasksTotal > 0 ? (stats.tasksCompleted / stats.tasksTotal) * 100 : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)' }}>Planner</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={14} /> Add Block
        </Button>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Input value={time} onChange={setTime} placeholder="09:00" style={{ width: 100 }} />
          <Input value={label} onChange={setLabel} placeholder="Activity label" style={{ flex: 1, minWidth: 180 }} onEnter={handleAdd} />
          <Input value={subject} onChange={setSubject} placeholder="Subject" style={{ width: 140 }} onEnter={handleAdd} />
          <Button variant="gold" onClick={handleAdd}>Add</Button>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }} className="planner-grid">
        <Card>
          <SectionTitle>Today's Schedule</SectionTitle>
          {plannerBlocks.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No time blocks yet. Click "Add Block" to plan your day.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {plannerBlocks.map((b) => (
                <div key={b.id} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', minWidth: 50 }}>{b.block_time}</div>
                  <div style={{ width: 3, height: 32, background: b.color, borderRadius: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{b.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.subject}</div>
                  </div>
                  <button onClick={() => deletePlannerBlock(b.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Daily goals */}
          <Card>
            <SectionTitle>Daily Goals</SectionTitle>
            {stats.todayStudyMinutes === 0 && stats.tasksTotal === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>No activity logged yet. Start a focus session.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Study Hours</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>
                      {(stats.todayStudyMinutes / 60).toFixed(1)}h / {user.dailyHours}h
                    </span>
                  </div>
                  <ProgressBar value={studyPct} />
                </div>
                {stats.tasksTotal > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tasks</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal)' }}>{stats.tasksCompleted} / {stats.tasksTotal}</span>
                    </div>
                    <ProgressBar value={taskPct} color="linear-gradient(90deg, var(--teal-dim), var(--teal))" />
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Weekly chart */}
          <Card>
            <SectionTitle>Weekly Study</SectionTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, height: 100, alignItems: 'flex-end' }}>
              {weeklyHours.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.min(100, (h / 8) * 100)}%`,
                        background: h > 0 ? 'linear-gradient(180deg, var(--gold), var(--gold-dim))' : 'var(--bg-panel)',
                        borderRadius: '4px 4px 0 0',
                        minHeight: h > 0 ? 4 : 2,
                        transition: 'height 0.6s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{days[i]}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{h > 0 ? `${h}h` : '—'}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
