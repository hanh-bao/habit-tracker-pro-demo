import React, { useState } from 'react';
import type { UserProfile } from '../../types';
import { Button } from '../shared/Button';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Lock, CheckCircle } from 'lucide-react';

interface ProfilePageProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

const AVATARS = ['🧑', '👩', '🧑‍💻', '👨‍🎓', '🧘', '💪', '🌟', '🦁', '🐯', '🦊', '🌈', '🔥'];

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onUpdate, onLogout }) => {
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone ?? '',
    address: profile.address ?? '',
    avatar: profile.avatar ?? '🧑',
  });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateProfile = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProfileSave = () => {
    if (!validateProfile()) return;
    onUpdate(form);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handlePasswordSave = () => {
    setPwError('');
    if (!pwForm.current) { setPwError('Current password is required'); return; }
    if (pwForm.newPw.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    setPwSaved(true);
    setPwForm({ current: '', newPw: '', confirm: '' });
    setTimeout(() => setPwSaved(false), 2500);
  };

  const inputRow = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    icon: React.ReactNode,
    placeholder?: string,
    error?: string,
    type = 'text',
  ) => (
    <div>
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
        }}>{icon}</div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ paddingLeft: 38 }}
        />
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  );

  const Card = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '24px 28px',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400,
        color: 'var(--text-primary)', marginBottom: 20,
        paddingBottom: 16, borderBottom: '1px solid var(--border)',
      }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300 }}>
          Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Manage your personal information
        </p>
      </div>

      {/* Avatar + name preview */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '28px',
        display: 'flex', alignItems: 'center', gap: 20,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--gold-glow) 0%, var(--bg-elevated) 100%)',
          border: '2px solid var(--gold-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
        }}>{form.avatar}</div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400 }}>
            {form.name || 'Your Name'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{form.email}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
            Member since {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Avatar picker */}
      <Card title="Choose Avatar">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {AVATARS.map(av => (
            <button key={av} onClick={() => setForm(f => ({ ...f, avatar: av }))} style={{
              width: 48, height: 48, borderRadius: '50%', fontSize: 24,
              background: form.avatar === av ? 'var(--gold-glow)' : 'var(--bg-elevated)',
              border: `2px solid ${form.avatar === av ? 'var(--gold)' : 'var(--border)'}`,
              transition: 'var(--transition)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: form.avatar === av ? 'var(--shadow-gold)' : 'none',
            }}>{av}</button>
          ))}
        </div>
      </Card>

      {/* Personal info */}
      <Card title="Personal Information">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {inputRow('Full Name', form.name, v => setForm(f => ({ ...f, name: v })),
              <User size={14} />, 'Your full name', formErrors.name)}
            {inputRow('Email Address', form.email, v => setForm(f => ({ ...f, email: v })),
              <Mail size={14} />, 'your@email.com', formErrors.email)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {inputRow('Phone Number', form.phone, v => setForm(f => ({ ...f, phone: v })),
              <Phone size={14} />, '+84 xxx xxx xxx')}
            {inputRow('Address', form.address, v => setForm(f => ({ ...f, address: v })),
              <MapPin size={14} />, 'City, Country')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <Button variant="primary" onClick={handleProfileSave}>Save Changes</Button>
            {profileSaved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: 13 }}>
                <CheckCircle size={15} /> Saved!
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Change password */}
      <Card title="Change Password">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label>Current Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={14} />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.current}
                onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                placeholder="••••••••"
                style={{ paddingLeft: 38, paddingRight: 44 }}
              />
              <button onClick={() => setShowPw(s => !s)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', background: 'none', display: 'flex',
              }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label>New Password</label>
              <input type="password" value={pwForm.newPw}
                onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                placeholder="Min. 6 characters" />
            </div>
            <div>
              <label>Confirm New Password</label>
              <input type="password" value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="••••••••" />
            </div>
          </div>
          {pwError && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{pwError}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button variant="secondary" onClick={handlePasswordSave}>Update Password</Button>
            {pwSaved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: 13 }}>
                <CheckCircle size={15} /> Password updated!
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <div style={{
        background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ color: 'var(--danger)', fontWeight: 500, fontSize: 14 }}>Sign Out</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
            You'll need to sign back in to continue
          </p>
        </div>
        <Button variant="danger" onClick={onLogout}>Sign Out</Button>
      </div>
    </div>
  );
};
