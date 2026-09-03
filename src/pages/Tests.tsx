import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, SectionTitle, Button, Input, Tag, EmptyState } from '@/components/ui';

export function Tests() {
  const { testAttempts, addTestAttempt, resources, showToast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [score, setScore] = useState('');
  const [total, setTotal] = useState('');
  const [timeSpent, setTimeSpent] = useState('');

  const handleAdd = async () => {
    const s = parseInt(score);
    const t = parseInt(total);
    if (!name.trim() || isNaN(s) || isNaN(t) || t <= 0) return;
    await addTestAttempt(name.trim(), s, t, timeSpent.trim() || '--');
    setName('');
    setScore('');
    setTotal('');
    setTimeSpent('');
    setShowAdd(false);
    showToast('Test result recorded', 'green');
  };

  // Generate mock available tests from resources
  const availableTests = resources.slice(0, 3).map((r, i) => ({
    id: r.id,
    icon: r.icon,
    name: `${r.title} — Quiz`,
    desc: 'Auto-generated from your uploaded resource',
    duration: '15 min',
  }));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)' }}>Tests</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>Practice tests and performance tracking</div>
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowAdd(!showAdd)}>
          + Log Result
        </Button>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 16 }}>
          <SectionTitle>Log Test Result</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input value={name} onChange={setName} placeholder="Test name (e.g. Physics Mock Test 1)" />
            <div style={{ display: 'flex', gap: 10 }}>
              <Input value={score} onChange={setScore} placeholder="Score" type="number" style={{ flex: 1 }} />
              <Input value={total} onChange={setTotal} placeholder="Total" type="number" style={{ flex: 1 }} />
              <Input value={timeSpent} onChange={setTimeSpent} placeholder="Time (e.g. 45m)" style={{ flex: 1 }} onEnter={handleAdd} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="gold" onClick={handleAdd}>Save Result</Button>
              <Button onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Available tests */}
      <SectionTitle>Available Tests</SectionTitle>
      {availableTests.length === 0 ? (
        <Card style={{ marginBottom: 24 }}>
          <EmptyState
            icon="⊞"
            title="No tests available yet"
            sub="Tests are generated from your Library resources. Upload a PDF or YouTube link to create your first test."
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {availableTests.map((t) => (
            <Card key={t.id} style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{t.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{t.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Tag color="gold">{t.duration}</Tag>
                <Button size="sm" variant="gold" onClick={() => showToast(`Starting ${t.name}...`, 'gold')}>Start →</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Recent attempts */}
      <SectionTitle>Recent Attempts</SectionTitle>
      {testAttempts.length === 0 ? (
        <Card>
          <EmptyState
            icon="◎"
            title="No test attempts yet"
            sub="Complete tests to see your score history, accuracy trends, and AI-generated performance feedback."
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {testAttempts.map((a) => {
            const pct = Math.round((a.score / a.total) * 100);
            const col = pct >= 75 ? 'var(--green)' : pct >= 55 ? 'var(--gold)' : 'var(--red)';
            return (
              <Card key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    border: `3px solid ${col}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: col,
                    flexShrink: 0,
                  }}
                >
                  {pct}%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(a.attempt_date).toLocaleDateString()} · {a.time_spent} · {a.score}/{a.total} marks
                  </div>
                </div>
                <Button size="sm" variant="ghost">View Report →</Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
