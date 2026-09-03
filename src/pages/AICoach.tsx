import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, Tag } from '@/components/ui';
import type { ChatMessage } from '@/lib/types';

const AI_PROMPT = `You are Focus Coach AI, an elite academic study assistant for serious students preparing for competitive exams. You are warm, motivating, and highly knowledgeable. You give concise, precise, and exam-focused answers. Keep responses under 200 words unless explaining a complex concept. Always end with a motivating push or follow-up question.`;

const chips = ['Create a study plan', 'Explain a concept', 'Solve a problem', 'Motivate me'];

export function AICoach() {
  const { user, stats, tasks, sessions, showToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const name = user.name.split(' ')[0] || 'there';
      const exam = user.exam ? ` for ${user.exam}` : ' for your exams';
      setMessages([
        {
          role: 'assistant',
          content: `Hello, ${name}! I'm your AI Study Coach. I'm here to help you study smarter${exam} — whether you need a concept explained, a doubt solved, a daily plan built, or just some motivation. What would you like to work on today?`,
        },
      ]);
    }
  }, [user.name, user.exam, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = async (text: string) => {
    if (!text.trim() || thinking) return;
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setThinking(true);

    // Build context
    let systemPrompt = AI_PROMPT;
    if (user.exam) systemPrompt += ` The student is preparing for ${user.exam}.`;
    if (user.level) systemPrompt += ` Their current level: ${user.level}.`;
    if (stats.todayStudyMinutes > 0) systemPrompt += ` Today they studied ${stats.todayStudyMinutes} minutes.`;
    if (stats.streak > 0) systemPrompt += ` Current streak: ${stats.streak} days.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: systemPrompt,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'I encountered an issue — please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting right now. While I reconnect, remember: consistent daily study beats marathon cramming every time. What topic would you like to tackle?",
        },
      ]);
    }
    setThinking(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <Card style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={20} style={{ color: '#FFFFFF' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Focus Coach AI</div>
          <div style={{ fontSize: 12, color: 'var(--teal)' }}>● Online{user.exam ? ` — ${user.exam} Expert Mode` : ''}</div>
        </div>
        {user.exam && <Tag color="gold">{user.exam}</Tag>}
      </Card>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} className="animate-msgSlide" style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  background: msg.role === 'user' ? 'var(--bg-panel)' : 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
                  color: msg.role === 'user' ? 'var(--text-secondary)' : '#FFFFFF',
                }}
              >
                {msg.role === 'user' ? user.initials || '?' : '✦'}
              </div>
              <div
                style={{
                  maxWidth: '75%',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius)',
                  background: msg.role === 'user' ? 'var(--bg-panel)' : 'var(--bg-card)',
                  border: `1px solid ${msg.role === 'user' ? 'var(--border-subtle)' : 'var(--border)'}`,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {thinking && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>✦</div>
              <div style={{ padding: '14px 18px', borderRadius: 'var(--radius)', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', gap: 6 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--gold)',
                      animation: 'typingPulse 1.4s infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chips */}
      {messages.length <= 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => send(c)}
              style={{
                padding: '8px 16px',
                border: '1px solid var(--border)',
                borderRadius: 20,
                background: 'var(--bg-panel)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 12.5,
                fontFamily: 'var(--font-body)',
                transition: 'var(--transition)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 10 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask anything... (Shift+Enter for new line)"
          rows={1}
          style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            outline: 'none',
            resize: 'none',
            minHeight: 46,
            maxHeight: 120,
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || thinking}
          style={{
            width: 46,
            height: 46,
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
            color: '#FFFFFF',
            cursor: input.trim() && !thinking ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: input.trim() && !thinking ? 1 : 0.4,
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
