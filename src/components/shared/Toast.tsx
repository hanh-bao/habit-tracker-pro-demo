import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Trophy, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'milestone';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const t = setTimeout(() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }, 3500);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle size={16} color="var(--success)" />,
    warning: <AlertTriangle size={16} color="var(--warning)" />,
    milestone: <Trophy size={16} color="var(--gold)" />,
  };

  const colors = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    milestone: 'var(--gold)',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-elevated)',
      border: `1px solid ${colors[toast.type]}30`,
      borderLeft: `3px solid ${colors[toast.type]}`,
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      boxShadow: 'var(--shadow-elevated)',
      minWidth: 280, maxWidth: 360,
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {icons[toast.type]}
      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} style={{ color: 'var(--text-muted)', display: 'flex' }}>
        <X size={14} />
      </button>
    </div>
  );
};

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => (
  <div style={{
    position: 'fixed', bottom: 24, right: 24,
    display: 'flex', flexDirection: 'column', gap: 8,
    zIndex: 2000,
  }}>
    {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={onRemove} />)}
  </div>
);
