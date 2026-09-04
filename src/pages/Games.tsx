import { useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, Brain, Zap, Trophy, RefreshCw, Check, X, Timer, ChevronRight, Sparkles } from 'lucide-react';
import { Card, SectionTitle, Button, Tag } from '@/components/ui';
import { useApp } from '@/store/AppContext';
import type { PageKey } from '@/lib/types';

type GameId = 'memory' | 'quiz' | 'reaction' | null;

const gameMeta: Record<string, { icon: typeof Brain; label: string; desc: string; gradient: string }> = {
  memory: { icon: Brain, label: 'Memory Match', desc: 'Flip cards and find matching pairs', gradient: 'var(--gradient-cool)' },
  quiz: { icon: Zap, label: 'Quick Quiz', desc: 'Test your knowledge with rapid-fire questions', gradient: 'var(--gradient-warm)' },
  reaction: { icon: Timer, label: 'Reaction Time', desc: 'How fast can you react?', gradient: 'var(--gradient-fresh)' },
};

const quizQuestions = [
  { q: 'What is the chemical symbol for Gold?', a: ['Au', 'Ag', 'Gd', 'Go'], correct: 0 },
  { q: 'Which planet is known as the Red Planet?', a: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1 },
  { q: 'What is 15 × 12?', a: ['170', '180', '190', '200'], correct: 1 },
  { q: 'Who wrote "Romeo and Juliet"?', a: ['Dickens', 'Shakespeare', 'Hemingway', 'Tolstoy'], correct: 1 },
  { q: 'What is the speed of light (approx)?', a: ['3×10⁵ km/s', '3×10⁸ m/s', '3×10⁶ m/s', '3×10⁴ m/s'], correct: 1 },
  { q: 'Which gas do plants absorb from the atmosphere?', a: ['Oxygen', 'Nitrogen', 'CO₂', 'Hydrogen'], correct: 2 },
  { q: 'What is the square root of 144?', a: ['10', '11', '12', '13'], correct: 2 },
  { q: 'How many continents are there on Earth?', a: ['5', '6', '7', '8'], correct: 2 },
  { q: 'What is the capital of Australia?', a: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correct: 2 },
  { q: 'Which element has the atomic number 1?', a: ['Helium', 'Hydrogen', 'Carbon', 'Oxygen'], correct: 1 },
  { q: 'What is the largest organ in the human body?', a: ['Heart', 'Liver', 'Skin', 'Brain'], correct: 2 },
  { q: 'In which year did World War II end?', a: ['1943', '1944', '1945', '1946'], correct: 2 },
];

