import React, { useState } from 'react';
import { Habit, CheckIn, Goal } from '../../types';
import { computeHabitStats, CATEGORY_ICONS, CATEGORY_COLORS, today, isHabitScheduledToday } from '../../utils/habitUtils';
import { ProgressRing } from '../shared/ProgressRing';
import { Flame, Copy, Check, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface SummaryModeProps {
  habits: Habit[];
  checkIns: CheckIn[];
  goals: Goal[];
  profileName: string;
  onClose: () => void;
}

export const SummaryMode: React.FC<SummaryModeProps> = ({
  habits, checkIns, goals, profileName, onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const activeHabits = habits.filter(h => h.status === 'Active');
  const todayStr = today();
  const scheduled = activeHabits.filter(isHabitScheduledToday);

  const completedToday = scheduled.filter(h => {
    const ci = checkIns.find(c => c.habitId === h.id && c.date === todayStr);
    return ci?.completionStatus === 'Completed';
  }).length;

  const completionPct = scheduled.length > 0
    ? Math.round((completedToday / scheduled.length) * 100) : 0;

  const allStats = activeHabits.map(h => computeHabitStats(checkIns, h, goals));
  const totalStreak = allStats.reduce((a, s) => a + s.currentStreak, 0);

  const generateShareText = () => {
    const lines = [
      `📊 ${profileName}'s Habit Summary — ${format(new Date(), 'MMM d, yyyy')}`,
      ``,
      `Today: ${completedToday}/${scheduled.length} habits completed (${completionPct}%)`,
      `Active habits: ${activeHabits.length}`,
      `Total streak days: ${totalStreak}`,
      ``,
      `Habits:`,
      ...activeHabits.map(h => {
        const s = allStats.find(x => x.habitId === h.id)!;
        return `• ${CATEGORY_ICONS[h.category]} ${h.name} — ${s.currentStreak}d streak, ${s.completionRateLast7Days}% (7d)`;
      }),
      ``,
      `Built with Habit Tracker Pro ✦`,
    ];
    return lines.join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateShareText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(8,8,9,0.92)',
      backdropFilter: 'blur(12px)',
      zIndex: 1500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 520,
        boxShadow: 'var(--shadow-elevated), var(--shadow-gold)',
        animation: 'scaleIn 0.25s ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-deep) 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '28px 28px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
            Read-Only Summary
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300 }}>
            {profileName}'s Progress
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Today's overview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20,
            background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: '16px 20px',
          }}>
            <ProgressRing
              progress={completionPct} size={72} strokeWidth={6}
              color={completionPct === 100 ? 'var(--success)' : 'var(--gold)'}
              label={`${completionPct}%`} sublabel="Today"
            />
            <div style={{ display: 'flex', gap: 20, flex: 1 }}>
              {[
                { label: 'Completed', value: `${completedToday}/${scheduled.length}` },
                { label: 'Active', value: String(activeHabits.length) },
                { label: 'Total Streaks', value: `${totalStreak}d` },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--gold)', fontWeight: 600 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Habit list — read only */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Habit Overview
            </p>
            {activeHabits.map(h => {
              const stats = allStats.find(s => s.habitId === h.id)!;
              const ci = checkIns.find(c => c.habitId === h.id && c.date === todayStr);
              const isCompleted = ci?.completionStatus === 'Completed';
              const catColor = CATEGORY_COLORS[h.category];
              return (
                <div key={h.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  background: 'var(--bg-deep)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isCompleted ? 'rgba(74,222,128,0.15)' : 'var(--border)'}`,
                }}>
                  <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[h.category]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.name}
                    </p>
                    <p style={{ fontSize: 11, color: catColor }}>{h.category}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--warning)' }}>
                        {stats.currentStreak > 0 && <Flame size={11} />}
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{stats.currentStreak}d</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stats.completionRateLast7Days}% (7d)</div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: isCompleted ? 'rgba(74,222,128,0.15)' : 'var(--bg-elevated)',
                      border: `2px solid ${isCompleted ? 'var(--success)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11,
                    }}>
                      {isCompleted ? '✓' : '·'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Read-only notice */}
          <div style={{
            fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
            padding: '8px 0', borderTop: '1px solid var(--border)',
          }}>
            👁 Read-only view — no changes can be made
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, color: 'var(--text-secondary)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            }}>Close</button>
            <button onClick={handleCopy} style={{
              flex: 2, padding: '10px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 600,
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)',
              color: '#0e0f11',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy & Share</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
