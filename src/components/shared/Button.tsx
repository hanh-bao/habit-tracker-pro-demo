import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', icon, fullWidth, children, style, ...props
}) => {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 'var(--radius-sm)',
    fontWeight: 500, fontFamily: 'var(--font-body)',
    transition: 'var(--transition)',
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    opacity: props.disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : undefined,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '12px', height: 32 },
    md: { padding: '9px 18px', fontSize: '13px', height: 38 },
    lg: { padding: '11px 24px', fontSize: '14px', height: 44 },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)',
      color: '#0e0f11',
      fontWeight: 600,
      boxShadow: '0 2px 12px rgba(201,168,76,0.3)',
    },
    secondary: {
      background: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'rgba(239,68,68,0.12)',
      color: '#ef4444',
      border: '1px solid rgba(239,68,68,0.25)',
    },
  };

  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...style }} {...props}>
      {icon && icon}
      {children}
    </button>
  );
};
