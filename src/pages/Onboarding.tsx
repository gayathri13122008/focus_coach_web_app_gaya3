import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Button, Input, Select } from '@/components/ui';
import { Sparkles, Mail, Phone, Clock, TrendingUp } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

const exams = [
  { key: 'JEE', label: 'JEE', desc: 'IIT Joint Entrance — Physics, Chemistry, Maths', icon: '⚡', gradient: 'var(--gradient-warm)' },
  { key: 'NEET', label: 'NEET', desc: 'Medical Entrance — Physics, Chemistry, Biology', icon: '🧬', gradient: 'var(--gradient-fresh)' },
  { key: 'SAT', label: 'SAT', desc: 'Standardized Aptitude Test', icon: '📐', gradient: 'var(--gradient-cool)' },
  { key: 'BOARDS', label: 'Boards', desc: 'Class 10/12 Board Exams', icon: '📚', gradient: 'var(--gradient-sunny)' },
  { key: 'CUSTOM', label: 'Custom', desc: 'Set your own goal', icon: '🎯', gradient: 'var(--gradient-instagram)' },
];

const heroImage = 'https://images.pexels.com/photos/8199708/pexels-photo-8199708.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function Onboarding() {
  const { setUser, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [exam, setExam] = useState('JEE');
  const [dailyHours, setDailyHours] = useState('8');
  const [level, setLevel] = useState('Intermediate');

  const handleEmailContinue = () => {
    if (!email.trim()) {
      showToast('Please enter your email address', 'red');
      return;
    }
    if (!validateEmail(email.trim())) {
      showToast('Please enter a valid email address', 'red');
      return;
    }
    setStep(3);
  };

  const finish = () => {
    if (!name.trim()) {
      showToast('Please enter your name', 'red');
      return;
    }
    const initials = name.trim().split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const profile: Partial<UserProfile> = {
      name: name.trim(),
      initials,
      exam,
      dailyHours: parseInt(dailyHours) || 8,
      level,
      plan: 'free',
      joinedAt: new Date().toISOString(),
      email: email.trim(),
      phone: phone.trim(),
    };
    setUser(profile);
    showToast(`Welcome, ${name.trim().split(' ')[0]}! Let's get started.`, 'gold');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex' }}>
      {/* Left side — hero image (hidden on mobile) */}
      <div
        className="onboarding-hero"
        style={{
          flex: 1,
          position: 'relative',
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(249,88,94,0.6), rgba(139,92,246,0.6))',
        }} />
        <div style={{ position: 'relative', padding: 48, maxWidth: 500 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            padding: '8px 16px',
            borderRadius: 24,
            marginBottom: 20,
          }}>
            <Sparkles size={16} color="#FFF" />
            <span style={{ color: '#FFF', fontSize: 13, fontWeight: 600 }}>AI-POWERED LEARNING</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, color: '#FFF', lineHeight: 1.2, marginBottom: 16 }}>
            Study smarter,<br />not harder.
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
            Join thousands of students achieving their dreams with personalized AI coaching, focus tracking, and study groups.
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#FFF' }}>10K+</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Students</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#FFF' }}>500K+</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Study Hours</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#FFF' }}>98%</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div style={{
        width: 520,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}>
        <div
          className="animate-formSlide"
          style={{
            width: '100%',
            maxWidth: 460,
            background: 'var(--bg-deep)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 32px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 18,
              background: 'var(--gradient-instagram)',
              marginBottom: 16,
              boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
            }}>
              <Sparkles size={26} color="#FFF" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
              FocusCoach
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Your AI-powered study companion
            </div>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  height: 4,
                  flex: 1,
                  maxWidth: 60,
                  borderRadius: 2,
                  background: s === step ? 'var(--gradient-instagram)' : s < step ? 'var(--gradient-fresh)' : 'var(--bg-panel)',
                  transition: 'var(--transition)',
                }}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="animate-fadeIn">
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                What should we call you?
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                We'll personalize your dashboard and AI coaching.
              </div>
              <Input value={name} onChange={setName} placeholder="Your full name" onEnter={() => name.trim() && setStep(2)} />
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="gradient" onClick={() => name.trim() && setStep(2)} disabled={!name.trim()}>
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn">
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                Your contact details
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Enter your email so we can save your progress and add you to study groups.
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={13} /> EMAIL ADDRESS
                </div>
                <Input value={email} onChange={setEmail} placeholder="you@example.com" type="email" onEnter={handleEmailContinue} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={13} /> PHONE NUMBER (OPTIONAL)
                </div>
                <Input value={phone} onChange={setPhone} placeholder="+1 555 000 0000" />
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setStep(1)}>← Back</Button>
                <Button variant="gradient" onClick={handleEmailContinue} disabled={!email.trim()}>
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fadeIn">
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                What are you preparing for?
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                We'll tailor your roadmap and analytics.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {exams.map((e) => (
                  <div
                    key={e.key}
                    onClick={() => setExam(e.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      background: exam === e.key ? 'var(--bg-panel)' : 'var(--bg-card)',
                      border: `2px solid ${exam === e.key ? 'var(--secondary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      boxShadow: exam === e.key ? 'var(--shadow-md)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: e.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      flexShrink: 0,
                    }}>
                      {e.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{e.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setStep(2)}>← Back</Button>
                <Button variant="gradient" onClick={() => setStep(4)}>
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fadeIn">
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                Your study preferences
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Set your daily target and current level.
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} /> DAILY STUDY HOURS
                </div>
                <Input value={dailyHours} onChange={setDailyHours} type="number" placeholder="8" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={13} /> CURRENT LEVEL
                </div>
                <Select value={level} onChange={setLevel}>
                  <option value="Beginner">Beginner — Just starting out</option>
                  <option value="Intermediate">Intermediate — Some foundation</option>
                  <option value="Advanced">Advanced — Strong grasp</option>
                </Select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setStep(3)}>← Back</Button>
                <Button variant="gradient" onClick={finish}>
                  Launch My Journey →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
