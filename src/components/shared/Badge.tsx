import React from 'react';
import { CATEGORY_COLORS, PRIORITY_COLORS } from '../../utils/habitUtils';
import type { Category, Priority, HabitStatus } from '../../types';

interface BadgeProps {
  type: 'category' | 'priority' | 'status';
  value: Category | Priority | HabitStatus | string;
}

const STATUS_COLORS: Record<string, string> = {
  Active: '#4ade80',
  Paused: '#f59e0b',
  Archived: '#94a3b8',
};

export const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  let color = '#94a3b8';
  if (type === 'category') color = CATEGORY_COLORS[value] ?? color;
  else if (type === 'priority') color = PRIORITY_COLORS[value] ?? color;
  else if (type === 'status') color = STATUS_COLORS[value] ?? color;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 11, fontWeight: 500, letterSpacing: '0.05em',
      background: `${color}18`,
      color,
      border: `1px solid ${color}30`,
    }}>
      {type === 'status' && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: color,
          display: 'inline-block',
        }} />
      )}
      {value}
    </span>
  );
};
