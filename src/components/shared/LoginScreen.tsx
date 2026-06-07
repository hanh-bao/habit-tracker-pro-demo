import React, { useState } from 'react';
import type { UserProfile } from '../../types';
import { Button } from '../shared/Button';
import { Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
}

const AVATARS = ['🧑', '👩', '🧑‍💻', '👨‍🎓', '🧘', '💪', '🌟', '🦁'];

// ⚠️ Defined OUTSIDE component to avoid re-creation on every render (fixes focus loss)
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  placeholder?: string;
  children?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, type = 'text', error, placeholder, children }) => (
  <div>
    <label>{label}</label>
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingRight: children ? 44 : 14 }}
      />
      {children && (
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
          {children}
        </div>
      )}
    </div>
    {error && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{error}</p>}
  </div>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🧑');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forgotSent, setForgotSent] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'register' && !name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format';
    if (mode !== 'forgot') {
      if (!password) e.password = 'Password is required';
      else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    }
    if (mode === 'register' && password !== confirmPw) e.confirmPw = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (mode === 'forgot') {
      if (!email.trim()) { setErrors({ email: 'Email is required' }); return; }
      setForgotSent(true);
      return;
    }
    if (!validate()) return;
    onLogin({ name: name || email.split('@')[0], email, avatar: selectedAvatar, joinedAt: new Date().toISOString() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-void)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }} onKeyDown={handleKeyDown}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -150, left: -150, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '40px 36px',
        boxShadow: 'var(--shadow-elevated), var(--shadow-gold)',
        animation: 'scaleIn 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto 14px',
            boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
          }}>✦</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
            Habit Tracker
          </h1>
          <p style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 2 }}>Pro</p>
        </div>

        {/* Tab toggle */}
        {mode !== 'forgot' && (
          <div style={{
            display: 'flex', background: 'var(--bg-deep)',
            borderRadius: 'var(--radius-sm)', padding: 3, marginBottom: 28,
            border: '1px solid var(--border)',
          }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setErrors({}); }} style={{
                flex: 1, padding: '8px', borderRadius: 6,
                fontSize: 13, fontWeight: 500,
                background: mode === m ? 'var(--bg-elevated)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                border: mode === m ? '1px solid var(--border)' : '1px solid transparent',
                transition: 'var(--transition)', textTransform: 'capitalize',
              }}>{m}</button>
            ))}
          </div>
        )}

        {mode === 'forgot' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 6 }}>Reset Password</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Enter your email and we'll send a reset link.</p>
            </div>
            {forgotSent ? (
              <div style={{
                background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: 'var(--radius-md)', padding: 16, color: 'var(--success)', fontSize: 14, textAlign: 'center',
              }}>✅ Reset link sent! Check your inbox.</div>
            ) : (
              <>
                <Field label="Email" value={email} onChange={setEmail} placeholder="your@email.com" error={errors.email} />
                <Button variant="primary" fullWidth onClick={handleSubmit}>Send Reset Link</Button>
              </>
            )}
            <button onClick={() => { setMode('login'); setForgotSent(false); setErrors({}); }}
              style={{ color: 'var(--text-secondary)', fontSize: 13, background: 'none', textDecoration: 'underline' }}>
              Back to Login
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Avatar picker */}
            {mode === 'register' && (
              <div>
                <label>Choose Avatar</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {AVATARS.map(av => (
                    <button key={av} onClick={() => setSelectedAvatar(av)} style={{
                      width: 40, height: 40, borderRadius: '50%', fontSize: 20,
                      background: selectedAvatar === av ? 'var(--gold-glow)' : 'var(--bg-elevated)',
                      border: `2px solid ${selectedAvatar === av ? 'var(--gold)' : 'var(--border)'}`,
                      transition: 'var(--transition)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{av}</button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'register' && (
              <Field label="Full Name" value={name} onChange={setName} placeholder="Your name" error={errors.name} />
            )}

            <Field label="Email" value={email} onChange={setEmail} placeholder="your@email.com" error={errors.email} />

            <Field
              label="Password" value={password} onChange={setPassword}
              type={showPw ? 'text' : 'password'}
              placeholder={mode === 'login' ? '••••••••' : 'Min. 6 characters'}
              error={errors.password}
            >
              <button onClick={() => setShowPw(s => !s)} style={{ color: 'var(--text-muted)', display: 'flex', background: 'none' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </Field>

            {mode === 'register' && (
              <Field label="Confirm Password" value={confirmPw} onChange={setConfirmPw}
                type="password" placeholder="••••••••" error={errors.confirmPw} />
            )}

            <Button variant="primary" fullWidth size="lg" onClick={handleSubmit} style={{ marginTop: 4 }}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            {mode === 'login' && (
              <button onClick={() => { setMode('forgot'); setErrors({}); }}
                style={{ fontSize: 12, color: 'var(--gold)', background: 'none', textAlign: 'center' }}>
                Forgot password?
              </button>
            )}
          </div>
        )}

        {/* Demo hint */}
        <div style={{
          marginTop: 24, padding: '12px 14px',
          background: 'var(--bg-deep)', borderRadius: 'var(--radius-sm)',
          fontSize: 12, color: 'var(--text-muted)',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          💡 Demo: any email & password works (no real backend)
        </div>
      </div>
    </div>
  );
};
