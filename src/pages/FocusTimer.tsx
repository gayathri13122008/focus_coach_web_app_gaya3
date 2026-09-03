import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, SectionTitle, Button, Input, Tag } from '@/components/ui';

type TimerMode = 'pomodoro' | 'stopwatch';

export function FocusTimer() {
  const { addSession, sessions, showToast } = useApp();
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [duration, setDuration] = useState(25); // minutes
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [subject, setSubject] = useState('');
  const [sessionsDone, setSessionsDone] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todaySessions = sessions.filter((s) => s.session_date === new Date().toISOString().slice(0, 10));
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration_min, 0);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (mode === 'stopwatch') return prev + 1;
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode]);

  const handleComplete = async () => {
    setRunning(false);
    if (!isBreak) {
      const mins = Math.floor(totalSeconds / 60);
      setSessionsDone((s) => s + 1);
      await addSession(subject || 'General Study', mins, mode);
      showToast(`Session complete! +10 XP · ${mins} min logged`, 'gold');
      setIsBreak(true);
      setSecondsLeft(5 * 60);
      setTotalSeconds(5 * 60);
    } else {
      setIsBreak(false);
      setSecondsLeft(duration * 60);
      setTotalSeconds(duration * 60);
      showToast('Break over — back to work!', 'teal');
    }
  };

  const toggleTimer = () => {
    if (running) {
      setRunning(false);
    } else {
      if (mode === 'pomodoro' && secondsLeft === 0) {
        setSecondsLeft(duration * 60);
        setTotalSeconds(duration * 60);
      }
      setRunning(true);
    }
  };

  const resetTimer = () => {
    setRunning(false);
    setIsBreak(false);
    setSecondsLeft(duration * 60);
    setTotalSeconds(duration * 60);
  };

  const skipPhase = () => {
    setRunning(false);
    handleComplete();
  };

  const setModeAndDuration = (m: TimerMode, min: number) => {
    setRunning(false);
    setIsBreak(false);
    setMode(m);
    setDuration(min);
    if (m === 'pomodoro') {
      setSecondsLeft(min * 60);
      setTotalSeconds(min * 60);
    } else {
      setSecondsLeft(0);
      setTotalSeconds(0);
    }
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = mode === 'pomodoro' && totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference * (1 - progress);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)' }}>Focus Timer</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>Deep work sessions with Pomodoro technique</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }} className="timer-grid">
        {/* Timer */}
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            <button
              onClick={() => setModeAndDuration('pomodoro', 25)}
              style={{
                padding: '8px 18px',
                border: 'none',
                borderRadius: 20,
                background: mode === 'pomodoro' ? 'var(--gold-glow)' : 'var(--bg-panel)',
                color: mode === 'pomodoro' ? 'var(--gold)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
              }}
            >
              Pomodoro
            </button>
            <button
              onClick={() => setModeAndDuration('stopwatch', 0)}
              style={{
                padding: '8px 18px',
                border: 'none',
                borderRadius: 20,
                background: mode === 'stopwatch' ? 'var(--gold-glow)' : 'var(--bg-panel)',
                color: mode === 'stopwatch' ? 'var(--gold)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
              }}
            >
              Stopwatch
            </button>
          </div>

          {/* Duration presets */}
          {mode === 'pomodoro' && !running && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {[25, 50, 90].map((m) => (
                <button
                  key={m}
                  onClick={() => setModeAndDuration('pomodoro', m)}
                  style={{
                    padding: '6px 14px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: duration === m ? 'linear-gradient(135deg, var(--gold-dim), var(--gold))' : 'var(--bg-panel)',
                    color: duration === m ? 'var(--bg-void)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {m}m
                </button>
              ))}
            </div>
          )}

          {/* Ring */}
          <div style={{ position: 'relative', width: 280, height: 280, marginBottom: 28 }}>
            <svg width="280" height="280" viewBox="0 0 280 280">
              <circle cx="140" cy="140" r="120" fill="none" stroke="var(--bg-panel)" strokeWidth="6" />
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke={isBreak ? 'var(--teal)' : 'var(--gold)'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 140 140)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 11, color: isBreak ? 'var(--teal)' : 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
                {isBreak ? 'BREAK' : 'FOCUS'}
              </div>
              <div style={{ fontSize: 52, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {formatTime(secondsLeft)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                {isBreak ? 'Relax and recharge' : 'Stay focused'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={toggleTimer}
              style={{
                width: 56,
                height: 56,
                border: 'none',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {running ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button
              onClick={resetTimer}
              style={{
                width: 48,
                height: 48,
                border: '1px solid var(--border-subtle)',
                borderRadius: '50%',
                background: 'var(--bg-panel)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              }}
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={skipPhase}
              style={{
                width: 48,
                height: 48,
                border: '1px solid var(--border-subtle)',
                borderRadius: '50%',
                background: 'var(--bg-panel)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              }}
            >
              <SkipForward size={18} />
            </button>
          </div>
        </Card>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <SectionTitle>Session Subject</SectionTitle>
            <Input value={subject} onChange={setSubject} placeholder="e.g. Physics, Maths..." />
            <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{sessionsDone}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sessions</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>
                  {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Today</div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Recent Sessions</SectionTitle>
            {todaySessions.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '12px 0' }}>No sessions yet today.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todaySessions.slice(0, 8).map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{s.subject}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.mode}</div>
                    </div>
                    <Tag color="teal">{s.duration_min}m</Tag>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
