import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon: string;
  title: string;
  sub: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 40, opacity: 0.4, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>{sub}</div>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function Card({
  children,
  className = '',
  style,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'ghost',
  size = 'md',
  style,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'secondary' | 'success' | 'gradient' | 'gold' | 'teal' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const base: React.CSSProperties = {
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-body)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'var(--transition)',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    opacity: disabled ? 0.5 : 1,
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '7px 14px', fontSize: 12 },
    md: { padding: '10px 20px', fontSize: 13.5 },
    lg: { padding: '14px 28px', fontSize: 15 },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--gradient-warm)', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(249,88,94,0.3)' },
    gradient: { background: 'var(--gradient-instagram)', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(139,92,246,0.3)' },
    secondary: { background: 'var(--gradient-cool)', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' },
    success: { background: 'var(--gradient-fresh)', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' },
    gold: { background: 'var(--gradient-warm)', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(249,88,94,0.3)' },
    teal: { background: 'var(--gradient-fresh)', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(20,184,166,0.3)' },
    blue: { background: 'var(--gradient-cool)', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' },
    ghost: {
      background: 'var(--bg-panel)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

export function Tag({ children, color = 'primary' }: { children: ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    primary: 'var(--primary-glow)',
    secondary: 'var(--secondary-glow)',
    gold: 'var(--primary-glow)',
    teal: 'var(--teal-glow)',
    blue: 'var(--info-glow)',
    green: 'var(--success-glow)',
    red: 'var(--error-glow)',
    purple: 'var(--secondary-glow)',
    success: 'var(--success-glow)',
    warning: 'var(--warning-glow)',
    error: 'var(--error-glow)',
    info: 'var(--info-glow)',
  };
  const textMap: Record<string, string> = {
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    gold: 'var(--primary)',
    teal: 'var(--teal)',
    blue: 'var(--info)',
    green: 'var(--success)',
    red: 'var(--error)',
    purple: 'var(--secondary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
    info: 'var(--info)',
  };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        background: colorMap[color] || colorMap.primary,
        color: textMap[color] || textMap.primary,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  return (
    <div
      style={{
        width: '100%',
        height,
        background: 'var(--bg-panel)',
        borderRadius: height / 2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.min(100, value)}%`,
          height: '100%',
          borderRadius: height / 2,
          background: color || 'var(--gradient-warm)',
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        background: 'rgba(26,26,46,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: open ? 1 : 0,
        transition: 'opacity 0.3s ease',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-formSlide"
        style={{
          background: 'var(--bg-deep)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {title && (
          <div
            style={{
              padding: '24px 28px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </div>
            <div
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                color: 'var(--text-muted)',
              }}
            >
              ✕
            </div>
          </div>
        )}
        <div style={{ padding: 28 }}>{children}</div>
      </div>
    </div>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  style,
  onEnter,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
  onEnter?: () => void;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onEnter) onEnter();
      }}
      style={{
        width: '100%',
        background: 'var(--bg-panel)',
        border: '2px solid transparent',
        borderRadius: 'var(--radius-sm)',
        padding: '11px 16px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        outline: 'none',
        transition: 'var(--transition)',
        ...style,
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--secondary)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'transparent'; }}
    />
  );
}

export function Select({
  value,
  onChange,
  children,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        background: 'var(--bg-panel)',
        border: '2px solid transparent',
        borderRadius: 'var(--radius-sm)',
        padding: '11px 16px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        outline: 'none',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </select>
  );
}
