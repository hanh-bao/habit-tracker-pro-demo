import React from 'react';
import { LayoutDashboard, CheckSquare, BarChart2, Download, RotateCcw, Sparkles, User, Eye } from 'lucide-react';
import type { UserProfile } from '../../types';

export type NavTab = 'dashboard' | 'habits' | 'stats' | 'export' | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onUndo: () => void;
  onReset: () => void;
  onSummary: () => void;
  canUndo: boolean;
  profile: UserProfile;
}

const navItems: { tab: NavTab; icon: React.ReactNode; label: string }[] = [
  { tab: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { tab: 'habits', icon: <CheckSquare size={18} />, label: 'Habits' },
  { tab: 'stats', icon: <BarChart2 size={18} />, label: 'Statistics' },
  { tab: 'export', icon: <Download size={18} />, label: 'Export' },
  { tab: 'profile', icon: <User size={18} />, label: 'Profile' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onUndo, onReset, onSummary, canUndo, profile }) => {
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'var(--bg-deep)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 22px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>✦</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.04em', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Habit Tracker
            </div>
            <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 1 }}>Pro</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 8 }}>
          Navigation
        </div>
        {navItems.map(item => (
          <button key={item.tab} onClick={() => onTabChange(item.tab)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', padding: '9px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13, fontWeight: 500,
            color: activeTab === item.tab ? 'var(--gold)' : 'var(--text-secondary)',
            background: activeTab === item.tab ? 'var(--gold-glow)' : 'transparent',
            border: `1px solid ${activeTab === item.tab ? 'var(--border-active)' : 'transparent'}`,
            marginBottom: 2, transition: 'var(--transition)', textAlign: 'left',
          }}
            onMouseEnter={e => { if (activeTab !== item.tab) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}}
            onMouseLeave={e => { if (activeTab !== item.tab) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}}
          >
            {item.icon} {item.label}
          </button>
        ))}

        {/* Summary button */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <button onClick={onSummary} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', padding: '9px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13, fontWeight: 500,
            color: 'var(--text-secondary)',
            background: 'transparent',
            border: '1px solid transparent',
            transition: 'var(--transition)', textAlign: 'left',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Eye size={18} /> Summary View
          </button>
        </div>
      </nav>

      {/* User profile mini */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        {/* Undo / Reset */}
        <button onClick={onUndo} disabled={!canUndo} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
          fontSize: 12, fontWeight: 500,
          color: canUndo ? 'var(--text-secondary)' : 'var(--text-muted)',
          background: 'none', marginBottom: 2,
          opacity: canUndo ? 1 : 0.4, cursor: canUndo ? 'pointer' : 'not-allowed',
          transition: 'var(--transition)',
        }}
          onMouseEnter={e => { if (canUndo) e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { if (canUndo) e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <RotateCcw size={14} /> Undo Check-in
        </button>
        <button onClick={onReset} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
          fontSize: 12, color: 'var(--danger)', background: 'none',
          transition: 'var(--transition)',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <Sparkles size={14} /> Reset All Data
        </button>

        {/* Profile mini */}
        <button onClick={() => {}} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '10px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          marginTop: 8, transition: 'var(--transition)',
          cursor: 'default',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--gold-glow)', border: '1px solid var(--gold-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0,
          }}>{profile.avatar ?? '🧑'}</div>
          <div style={{ minWidth: 0, textAlign: 'left' }}>
            <p style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.name || 'User'}
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.email}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
};
