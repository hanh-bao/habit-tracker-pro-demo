import React from 'react';
import { Habit, CheckIn, Goal, HabitStats } from '../../types';
import { ProgressRing } from '../shared/ProgressRing';
import { CATEGORY_COLORS, CATEGORY_ICONS, today, computeHabitStats, isHabitScheduledToday } from '../../utils/habitUtils';
import { Flame, TrendingUp, Zap, CheckCircle, Activity } from 'lucide-react';

interface DashboardProps {
  habits: Habit[];
  checkIns: CheckIn[];
  goals: Goal[];
}

export const Dashboard: React.FC<DashboardProps> = ({ habits, checkIns, goals }) => {
  const activeHabits = habits.filter(h => h.status === 'Active');
  const scheduledToday = activeHabits.filter(isHabitScheduledToday);
  const todayStr = today();

  const completedToday = scheduledToday.filter(h => {
    const ci = checkIns.find(c => c.habitId === h.id && c.date === todayStr);
    return ci?.completionStatus === 'Completed';
  }).length;

  const completionPct = scheduledToday.length > 0
    ? Math.round((completedToday / scheduledToday.length) * 100) : 0;

  const allStats = activeHabits.map(h => computeHabitStats(checkIns, h, goals));

  const atRisk = activeHabits.filter(h => {
    const stats = allStats.find(s => s.habitId === h.id);
    return stats && stats.currentStreak > 0 && isHabitScheduledToday(h) &&
      !checkIns.find(c => c.habitId === h.id && c.date === todayStr && c.completionStatus === 'Completed');
  }).length;

  const totalStreak = allStats.reduce((acc, s) => acc + s.currentStreak, 0);

  // Group by category
  const byCategory = Object.entries(
    activeHabits.reduce((acc, h) => {
      acc[h.category] = acc[h.category] ?? [];
      acc[h.category].push(h);
      return acc;
    }, {} as Record<string, Habit[]>)
  );

  const overviewCards = [
    {
      label: 'Completed Today',
      value: `${completedToday}/${scheduledToday.length}`,
      sub: `${completionPct}% done`,
      icon: <CheckCircle size={20} color="var(--success)" />,
      color: 'var(--success)',
    },
    {
      label: 'Active Habits',
      value: String(activeHabits.length),
      sub: `${scheduledToday.length} scheduled today`,
      icon: <Activity size={20} color="var(--gold)" />,
      color: 'var(--gold)',
    },
    {
      label: 'At Risk',
      value: String(atRisk),
      sub: 'streaks to protect',
      icon: <Zap size={20} color={atRisk > 0 ? 'var(--danger)' : 'var(--text-muted)'} />,
      color: atRisk > 0 ? 'var(--danger)' : 'var(--text-muted)',
    },
    {
      label: 'Total Streak Days',
      value: String(totalStreak),
      sub: 'across all habits',
      icon: <Flame size={20} color="#f59e0b" />,
      color: '#f59e0b',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Today's overall progress */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        display: 'flex', alignItems: 'center', gap: 32,
        boxShadow: 'var(--shadow-card)',
      }}>
        <ProgressRing
          progress={completionPct}
          size={100}
          strokeWidth={8}
          color={completionPct === 100 ? 'var(--success)' : 'var(--gold)'}
          label={`${completionPct}%`}
          sublabel="Today"
        />
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--text-primary)', marginBottom: 4 }}>
            {completionPct === 100 ? "Perfect day! 🏆" :
             completionPct >= 50 ? "Great progress!" :
             completedToday === 0 ? "Ready to begin?" : "Keep going!"}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {completedToday} of {scheduledToday.length} habits completed today
          </p>
          {atRisk > 0 && (
            <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>
              ⚡ {atRisk} streak{atRisk > 1 ? 's' : ''} at risk — don't break the chain!
            </p>
          )}
        </div>
      </div>

      {/* Overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {overviewCards.map(card => (
          <div key={card.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {card.label}
              </span>
              {card.icon}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500, color: card.color, lineHeight: 1 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Per-habit stats table */}
      {activeHabits.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>
              Habit Performance
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-deep)' }}>
                  {['Habit', 'Category', 'Current Streak', 'Best Streak', 'Total', '7-day %', 'Goal'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: 'var(--text-muted)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeHabits.map((habit, i) => {
                  const stats = allStats.find(s => s.habitId === habit.id)!;
                  const goal = goals.find(g => g.habitId === habit.id);
                  return (
                    <tr key={habit.id} style={{
                      borderTop: '1px solid var(--border)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{CATEGORY_ICONS[habit.category]}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{habit.name}</span>
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, color: CATEGORY_COLORS[habit.category] }}>{habit.category}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                          {stats.currentStreak > 0 && <Flame size={12} color="#f59e0b" />}
                          {stats.currentStreak}d
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {stats.longestStreak}d
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {stats.totalCompletions}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 4, background: 'var(--bg-elevated)', borderRadius: 2, minWidth: 60 }}>
                            <div style={{
                              height: '100%', borderRadius: 2,
                              width: `${stats.completionRateLast7Days}%`,
                              background: stats.completionRateLast7Days >= 80 ? 'var(--success)' :
                                stats.completionRateLast7Days >= 50 ? 'var(--gold)' : 'var(--danger)',
                              transition: 'width 0.6s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', minWidth: 32 }}>
                            {stats.completionRateLast7Days}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {goal ? (
                          <span style={{ fontSize: 12, color: (stats.goalProgress ?? 0) >= 100 ? 'var(--gold)' : 'var(--text-muted)' }}>
                            {(stats.goalProgress ?? 0) >= 100 ? '🏆 Done' : `${stats.goalProgress}%`}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {byCategory.length > 1 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)', marginBottom: 16 }}>
            By Category
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {byCategory.map(([cat, habits]) => (
              <div key={cat} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)',
                padding: '10px 16px',
                border: `1px solid ${CATEGORY_COLORS[cat]}25`,
              }}>
                <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[cat]}</span>
                <div>
                  <div style={{ fontSize: 13, color: CATEGORY_COLORS[cat], fontWeight: 500 }}>{cat}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{habits.length} habit{habits.length > 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