const memoryEmojis = ['🚀', '📚', '🎯', '⚡', '🧬', '🔬', '📐', '💡'];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function Games({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { showToast } = useApp();
  const [activeGame, setActiveGame] = useState<GameId>(null);
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('focus_coach_game_scores');
      if (stored) setHighScores(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const saveScore = useCallback((game: string, score: number) => {
    setHighScores((prev) => {
      const updated = { ...prev };
      if (!updated[game] || score > updated[game]) {
        updated[game] = score;
        localStorage.setItem('focus_coach_game_scores', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  if (activeGame === 'memory') {
    return <MemoryGame onBack={() => setActiveGame(null)} onSaveScore={saveScore} onToast={showToast} best={highScores.memory} />;
  }
  if (activeGame === 'quiz') {
    return <QuizGame onBack={() => setActiveGame(null)} onSaveScore={saveScore} onToast={showToast} best={highScores.quiz} />;
  }
  if (activeGame === 'reaction') {
    return <ReactionGame onBack={() => setActiveGame(null)} onSaveScore={saveScore} onToast={showToast} best={highScores.reaction} />;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
          Study Games
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Take a quick break, sharpen your mind, and have fun.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
        {Object.entries(gameMeta).map(([key, meta]) => {
          const Icon = meta.icon;
          const best = highScores[key];
          return (
            <Card key={key} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onClick={() => setActiveGame(key as GameId)}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: meta.gradient,
                opacity: 0.08,
                transform: 'translate(30px, -30px)',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: meta.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  flexShrink: 0,
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {meta.label}
                  </div>
                  {best !== undefined && (
                    <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>
                      Best: {key === 'reaction' ? `${best}ms` : best}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                {meta.desc}
              </div>
              <Button variant="gradient" size="sm" onClick={() => setActiveGame(key as GameId)}>
                Play <ChevronRight size={14} />
              </Button>
            </Card>
          );
        })}
      </div>

      <Card style={{ background: 'var(--gradient-instagram)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: 16 }}>
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
            Pro Tip
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#FFF' }}>
            Playing games between study sessions boosts retention and keeps your mind sharp.
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ==================== MEMORY MATCH ==================== */

function MemoryGame({ onBack, onSaveScore, onToast, best }: {
  onBack: () => void;
  onSaveScore: (game: string, score: number) => void;
  onToast: (msg: string, type?: string) => void;
  best?: number;
}) {
  const [cards, setCards] = useState<{ emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [won, setWon] = useState(false);

  const init = useCallback(() => {
    const pairs = shuffle(memoryEmojis).slice(0, 6);
    const deck = shuffle([...pairs, ...pairs]).map((emoji) => ({ emoji, flipped: false, matched: false }));
    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setMatched(0);
    setStartTime(null);
    setWon(false);
  }, []);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (matched > 0 && matched === cards.length / 2) {
      setWon(true);
      const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const score = Math.max(100, 1000 - moves * 20 - elapsed * 2);
      onSaveScore('memory', score);
      onToast(`You won with ${moves} moves! Score: ${score}`, 'green');
    }
  }, [matched, cards.length, moves, startTime, onSaveScore, onToast]);

  const handleFlip = (index: number) => {
    if (cards[index].flipped || cards[index].matched || flippedIndices.length >= 2) return;
    if (!startTime) setStartTime(Date.now());

    const newCards = cards.map((c, i) => i === index ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        setTimeout(() => {
          setCards((prev) => prev.map((c, i) =>
            i === a || i === b ? { ...c, matched: true } : c
          ));
          setMatched((m) => m + 1);
          setFlippedIndices([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c, i) =>
            i === a || i === b ? { ...c, flipped: false } : c
          ));
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <GameHeader title="Memory Match" onBack={onBack} best={best !== undefined ? `${best} pts` : undefined} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, justifyContent: 'center' }}>
        <Tag color="blue">Moves: {moves}</Tag>
        <Tag color="success">Pairs: {matched}/{cards.length / 2}</Tag>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => handleFlip(i)}
            style={{
              aspectRatio: '1',
              borderRadius: 'var(--radius-sm)',
              cursor: card.matched ? 'default' : 'pointer',
              perspective: '600px',
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              background: card.matched ? 'var(--success-glow)' : card.flipped ? 'var(--bg-panel)' : 'var(--gradient-cool)',
              border: card.matched ? '2px solid var(--success)' : card.flipped ? '2px solid var(--border-subtle)' : 'none',
              transition: 'var(--transition)',
              transform: card.flipped || card.matched ? 'scale(1)' : 'scale(1)',
              boxShadow: card.matched ? 'none' : 'var(--shadow-sm)',
            }}>
              {card.flipped || card.matched ? card.emoji : ''}
            </div>
          </div>
        ))}
      </div>
      {won && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button variant="gradient" onClick={init}>
            <RefreshCw size={16} /> Play Again
          </Button>
        </div>
      )}
    </div>
  );
}

/* ==================== QUICK QUIZ ==================== */

function QuizGame({ onBack, onSaveScore, onToast, best }: {
  onBack: () => void;
  onSaveScore: (game: string, score: number) => void;
  onToast: (msg: string, type?: string) => void;
  best?: number;
}) {
  const [questions, setQuestions] = useState(() => shuffle(quizQuestions).slice(0, 8));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === questions[current].correct) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        setFinished(true);
        const finalScore = (score + (index === questions[current].correct ? 1 : 0)) * 100;
        onSaveScore('quiz', finalScore);
        onToast(`Quiz complete! Score: ${finalScore}`, 'green');
      }
    }, 1200);
  };

  const restart = () => {
    setQuestions(shuffle(quizQuestions).slice(0, 8));
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setAnswered(false);
  };

  if (finished) {
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <GameHeader title="Quick Quiz" onBack={onBack} best={best !== undefined ? `${best} pts` : undefined} />
        <Card style={{ padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>
            {score >= 6 ? '🎉' : score >= 4 ? '👍' : '💪'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            You scored {score}/{questions.length}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            {score >= 6 ? 'Excellent work!' : score >= 4 ? 'Good effort!' : 'Keep practicing!'}
          </div>
          <Button variant="gradient" onClick={restart}>
            <RefreshCw size={16} /> Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <GameHeader title="Quick Quiz" onBack={onBack} best={best !== undefined ? `${best} pts` : undefined} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, justifyContent: 'center' }}>
        <Tag color="blue">Question {current + 1}/{questions.length}</Tag>
        <Tag color="success">Correct: {score}</Tag>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 20, textAlign: 'center' }}>
          {q.q}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.a.map((option, i) => {
            const isCorrect = i === q.correct;
            const isSelected = i === selected;
            let bg = 'var(--bg-panel)';
            let border = '2px solid var(--border-subtle)';
            if (answered && isCorrect) {
              bg = 'var(--success-glow)';
              border = '2px solid var(--success)';
            } else if (answered && isSelected && !isCorrect) {
              bg = 'var(--error-glow)';
              border = '2px solid var(--error)';
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: bg,
                  border,
                  borderRadius: 'var(--radius-sm)',
                  cursor: answered ? 'default' : 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  transition: 'var(--transition)',
                  textAlign: 'left',
                }}
              >
                {option}
                {answered && isCorrect && <Check size={18} style={{ color: 'var(--success)' }} />}
                {answered && isSelected && !isCorrect && <X size={18} style={{ color: 'var(--error)' }} />}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ==================== REACTION TIME ==================== */

function ReactionGame({ onBack, onSaveScore, onToast, best }: {
  onBack: () => void;
  onSaveScore: (game: string, score: number) => void;
  onToast: (msg: string, type?: string) => void;
  best?: number;
}) {
  const [state, setState] = useState<'idle' | 'waiting' | 'go' | 'result' | 'tooSoon'>('idle');
  const [reactionTime, setReactionTime] = useState(0);
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);

  const startRound = useCallback(() => {
    setState('waiting');
    const delay = 1500 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      setState('go');
      startTimeRef.current = Date.now();
    }, delay);
  }, []);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const handleClick = () => {
    if (state === 'idle' || state === 'result' || state === 'tooSoon') {
      startRound();
    } else if (state === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState('tooSoon');
    } else if (state === 'go') {
      const elapsed = Date.now() - startTimeRef.current;
      setReactionTime(elapsed);
      const newTimes = [...times, elapsed];
      setTimes(newTimes);
      setState('result');
      if (newTimes.length >= 5) {
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
        onSaveScore('reaction', avg);
        onToast(`Done! Average: ${avg}ms`, 'green');
      } else {
        setRound((r) => r + 1);
      }
    }
  };

  const reset = () => {
    setState('idle');
    setReactionTime(0);
    setRound(0);
    setTimes([]);
  };

  const bg = state === 'go' ? 'var(--gradient-fresh)' : state === 'waiting' ? 'var(--gradient-warm)' : state === 'tooSoon' ? 'var(--gradient-warm)' : 'var(--bg-panel)';
  const message = state === 'idle' ? 'Click to start' : state === 'waiting' ? 'Wait for green...' : state === 'go' ? 'CLICK NOW!' : state === 'tooSoon' ? 'Too soon! Click to retry' : `${reactionTime}ms — Click for next`;
  const textColor = state === 'go' || state === 'waiting' || state === 'tooSoon' ? '#FFF' : 'var(--text-primary)';

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <GameHeader title="Reaction Time" onBack={onBack} best={best !== undefined ? `${best}ms` : undefined} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {times.map((t, i) => (
          <Tag key={i} color={t < 300 ? 'success' : t < 500 ? 'warning' : 'error'}>{t}ms</Tag>
        ))}
        {times.length < 5 && <Tag color="blue">Round {times.length + 1}/5</Tag>}
      </div>
      <div
        onClick={handleClick}
        style={{
          height: 320,
          borderRadius: 'var(--radius-lg)',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: textColor, fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            {message}
          </div>
          {state === 'idle' && (
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              5 rounds, then we average your time
            </div>
          )}
          {state === 'tooSoon' && (
            <div style={{ fontSize: 14, color: '#FFF', opacity: 0.8 }}>
              Wait for the green flash before clicking
            </div>
          )}
        </div>
      </div>
      {times.length >= 5 && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Average: {Math.round(times.reduce((a, b) => a + b, 0) / times.length)}ms
          </div>
          <Button variant="gradient" onClick={reset}>
            <RefreshCw size={16} /> Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

/* ==================== SHARED ==================== */

function GameHeader({ title, onBack, best }: { title: string; onBack: () => void; best?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Button size="sm" onClick={onBack}>← Back</Button>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {title}
        </div>
      </div>
      {best && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
          <Trophy size={14} /> Best: {best}
        </div>
      )}
    </div>
  );
}
