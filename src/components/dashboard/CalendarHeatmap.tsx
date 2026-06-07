import React, { useRef, useEffect, useState } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import type { CheckIn, Habit } from '../../types';

interface HeatmapProps {
  habits: Habit[];
  checkIns: CheckIn[];
  weeks?: number;
}

export const CalendarHeatmap: React.FC<HeatmapProps> = ({ habits, checkIns, weeks = 26 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(14);
  const gap = 3;

  // Dynamically compute cell size based on container width
  useEffect(() => {
    const compute = () => {
      if (!containerRef.current) return;
      const dayLabelWidth = 28;
      const availableWidth = containerRef.current.clientWidth - dayLabelWidth - 32; // padding
      // weeks columns + gaps
      const totalCols = weeks;
      const size = Math.floor((availableWidth - gap * (totalCols - 1)) / totalCols);
      setCellSize(Math.max(10, Math.min(size, 18)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [weeks]);

  const activeHabits = habits.filter(h => h.status === 'Active');
  const endDate = new Date();
  const startDate = subDays(endDate, weeks * 7 - 1);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getIntensity = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const done = checkIns.filter(c => c.date === dateStr && c.completionStatus === 'Completed').length;
    if (activeHabits.length === 0) return 0;
    return done / activeHabits.length;
  };

  const getColor = (intensity: number): string => {
    if (intensity === 0) return 'rgba(201,168,76,0.07)';
    if (intensity < 0.25) return 'rgba(201,168,76,0.25)';
    if (intensity < 0.5)  return 'rgba(201,168,76,0.45)';
    if (intensity < 0.75) return 'rgba(201,168,76,0.68)';
    return 'rgba(201,168,76,0.95)';
  };

  // Build week columns
  const weekGroups: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  days.forEach((day, i) => {
    if (i === 0) {
      for (let j = 0; j < day.getDay(); j++) currentWeek.push(null);
    }
    currentWeek.push(day);
    if (day.getDay() === 6) {
      weekGroups.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weekGroups.push(currentWeek);
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weekGroups.forEach((week, wi) => {
    const valid = week.find(d => d !== null) as Date | undefined;
    if (valid) {
      const m = valid.getMonth();
      if (m !== lastMonth) { monthLabels.push({ label: format(valid, 'MMM'), col: wi }); lastMonth = m; }
    }
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const labelWidth = 28;

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 24px',
    }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)', marginBottom: 18 }}>
        Check-in History
      </h3>

      <div ref={containerRef} style={{ width: '100%' }}>
        {/* Month labels row */}
        <div style={{ display: 'flex', marginLeft: labelWidth, marginBottom: 6, position: 'relative', height: 16 }}>
          {monthLabels.map(({ label, col }) => (
            <span key={`${label}-${col}`} style={{
              position: 'absolute',
              left: col * (cellSize + gap),
              fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.04em',
              fontWeight: 500,
            }}>
              {label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap, marginRight: 6, width: labelWidth - 6, flexShrink: 0 }}>
            {dayLabels.map((d, i) => (
              <div key={d} style={{
                height: cellSize, display: 'flex', alignItems: 'center',
                fontSize: 10, color: 'var(--text-muted)',
                opacity: i % 2 === 0 ? 1 : 0,
                justifyContent: 'flex-end', paddingRight: 4,
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div style={{ display: 'flex', gap, flex: 1 }}>
            {weekGroups.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap, flex: 1 }}>
                {week.map((day, di) => {
                  if (!day) return (
                    <div key={di} style={{ flex: 1, aspectRatio: '1', borderRadius: 3, background: 'transparent' }} />
                  );
                  const intensity = getIntensity(day);
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const count = checkIns.filter(c => c.date === dateStr && c.completionStatus === 'Completed').length;
                  return (
                    <div
                      key={di}
                      title={`${format(day, 'MMM d, yyyy')}: ${count} habit${count !== 1 ? 's' : ''} completed`}
                      style={{
                        flex: 1,
                        aspectRatio: '1',
                        borderRadius: 3,
                        background: getColor(intensity),
                        transition: 'opacity 0.15s',
                        cursor: 'default',
                        minWidth: 0,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, marginLeft: labelWidth }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 2 }}>Less</span>
          {[0, 0.2, 0.5, 0.75, 1].map(v => (
            <div key={v} style={{
              width: cellSize, height: cellSize, borderRadius: 3,
              background: getColor(v), flexShrink: 0,
            }} />
          ))}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>More</span>
        </div>
      </div>
    </div>
  );
};
