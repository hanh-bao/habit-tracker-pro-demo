import React, { useState } from 'react';
import { Flame, Edit2, Trash2, Target, ChevronUp, ChevronDown, MoreVertical, Pause, Play, Archive, CheckCircle } from 'lucide-react';
import { Habit, CheckIn, Goal, HabitStats } from '../../types';
import { Badge } from '../shared/Badge';
import { ProgressRing } from '../shared/ProgressRing';
import { CATEGORY_ICONS, CATEGORY_COLORS, today, getCheckInForDate, isFutureDate } from '../../utils/habitUtils';

interface HabitCardProps {
  habit: Habit;
  checkIns: CheckIn[];
  stats: HabitStats;
  goal?: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Habit['status']) => void;
  onCheckIn: (count: number) => void;
  onGoalClick: () => void;
  highlight?: boolean; // not checked in today
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit, checkIns, stats, goal, onEdit, onDelete, onStatusChange,
  onCheckIn, onGoalClick, highlight,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const todayStr = today();
  const ci = getCheckInForDate(checkIns, habit.id, todayStr);
  const completed = ci?.completedCount ?? 0;
  const progress = Math.round((completed / habit.targetPerDay) * 100);
  const isComplete = completed >= habit.targetPerDay;
  const categoryColor = CATEGORY_COLORS[habit.category] ?? '#94a3b8';

  const isScheduledToday = habit.frequency === 'Daily' || (habit.specificDays?.includes(new Date().getDay()) ?? false);

  const goalAlert = stats.goalProgress !== undefined
    ? stats.goalProgress >= 100 ? 'complete'
      : stats.goalProgress >= 80 ? 'near' : null
    : null;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${highlight && habit.status === 'Active' ? 'rgba(201,168,76,0.25)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      position: 'relative',
      transition: 'var(--transition)',
      animation: 'fadeIn 0.3s ease',
      boxShadow: highlight && habit.status === 'Active' ? 'var(--shadow-gold)' : 'var(--shadow-card)',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = highlight && habit.status === 'Active' ? 'rgba(201,168,76,0.25)' : 'var(--border)')}
    >
      {/* Status stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        borderRadius: '12px 0 0 12px',
        background: categoryColor,
        opacity: habit.status === 'Active' ? 1 : 0.3,
      }} />

      {/* Goal alert banner */}
      {goalAlert && (
        <div style={{
          marginBottom: 12, padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          background: goalAlert === 'complete' ? 'rgba(201,168,76,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${goalAlert === 'complete' ? 'var(--gold-dim)' : 'rgba(245,158,11,0.3)'}`,
          fontSize: 12, color: goalAlert === 'complete' ? 'var(--gold)' : 'var(--warning)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {goalAlert === 'complete' ? '🏆 Goal Achieved!' : `⚡ ${stats.goalProgress}% — Almost there!`}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, paddingLeft: 8 }}>
        <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{CATEGORY_ICONS[habit.category]}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{
              fontSize: 16, fontWeight: 400, color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{habit.name}</h3>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge type="category" value={habit.category} />
            <Badge type="priority" value={habit.priority} />
            {habit.status !== 'Active' && <Badge type="status" value={habit.status} />}
          </div>
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setMenuOpen(o => !o)} style={{
            width: 30, height: 30, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', transition: 'var(--transition)',
            background: menuOpen ? 'var(--bg-elevated)' : 'transparent',
          }}>
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 34, right: 0, zIndex: 100,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-elevated)',
              minWidth: 160,
            }} onMouseLeave={() => setMenuOpen(false)}>
              {[
                { icon: <Edit2 size={14}/>, label: 'Edit', action: () => { onEdit(); setMenuOpen(false); } },
                { icon: <Target size={14}/>, label: 'Set Goal', action: () => { onGoalClick(); setMenuOpen(false); } },
                habit.status === 'Active'
                  ? { icon: <Pause size={14}/>, label: 'Pause', action: () => { onStatusChange('Paused'); setMenuOpen(false); } }
                  : { icon: <Play size={14}/>, label: 'Resume', action: () => { onStatusChange('Active'); setMenuOpen(false); } },
                { icon: <Archive size={14}/>, label: 'Archive', action: () => { onStatusChange('Archived'); setMenuOpen(false); } },
                { icon: <Trash2 size={14}/>, label: 'Delete', action: () => { onDelete(); setMenuOpen(false); }, danger: true },
              ].map(item => (
                <button key={item.label} onClick={item.action} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 14px',
                  fontSize: 13, color: (item as any).danger ? 'var(--danger)' : 'var(--text-secondary)',
                  background: 'none',
                  transition: 'var(--transition)',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8, marginBottom: 16, paddingLeft: 8,
      }}>
        {[
          { label: 'Current Streak', value: `${stats.currentStreak}d`, icon: <Flame size={12} color="#f59e0b" /> },
          { label: 'Best Streak', value: `${stats.longestStreak}d`, icon: null },
          { label: '7-day Rate', value: `${stats.completionRateLast7Days}%`, icon: null },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--bg-deep)', borderRadius: 'var(--radius-sm)',
            padding: '8px 10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              {stat.icon}
              <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{stat.label}</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Check-in area */}
      {habit.status === 'Active' && isScheduledToday && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: '12px 14px',
        }}>
          <ProgressRing
            progress={progress}
            size={52}
            strokeWidth={4}
            color={isComplete ? 'var(--success)' : 'var(--gold)'}
            label={isComplete ? '✓' : `${completed}/${habit.targetPerDay}`}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              {isComplete
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--success)' }}>
                    <CheckCircle size={14} /> Completed today!
                  </span>
                : <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {completed === 0 ? "Not started yet" : `${completed} of ${habit.targetPerDay} done`}
                  </span>
              }
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onCheckIn(completed - 1)}
                disabled={completed <= 0}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-elevated)',
                  color: completed <= 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  opacity: completed <= 0 ? 0.4 : 1,
                  cursor: completed <= 0 ? 'not-allowed' : 'pointer',
                }}>
                <ChevronDown size={14} />
              </button>
              <button onClick={() => onCheckIn(completed + 1)}
                disabled={completed >= habit.targetPerDay}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: completed >= habit.targetPerDay ? 'rgba(74,222,128,0.1)' : 'var(--gold-glow)',
                  color: completed >= habit.targetPerDay ? 'var(--success)' : 'var(--gold)',
                  border: `1px solid ${completed >= habit.targetPerDay ? 'rgba(74,222,128,0.3)' : 'var(--border-active)'}`,
                  opacity: completed >= habit.targetPerDay ? 0.5 : 1,
                  cursor: completed >= habit.targetPerDay ? 'not-allowed' : 'pointer',
                }}>
                <ChevronUp size={14} />
              </button>
            </div>
          </div>
          {habit.reminderNote && (
            <div style={{
              fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic',
              maxWidth: 100, textAlign: 'right', lineHeight: 1.4,
            }}>
              {habit.reminderNote}
            </div>
          )}
        </div>
      )}

      {/* Paused overlay indicator */}
      {habit.status !== 'Active' && (
        <div style={{
          background: 'var(--bg-deep)', borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          fontSize: 12, color: 'var(--text-muted)', textAlign: 'center',
          fontStyle: 'italic',
        }}>
          This habit is {habit.status.toLowerCase()}
        </div>
      )}
    </div>
  );
};
