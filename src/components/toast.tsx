import { useState, useCallback, useRef, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type ToastType = 'gold' | 'teal' | 'blue' | 'green' | 'red' | 'orange' | 'purple';

export type Toast = {
  id: number;
  text: string;
  type: ToastType;
};

let toastId = 0;

const ToastContext = createContext<{
  showToast: (text: string, type?: ToastType) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback((text: string, type: ToastType = 'gold') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, text, type }]);
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timers.current[id];
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.showToast;
}

const toastColors: Record<ToastType, string> = {
  gold: 'var(--gold)',
  teal: 'var(--teal)',
  blue: 'var(--blue)',
  green: 'var(--green)',
  red: 'var(--red)',
  orange: 'var(--orange)',
  purple: 'var(--purple)',
};

export function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toastSlide"
          onClick={() => dismiss(t.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 18px',
            background: 'var(--bg-deep)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer',
            maxWidth: 380,
          }}
        >
          <div style={{ width: 3, height: 24, background: toastColors[t.type], borderRadius: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{t.text}</div>
        </div>
      ))}
    </div>
  );
}
