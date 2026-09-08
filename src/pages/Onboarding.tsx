import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Button, Input, Select } from '@/components/ui';
import { Sparkles, Mail, Lock, User, Phone, Clock, TrendingUp } from 'lucide-react';

const exams = [
  { key: 'JEE', label: 'JEE', desc: 'IIT Joint Entrance — Physics, Chemistry, Maths', icon: '⚡', gradient: 'var(--gradient-warm)' },
  { key: 'NEET', label: 'NEET', desc: 'Medical Entrance — Physics, Chemistry, Biology', icon: '🧬', gradient: 'var(--gradient-fresh)' },
  { key: 'SAT', label: 'SAT', desc: 'Standardized Aptitude Test', icon: '📐', gradient: 'var(--gradient-cool)' },
  { key: 'BOARDS', label: 'Boards', desc: 'Class 10/12 Board Exams', icon: '📚', gradient: 'var(--gradient-sunny)' },
  { key: 'CUSTOM', label: 'Custom', desc: 'Set your own goal', icon: '🎯', gradient: 'var(--gradient-instagram)' },
];

const heroImage = 'https://images.pexels.com/photos/8199708/pexels-photo-8199708.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

type Mode = 'welcome' | 'signin' | 'signup';

export function Onboarding() {
  const { signIn, signUp, showToast } = useApp();
  const [mode, setMode] = useState<Mode>('welcome');

  // Sign-in fields
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinLoading, setSigninLoading] = useState(false);

  // Sign-up fields
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [exam, setExam] = useState('JEE');
  const [dailyHours, setDailyHours] = useState('8');
  const [level, setLevel] = useState('Intermediate');
  const [signupLoading, setSignupLoading] = useState(false);

  const handleSignIn = async () => {
    if (!signinEmail.trim() || !signinPassword) {
      showToast('Please enter your email and password', 'red');
      return;
    }
    setSigninLoading(true);
    const { error } = await signIn(signinEmail.trim(), signinPassword);
    setSigninLoading(false);
    if (error) {
      showToast(error, 'red');
    } else {
      showToast('Welcome back!', 'green');
    }
  };

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      showToast('Please fill in all required fields', 'red');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'red');
      return;
    }
    setSignupLoading(true);
    const { error } = await signUp(email.trim(), password, {
      name: name.trim(),
      exam,
      dailyHours: parseInt(dailyHours) || 8,
      level,
      phone: phone.trim(),
    });
    setSignupLoading(false);
    if (error) {
      showToast(error, 'red');
    } else {
      showToast(`Welcome, ${name.trim().split(' ')[0]}! Let's get started.`, 'gold');
    }
  };

  const resetSignUp = () => {
    setStep(1);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setExam('JEE');
    setDailyHours('8');
    setLevel('Intermediate');
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
            <span style={{ color: '#FFF', fontSize: 13, fontWeight: 600 }}>PERSONALIZED STUDY COACHING</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, color: '#FFF', lineHeight: 1.2, marginBottom: 16 }}>
            Study smarter,<br />not harder.
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
            Join thousands of students achieving their dreams with personalized focus tracking, study games, and study groups.
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
              Your personalized study companion
            </div>
          </div>

          {/* ==================== WELCOME ==================== */}
          {mode === 'welcome' && (
            <div className="animate-fadeIn" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                Get started
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
                New here? Create an account. Returning? Sign back in.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Button variant="gradient" size="lg" onClick={() => { resetSignUp(); setMode('signup'); }}>
                  Create Account →
                </Button>
                <Button variant="ghost" size="lg" onClick={() => setMode('signin')}>
                  I already have an account
                </Button>
              </div>
            </div>
          )}

          {/* ==================== SIGN IN ==================== */}
          {mode === 'signin' && (
            <div className="animate-fadeIn">
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                Welcome back!
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Sign in to continue your study journey.
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={13} /> EMAIL ADDRESS
                </div>
                <Input value={signinEmail} onChange={setSigninEmail} placeholder="you@example.com" type="email" onEnter={handleSignIn} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={13} /> PASSWORD
                </div>
                <Input value={signinPassword} onChange={setSigninPassword} placeholder="Your password" type="password" onEnter={handleSignIn} />
              </div>
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setMode('welcome')}>← Back</Button>
                <Button variant="gradient" onClick={handleSignIn} disabled={signinLoading}>
                  {signinLoading ? 'Signing in...' : 'Sign In →'}
                </Button>
              </div>
              <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <span
                  onClick={() => { resetSignUp(); setMode('signup'); }}
                  style={{ color: 'var(--secondary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Sign up
                </span>
              </div>
            </div>
          )}

          {/* ==================== SIGN UP (multi-step) ==================== */}
          {mode === 'signup' && (
            <>
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
                    Create your account
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Let's set up your profile. What should we call you?
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={13} /> FULL NAME
                    </div>
                    <Input value={name} onChange={setName} placeholder="Your full name" onEnter={() => name.trim() && setStep(2)} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={13} /> EMAIL ADDRESS
                    </div>
                    <Input value={email} onChange={setEmail} placeholder="you@example.com" type="email" onEnter={() => email.trim() && setStep(2)} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Lock size={13} /> PASSWORD
                    </div>
                    <Input value={password} onChange={setPassword} placeholder="At least 6 characters" type="password" onEnter={() => password && setStep(2)} />
                  </div>
                  <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={() => setMode('welcome')}>← Back</Button>
                    <Button variant="gradient" onClick={() => setStep(2)} disabled={!name.trim() || !email.trim() || !password}>
                      Continue →
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fadeIn">
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                    Contact details
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Your phone number is optional, used for study group coordination.
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={13} /> PHONE NUMBER (OPTIONAL)
                    </div>
                    <Input value={phone} onChange={setPhone} placeholder="+1 555 000 0000" onEnter={() => setStep(3)} />
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={() => setStep(1)}>← Back</Button>
                    <Button variant="gradient" onClick={() => setStep(3)}>
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
                    <Button variant="gradient" onClick={handleSignUp} disabled={signupLoading}>
                      {signupLoading ? 'Creating account...' : 'Launch My Journey →'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
