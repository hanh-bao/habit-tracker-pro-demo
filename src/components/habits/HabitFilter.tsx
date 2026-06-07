import React from 'react';
import type { FilterOptions, Category, Frequency, Priority, HabitStatus } from '../../types';
import { SlidersHorizontal } from 'lucide-react';

interface HabitFilterProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
}

type FilterKey = keyof FilterOptions;

export const HabitFilter: React.FC<HabitFilterProps> = ({ filters, onChange }) => {
  const filterGroups: { key: FilterKey; options: string[] }[] = [
    { key: 'category', options: ['All', 'Health', 'Study', 'Work', 'Mindfulness', 'Other'] },
    { key: 'priority', options: ['All', 'Low', 'Medium', 'High'] },
    { key: 'status', options: ['All', 'Active', 'Paused', 'Archived'] },
    { key: 'frequency', options: ['All', 'Daily', 'Specific days'] },
  ];

  const labels: Record<FilterKey, string> = {
    category: 'Category',
    priority: 'Priority',
    status: 'Status',
    frequency: 'Frequency',
  };

  const activeCount = Object.values(filters).filter(v => v !== 'All').length;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <SlidersHorizontal size={14} color="var(--gold)" />
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Filters
        </span>
        {activeCount > 0 && (
          <span style={{
            fontSize: 10, background: 'var(--gold)', color: '#0e0f11',
            borderRadius: 20, padding: '1px 7px', fontWeight: 700,
          }}>{activeCount}</span>
        )}
        {activeCount > 0 && (
          <button onClick={() => onChange({ category: 'All', priority: 'All', status: 'All', frequency: 'All' })}
            style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--gold)', background: 'none' }}>
            Clear all
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {filterGroups.map(({ key, options }) => (
          <div key={key}>
            <label style={{ marginBottom: 6 }}>{labels[key]}</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {options.map(opt => (
                <button key={opt} onClick={() => onChange({ ...filters, [key]: opt })}
                  style={{
                    padding: '4px 10px', borderRadius: 20,
                    fontSize: 12, fontWeight: 500,
                    background: filters[key] === opt ? 'var(--gold-glow)' : 'var(--bg-elevated)',
                    color: filters[key] === opt ? 'var(--gold)' : 'var(--text-muted)',
                    border: `1px solid ${filters[key] === opt ? 'var(--border-active)' : 'var(--border)'}`,
                    transition: 'var(--transition)',
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
