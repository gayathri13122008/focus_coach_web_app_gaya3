import { useApp } from '@/store/AppContext';
import { Card, SectionTitle, EmptyState, ProgressBar } from '@/components/ui';

export function Analytics() {
  const { sessions, testAttempts, studyDays, stats } = useApp();

  // Last 14 days study hours
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const ds = d.toISOString().slice(0, 10);
    const sd = studyDays.find((s) => s.day_date === ds);
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2) + d.getDate(),
      hours: sd ? Math.round((sd.minutes / 60) * 10) / 10 : 0,
    };
  });

  // Subject distribution
  const subjectMap: Record<string, number> = {};
  sessions.forEach((s) => {
    subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.duration_min;
  });
  const subjectData = Object.entries(subjectMap)
    .map(([subject, min]) => ({ subject, hours: Math.round((min / 60) * 10) / 10 }))
    .sort((a, b) => b.hours - a.hours);

  // Score history
  const scoreData = testAttempts.slice(0, 10).reverse().map((t) => ({
    label: new Date(t.attempt_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    pct: Math.round((t.score / t.total) * 100),
    name: t.name,
  }));

  // Total stats
  const totalHours = studyDays.reduce((sum, s) => sum + s.minutes, 0) / 60;
  const activeDays = studyDays.filter((s) => s.minutes > 0).length;
  const avgDaily = activeDays > 0 ? totalHours / activeDays : 0;
  const bestScore = testAttempts.length > 0 ? Math.max(...testAttempts.map((t) => Math.round((t.score / t.total) * 100))) : null;

  const subjectColors = ['var(--gold)', 'var(--teal)', 'var(--blue)', 'var(--green)', 'var(--purple)', 'var(--orange)'];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)' }}>Analytics</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>Data-driven insights into your study performance</div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard label="Total Hours" value={totalHours > 0 ? totalHours.toFixed(1) : '—'} unit={totalHours > 0 ? 'h' : ''} sub={totalHours > 0 ? 'All time' : 'No sessions yet'} />
        <StatCard label="Avg Daily" value={avgDaily > 0 ? avgDaily.toFixed(1) : '—'} unit={avgDaily > 0 ? 'h' : ''} sub={avgDaily > 0 ? `${activeDays} active days` : 'Start studying'} />
        <StatCard label="Tests Taken" value={testAttempts.length > 0 ? testAttempts.length : '—'} unit="" sub={testAttempts.length > 0 ? 'All time' : 'No tests yet'} />
        <StatCard label="Best Score" value={bestScore !== null ? bestScore : '—'} unit={bestScore !== null ? '%' : ''} sub={bestScore !== null ? 'All-time best' : 'Take a test'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="analytics-grid">
        {/* Study hours chart */}
        <Card>
          <SectionTitle>Study Hours — Last 14 Days</SectionTitle>
          {last14Days.every((d) => d.hours === 0) ? (
            <ChartEmpty msg="Complete focus sessions to see your study hours chart" />
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 200 }}>
              {last14Days.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.min(100, (d.hours / 8) * 100)}%`,
                        background: d.hours > 0 ? 'linear-gradient(180deg, var(--gold), var(--gold-dim))' : 'var(--bg-panel)',
                        borderRadius: '3px 3px 0 0',
                        minHeight: d.hours > 0 ? 3 : 1,
                        transition: 'height 0.6s ease',
                      }}
                      title={`${d.hours}h`}
                    />
                  </div>
                  <div style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{d.label}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Score trend */}
        <Card>
          <SectionTitle>Test Score Trend</SectionTitle>
          {scoreData.length === 0 ? (
            <ChartEmpty msg="Attempt tests to track your score trends" />
          ) : (
            <div style={{ height: 200, position: 'relative' }}>
              <svg width="100%" height="200" style={{ overflow: 'visible' }}>
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <g key={y}>
                    <line x1="0" y1={200 - (y * 2)} x2="100%" y2={200 - (y * 2)} stroke="var(--border-subtle)" strokeWidth="1" />
                    <text x="-4" y={200 - (y * 2) + 3} fontSize="9" fill="var(--text-muted)" textAnchor="end" fontFamily="var(--font-mono)">{y}</text>
                  </g>
                ))}
                {/* Line */}
                <polyline
                  points={scoreData.map((d, i) => `${(i / (scoreData.length - 1)) * 100}%,${200 - (d.pct * 2)}`).join(' ')}
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Points */}
                {scoreData.map((d, i) => (
                  <circle
                    key={i}
                    cx={`${(i / (scoreData.length - 1)) * 100}%`}
                    cy={200 - (d.pct * 2)}
                    r="3"
                    fill="var(--gold)"
                  />
                ))}
              </svg>
            </div>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="analytics-grid">
        {/* Subject distribution */}
        <Card>
          <SectionTitle>Subject Time Distribution</SectionTitle>
          {subjectData.length === 0 ? (
            <ChartEmpty msg="Log study sessions to see subject breakdown" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {subjectData.map((s, i) => (
                <div key={s.subject}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.subject}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: subjectColors[i % subjectColors.length] }}>{s.hours}h</span>
                  </div>
                  <ProgressBar
                    value={(s.hours / subjectData[0].hours) * 100}
                    color={subjectColors[i % subjectColors.length]}
                    height={8}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Weak areas (from test scores) */}
        <Card>
          <SectionTitle>Performance Breakdown</SectionTitle>
          {testAttempts.length === 0 ? (
            <ChartEmpty msg="Attempt tests to identify your weak areas" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {testAttempts.slice(0, 6).map((t) => {
                const pct = Math.round((t.score / t.total) * 100);
                const col = pct >= 75 ? 'var(--green)' : pct >= 55 ? 'var(--gold)' : 'var(--red)';
                return (
                  <div key={t.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{t.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: col }}>{pct}%</span>
                    </div>
                    <ProgressBar value={pct} color={col} height={6} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, sub }: { label: string; value: string | number; unit: string; sub: string }) {
  return (
    <Card>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{value}</div>
        {unit && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{unit}</div>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>
    </Card>
  );
}

function ChartEmpty({ msg }: { msg: string }) {
  return (
    <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13, gap: 8, textAlign: 'center' }}>
      <div style={{ fontSize: 28, opacity: 0.3 }}>◈</div>
      <div>{msg}</div>
    </div>
  );
}
