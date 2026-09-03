import { useState, useRef, useEffect } from 'react';
import { Plus, Check, Trash2, Sparkles, Flame, Clock, CheckCircle2, Target, ChevronRight, Camera } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, SectionTitle, Button, Input, EmptyState, Tag } from '@/components/ui';
import type { PageKey } from '@/lib/types';

const defaultMotivationImages = [
  {
    url: 'https://images.pexels.com/photos/34203966/pexels-photo-34203966.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    label: 'Reach new heights',
  },
  {
    url: 'https://images.pexels.com/photos/1594927/pexels-photo-1594927.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    label: 'Celebrate wins',
  },
  {
    url: 'https://images.pexels.com/photos/25643178/pexels-photo-25643178.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    label: 'Your future awaits',
  },
  {
    url: 'https://images.pexels.com/photos/13509190/pexels-photo-13509190.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    label: 'Stay focused',
  },
  {
    url: 'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    label: 'Stay motivated',
  },
];

const CUSTOM_IMAGES_KEY = 'focus_coach_custom_images';

function loadCustomImages(): Record<number, string> {
  try {
    const stored = localStorage.getItem(CUSTOM_IMAGES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveCustomImage(index: number, dataUrl: string) {
  const all = loadCustomImages();
  all[index] = dataUrl;
  localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(all));
}

function removeCustomImage(index: number) {
  const all = loadCustomImages();
  delete all[index];
  localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(all));
}

const quotes = [
  'The expert in anything was once a beginner.',
  'Success is the sum of small efforts repeated daily.',
  'Don\'t watch the clock; do what it does — keep going.',
  'The future belongs to those who prepare for it today.',
  'Push yourself, because no one else is going to do it for you.',
];

const taskSuggestions = [
  { title: 'Review yesterday\'s notes', subject: 'General' },
  { title: 'Solve 10 practice problems', subject: 'Practice' },
  { title: 'Read one chapter', subject: 'Reading' },
  { title: 'Revise flashcards', subject: 'Revision' },
];

export function Dashboard({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { user, stats, tasks, heatmap, addTask, toggleTask, deleteTask, showToast } = useApp();
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('');
  const [customImages, setCustomImages] = useState<Record<number, string>>({});
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCustomImages(loadCustomImages());
  }, []);

  const firstName = user.name.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayTasks = tasks.filter((t) => t.due_date === new Date().toISOString().slice(0, 10));
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return;
    await addTask(taskTitle.trim(), taskSubject.trim() || 'General');
    setTaskTitle('');
    setTaskSubject('');
    setShowAddTask(false);
    showToast('Task added', 'teal');
  };

  const handleAddSuggestedTask = async (title: string, subject: string) => {
    await addTask(title, subject);
    showToast('Task added', 'teal');
  };

  const handleImageUpload = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'red');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image too large (max 5 MB)', 'red');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      saveCustomImage(index, dataUrl);
      setCustomImages((prev) => ({ ...prev, [index]: dataUrl }));
      showToast('Picture updated', 'green');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    removeCustomImage(index);
    setCustomImages((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    showToast('Reverted to default picture', 'gold');
  };

  const openFilePicker = (index: number) => {
    setUploadingIndex(index);
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingIndex !== null) {
      handleImageUpload(uploadingIndex, file);
    }
    setUploadingIndex(null);
    if (e.target) e.target.value = '';
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />

      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--text-primary)' }}>
          {greeting}, {firstName}!
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          {user.exam ? `Your ${user.exam} preparation dashboard` : 'Your study overview for today'}
        </div>
      </div>

      {/* Motivation Story Rail — Instagram-style with custom upload */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          gap: 14,
          overflowX: 'auto',
          padding: '4px 4px 12px',
        }}>
          {defaultMotivationImages.map((img, i) => {
            const customUrl = customImages[i];
            const displayUrl = customUrl || img.url;
            return (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: 96,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => openFilePicker(i)}
                  title="Click to upload your own picture"
                >
                  <div style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    padding: 3,
                    background: 'var(--gradient-story)',
                    transition: 'var(--transition)',
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid var(--bg-deep)',
                      position: 'relative',
                    }}>
                      <img
                        src={displayUrl}
                        alt={img.label}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0)',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                      }}
                      className="story-overlay"
                    >
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Camera size={16} color="#FFF" />
                      </div>
                    </div>
                    </div>
                  </div>
                  {customUrl && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(i); }}
                      style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'var(--error)',
                        border: '2px solid var(--bg-deep)',
                        color: '#FFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        lineHeight: 1,
                        zIndex: 2,
                      }}
                      title="Remove custom picture"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  marginTop: 6,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 96,
                }}>
                  {img.label}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>
          Click any picture to upload your own
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard
          icon={<Flame size={20} />}
          label="Study Streak"
          value={stats.streak > 0 ? stats.streak : '—'}
          unit={stats.streak > 0 ? 'days' : ''}
          sub={stats.streak > 0 ? `Best: ${stats.longestStreak}d` : 'Start your first session'}
          gradient="var(--gradient-warm)"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Hours Today"
          value={stats.todayStudyMinutes > 0 ? (stats.todayStudyMinutes / 60).toFixed(1) : '—'}
          unit={stats.todayStudyMinutes > 0 ? 'h' : ''}
          sub={stats.todayStudyMinutes > 0 ? `${stats.todayStudyMinutes} min logged` : 'No study time yet'}
          gradient="var(--gradient-cool)"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Tasks Today"
          value={stats.tasksTotal > 0 ? stats.tasksCompleted : '—'}
          unit={stats.tasksTotal > 0 ? `/${stats.tasksTotal}` : ''}
          sub={stats.tasksTotal > 0 ? `${Math.round((stats.tasksCompleted / stats.tasksTotal) * 100)}% complete` : 'Add tasks to start'}
          gradient="var(--gradient-fresh)"
        />
        <StatCard
          icon={<Target size={20} />}
          label="Test Accuracy"
          value={stats.testAccuracy !== null ? stats.testAccuracy : '—'}
          unit={stats.testAccuracy !== null ? '%' : ''}
          sub={stats.testAccuracy !== null ? 'Across all attempts' : 'Take a test to see'}
          gradient="var(--gradient-sunny)"
        />
      </div>

      {/* Today's Tasks — full width, prominent */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <SectionTitle style={{ marginBottom: 0 }}>Today's Tasks</SectionTitle>
          <Button size="sm" variant="ghost" onClick={() => setShowAddTask(!showAddTask)}>
            <Plus size={14} /> Add Task
          </Button>
        </div>

        {showAddTask && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <Input value={taskTitle} onChange={setTaskTitle} placeholder="Task name..." style={{ flex: 1 }} onEnter={handleAddTask} />
            <Input value={taskSubject} onChange={setTaskSubject} placeholder="Subject" style={{ width: 120 }} onEnter={handleAddTask} />
            <Button size="sm" variant="gradient" onClick={handleAddTask}>Add</Button>
          </div>
        )}

        {todayTasks.length === 0 ? (
          <div style={{ padding: '16px 0' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              No tasks for today yet. Add your own or pick a quick suggestion:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {taskSuggestions.map((s) => (
                <button
                  key={s.title}
                  onClick={() => handleAddSuggestedTask(s.title, s.subject)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                    transition: 'var(--transition)',
                  }}
                  className="suggestion-chip"
                >
                  <Plus size={12} style={{ color: 'var(--primary)' }} />
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {todayTasks.map((t) => (
              <div
                key={t.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: t.done ? 'none' : '2px solid var(--border)',
                    background: t.done ? 'var(--gradient-fresh)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'white',
                  }}
                >
                  {t.done && <Check size={12} strokeWidth={3} />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: t.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: t.done ? 'line-through' : 'none', fontWeight: t.done ? 400 : 500 }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.subject}</div>
                </div>
                <button
                  onClick={() => deleteTask(t.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, opacity: 0.5 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="dash-grid">
        {/* Heatmap */}
        <Card>
          <SectionTitle>Study Consistency — 84 Days</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, maxWidth: 360 }}>
            {heatmap.map((level, i) => (
              <div
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  background: level === 0 ? 'var(--bg-panel)' : level === 1 ? 'rgba(249,88,94,0.25)' : level === 2 ? 'rgba(249,88,94,0.5)' : level === 3 ? 'rgba(249,88,94,0.75)' : 'var(--primary)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            Less
            {[0, 1, 2, 3, 4].map((l) => (
              <div
                key={l}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  background: l === 0 ? 'var(--bg-panel)' : l === 1 ? 'rgba(249,88,94,0.25)' : l === 2 ? 'rgba(249,88,94,0.5)' : l === 3 ? 'rgba(249,88,94,0.75)' : 'var(--primary)',
                }}
              />
            ))}
            More
            {stats.streak > 0 && <Tag color="primary">{stats.streak} day streak</Tag>}
          </div>
        </Card>

        {/* Daily Quote Card */}
        <Card style={{
          background: 'var(--gradient-instagram)',
          border: 'none',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkles size={24} color="#FFF" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Daily Motivation
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#FFF', fontStyle: 'italic' }}>
              "{dailyQuote}"
            </div>
          </div>
        </Card>
      </div>

      {/* AI Briefing */}
      {(stats.todayStudyMinutes > 0 || todayTasks.length > 0) && (
        <Card style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--gradient-cool)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkles size={20} color="#FFF" />
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', flex: 1 }}>
            <strong style={{ color: 'var(--text-primary)' }}>AI Briefing:</strong>{' '}
            Ask your AI Coach for a personalized plan based on your {user.exam || 'study'} roadmap and today's progress.
          </div>
          <Button size="sm" variant="secondary" onClick={() => onNavigate('ai')}>
            Ask AI →
          </Button>
        </Card>
      )}

      {/* Quick actions */}
      <div style={{ marginTop: 20 }}>
        <SectionTitle>Quick Actions</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <QuickAction icon="⏱" label="Start Focus Session" gradient="var(--gradient-cool)" onClick={() => onNavigate('focus')} />
          <QuickAction icon="🤖" label="Ask AI Coach" gradient="var(--gradient-instagram)" onClick={() => onNavigate('ai')} />
          <QuickAction icon="📅" label="Plan Your Day" gradient="var(--gradient-fresh)" onClick={() => onNavigate('planner')} />
          <QuickAction icon="⊡" label="Review Flashcards" gradient="var(--gradient-sunny)" onClick={() => onNavigate('flashcards')} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, unit, sub, gradient }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  sub: string;
  gradient: string;
}) {
  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: gradient,
        opacity: 0.08,
        transform: 'translate(30px, -30px)',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{value}</div>
        {unit && <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>{unit}</div>}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>
    </Card>
  );
}

function QuickAction({ icon, label, gradient, onClick }: { icon: string; label: string; gradient: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 18px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        transition: 'var(--transition)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{label}</div>
      <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
    </div>
  );
}
