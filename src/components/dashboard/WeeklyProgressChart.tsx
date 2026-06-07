import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Habit, CheckIn } from '../../types';
import { CATEGORY_COLORS } from '../../utils/habitUtils';
import { format, subDays } from 'date-fns';

interface WeeklyChartProps {
  habits: Habit[];
  checkIns: CheckIn[];
}

const CATEGORIES = ['Health', 'Study', 'Work', 'Mindfulness', 'Other'] as const;

export const WeeklyProgressChart: React.FC<WeeklyChartProps> = ({ habits, checkIns }) => {
  const last4Weeks = useMemo(() => {
    // Build 4 weeks of data, each week = 7 days
    return Array.from({ length: 4 }, (_, weekIdx) => {
      const weekEnd = subDays(new Date(), weekIdx * 7);
      const weekStart = subDays(weekEnd, 6);
      const label = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`;

      const data: Record<string, any> = { week: weekIdx === 0 ? 'This week' : weekIdx === 1 ? 'Last week' : label };

      CATEGORIES.forEach(cat => {
        const catHabits = habits.filter(h => h.category === cat && h.status === 'Active');
        if (catHabits.length === 0) { data[cat] = 0; return; }

        let totalPossible = 0;
        let totalCompleted = 0;

        for (let d = 0; d <= 6; d++) {
          const date = format(subDays(weekEnd, d), 'yyyy-MM-dd');
          catHabits.forEach(h => {
            const dayOfWeek = subDays(weekEnd, d).getDay();
            const scheduled = h.frequency === 'Daily' || (h.specificDays?.includes(dayOfWeek) ?? false);
            if (!scheduled) return;
            totalPossible++;
            const ci = checkIns.find(c => c.habitId === h.id && c.date === date);
            if (ci?.completionStatus === 'Completed') totalCompleted++;
          });
        }
        data[cat] = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
      });

      return data;
    }).reverse();
  }, [habits, checkIns]);

  const activeCategories = CATEGORIES.filter(cat =>
    habits.some(h => h.category === cat && h.status === 'Active')
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-elevated)',
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: entry.fill, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{entry.name}:</span>
            <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (activeCategories.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '40px',
        textAlign: 'center', color: 'var(--text-muted)', fontSize: 14,
      }}>
        No active habits to chart yet
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 24px',
    }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>
          Weekly Progress by Category
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
          Completion rate (%) per category over the last 4 weeks
        </p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={last4Weeks} barCategoryGap="25%" barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.08)" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
            iconType="square"
            iconSize={10}
            formatter={(value) => (
              <span style={{ color: 'var(--text-secondary)' }}>{value}</span>
            )}
          />
          {activeCategories.map(cat => (
            <Bar
              key={cat}
              dataKey={cat}
              fill={CATEGORY_COLORS[cat]}
              radius={[4, 4, 0, 0]}
              opacity={0.85}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
