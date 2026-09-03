import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, SectionTitle, Button, Tag, ProgressBar } from '@/components/ui';

const examModules = [
  { key: 'jee', icon: '⚡', name: 'JEE', desc: 'IIT Joint Entrance — Physics, Chemistry, Mathematics', color: 'var(--gold)' },
  { key: 'neet', icon: '🧬', name: 'NEET', desc: 'Medical Entrance — Physics, Chemistry, Biology', color: 'var(--teal)' },
  { key: 'sat', icon: '📐', name: 'SAT', desc: 'Standardized Aptitude Test — Math, Reading, Writing', color: 'var(--blue)' },
  { key: 'custom', icon: '🎯', name: 'Custom', desc: 'Set your own exam goal and timeline', color: 'var(--purple)' },
];

const jeeCurriculum: Record<string, string[]> = {
  Physics: ['Mechanics — Laws of Motion', 'Work, Energy & Power', 'Rotational Motion', 'Electrostatics', 'Current Electricity', 'Magnetism & EMI', 'Optics', 'Modern Physics', 'Thermodynamics', 'Waves & Oscillations'],
  Chemistry: ['Atomic Structure', 'Chemical Bonding', 'Thermodynamics', 'Equilibrium', 'Electrochemistry', 'Organic — Basic Concepts', 'Hydrocarbons', 'Organic — Reactions', 'Coordination Compounds', 'p-Block Elements'],
  Mathematics: ['Complex Numbers', 'Sequences & Series', 'Calculus — Limits', 'Calculus — Differentiation', 'Calculus — Integration', 'Coordinate Geometry', 'Vectors & 3D', 'Probability', 'Matrices & Determinants', 'Differential Equations'],
};

const neetCurriculum: Record<string, string[]> = {
  Physics: ['Mechanics', 'Kinematics', 'Laws of Motion', 'Work & Energy', 'Electrostatics', 'Current Electricity', 'Optics', 'Modern Physics'],
  Chemistry: ['Atomic Structure', 'Chemical Bonding', 'Equilibrium', 'Electrochemistry', 'Organic Chemistry', 'Biomolecules', 'Polymers'],
  Biology: ['Cell Biology', 'Genetics & Evolution', 'Human Physiology', 'Plant Physiology', 'Ecology', 'Biotechnology', 'Reproduction'],
};

type ChapterStatus = 'todo' | 'prog' | 'done';

export function ExamModules() {
  const { user, showToast } = useApp();
  const [openExam, setOpenExam] = useState<string | null>(null);
  const [chapterStatuses, setChapterStatuses] = useState<Record<string, ChapterStatus>>({});

  const openModule = (key: string) => {
    setOpenExam(openExam === key ? null : key);
  };

  const cycleChapter = (subject: string, chapter: string) => {
    const key = `${subject}::${chapter}`;
    const current = chapterStatuses[key] || 'todo';
    const next: ChapterStatus = current === 'todo' ? 'prog' : current === 'prog' ? 'done' : 'todo';
    setChapterStatuses({ ...chapterStatuses, [key]: next });
    const labels: Record<ChapterStatus, string> = { todo: 'Pending', prog: 'Active', done: 'Done' };
    showToast(`${chapter} marked as ${labels[next]}`, next === 'done' ? 'green' : 'gold');
  };

  const renderCurriculum = (curriculum: Record<string, string[]>) => {
    const subjects = Object.keys(curriculum);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
        {subjects.map((subj) => {
          const chapters = curriculum[subj];
          const done = chapters.filter((ch) => chapterStatuses[`${subj}::${ch}`] === 'done').length;
          const pct = Math.round((done / chapters.length) * 100);
          return (
            <Card key={subj}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>{subj}</div>
                <Tag color="gold">{pct}%</Tag>
              </div>
              <ProgressBar value={pct} height={4} style={{ marginBottom: 12 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {chapters.map((ch) => {
                  const status = chapterStatuses[`${subj}::${ch}`] || 'todo';
                  const icons: Record<ChapterStatus, string> = { todo: '○', prog: '◎', done: '✓' };
                  const colors: Record<ChapterStatus, string> = { todo: 'var(--text-muted)', prog: 'var(--gold)', done: 'var(--green)' };
                  const labels: Record<ChapterStatus, string> = { todo: 'Pending', prog: 'Active', done: 'Done' };
                  return (
                    <div
                      key={ch}
                      onClick={() => cycleChapter(subj, ch)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 11, color: colors[status] }}>{icons[status]}</span>
                      <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{ch}</span>
                      <span style={{ fontSize: 10, color: colors[status], fontFamily: 'var(--font-mono)' }}>{labels[status]}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)' }}>Exam Modules</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>Dedicated preparation ecosystems for each exam</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
        {examModules.map((m) => (
          <Card
            key={m.key}
            onClick={() => openModule(m.key)}
            style={{ cursor: 'pointer', transition: 'var(--transition)', border: openExam === m.key ? `1px solid ${m.color}` : '1px solid var(--border-subtle)' }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{m.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: m.color, marginBottom: 6 }}>{m.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{m.desc}</div>
            <div style={{ marginTop: 12 }}>
              <Tag color={user.exam === m.name ? 'gold' : 'teal'}>
                {user.exam === m.name ? 'Your Exam' : 'Explore →'}
              </Tag>
            </div>
          </Card>
        ))}
      </div>

      {openExam === 'jee' && (
        <div className="animate-fadeIn">
          <SectionTitle>JEE Curriculum — Click chapters to track progress</SectionTitle>
          {renderCurriculum(jeeCurriculum)}
        </div>
      )}

      {openExam === 'neet' && (
        <div className="animate-fadeIn">
          <SectionTitle>NEET Curriculum — Click chapters to track progress</SectionTitle>
          {renderCurriculum(neetCurriculum)}
        </div>
      )}

      {openExam === 'sat' && (
        <Card className="animate-fadeIn">
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--blue)', marginBottom: 8 }}>SAT Module</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Full SAT curriculum coming soon — Math, Reading, and Writing & Language modules are being prepared.</div>
        </Card>
      )}

      {openExam === 'custom' && (
        <Card className="animate-fadeIn">
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--purple)', marginBottom: 8 }}>Custom Exam Module</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Set your own exam goal and timeline. This feature will let you define custom subjects and chapters for any exam not listed above.</div>
        </Card>
      )}
    </div>
  );
}
