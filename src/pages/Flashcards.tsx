import { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, SectionTitle, Button, Input, Tag, EmptyState, ProgressBar } from '@/components/ui';
import type { PageKey } from '@/lib/types';

export function Flashcards({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { flashcards, addFlashcard, rateFlashcard, showToast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [subject, setSubject] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const dueCards = flashcards.filter((c) => c.next_review <= new Date().toISOString().slice(0, 10));
  const currentCard = dueCards[currentIndex] || dueCards[0] || flashcards[0];

  const handleAdd = async () => {
    if (!question.trim() || !answer.trim()) return;
    await addFlashcard(question.trim(), answer.trim(), subject.trim() || 'General');
    setQuestion('');
    setAnswer('');
    setSubject('');
    setShowAdd(false);
    showToast('Flashcard added', 'teal');
  };

  const rate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;
    await rateFlashcard(currentCard.id, rating);
    setSessionStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, dueCards.length));
    const msgs: Record<string, string> = {
      again: 'Scheduled for tomorrow',
      hard: 'Scheduled for 3 days',
      good: 'Scheduled for 1 week',
      easy: 'Easy! +15 XP',
    };
    showToast(msgs[rating], rating === 'easy' ? 'gold' : rating === 'good' ? 'teal' : rating === 'hard' ? 'orange' : 'red');
  };

  const total = dueCards.length || flashcards.length;
  const reviewed = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;
  const pct = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)' }}>Flashcards</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
            {dueCards.length > 0 ? `${dueCards.length} cards due today` : 'Spaced repetition review'}
          </div>
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={14} /> New Card
        </Button>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 16 }}>
          <SectionTitle>Create Flashcard</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input value={question} onChange={setQuestion} placeholder="Question (front)" />
            <Input value={answer} onChange={setAnswer} placeholder="Answer (back)" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Input value={subject} onChange={setSubject} placeholder="Subject" style={{ width: 200 }} onEnter={handleAdd} />
              <Button variant="gold" onClick={handleAdd} disabled={!question.trim() || !answer.trim()}>Add</Button>
              <Button onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {flashcards.length === 0 ? (
        <Card>
          <EmptyState
            icon="⊡"
            title="No flashcards yet"
            sub="Create your first flashcard or upload resources to the Library — the AI will generate cards automatically."
            action={
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <Button variant="gold" size="sm" onClick={() => setShowAdd(true)}>Create Card →</Button>
                <Button size="sm" onClick={() => onNavigate('library')}>Go to Library →</Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }} className="fc-grid">
          <div>
            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                Card {Math.min(reviewed + 1, total)} of {total}
              </div>
              <ProgressBar value={pct} height={6} />
            </div>

            {/* Flashcard */}
            {currentCard && (
              <div
                onClick={() => setFlipped(!flipped)}
                style={{
                  perspective: 1000,
                  cursor: 'pointer',
                  minHeight: 280,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: 280,
                    transition: 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'none',
                  }}
                >
                  {/* Front */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: 32,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                    }}
                  >
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>QUESTION</div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', textAlign: 'center' }}>{currentCard.question}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', position: 'absolute', bottom: 16 }}>Tap to reveal answer</div>
                  </div>
                  {/* Back */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: 'var(--bg-deep)',
                      border: '1px solid var(--gold)',
                      borderRadius: 'var(--radius)',
                      padding: 32,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                    }}
                  >
                    <div style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>ANSWER</div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--gold)', textAlign: 'center' }}>{currentCard.answer}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Rating buttons */}
            {flipped && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }} className="animate-fadeIn">
                <RateBtn label="Again" color="var(--red)" onClick={() => rate('again')} />
                <RateBtn label="Hard" color="var(--orange)" onClick={() => rate('hard')} />
                <RateBtn label="Good" color="var(--blue)" onClick={() => rate('good')} />
                <RateBtn label="Easy" color="var(--green)" onClick={() => rate('easy')} />
              </div>
            )}
          </div>

          {/* Side panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <SectionTitle>Session Stats</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {([['Easy', 'green', sessionStats.easy], ['Good', 'blue', sessionStats.good], ['Hard', 'orange', sessionStats.hard], ['Again', 'red', sessionStats.again]] as const).map(([l, c, v]) => (
                  <div key={l} style={{ textAlign: 'center', padding: 12, background: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: `var(--${c})`, fontFamily: 'var(--font-mono)' }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <SectionTitle>All Cards ({flashcards.length})</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {flashcards.slice(0, 20).map((c) => (
                  <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.question}</div>
                    <Tag color={c.subject ? 'teal' : 'gold'}>{c.subject}</Tag>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function RateBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px 8px',
        border: `1px solid ${color}`,
        borderRadius: 'var(--radius-sm)',
        background: 'transparent',
        color: color,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        transition: 'var(--transition)',
      }}
    >
      {label}
    </button>
  );
}
