import React, { useState } from 'react';
import type { Habit, Category, Frequency, Priority, HabitStatus } from '../../types';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

interface HabitFormProps {
  initial?: Partial<Habit>;
  onSave: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HabitForm: React.FC<HabitFormProps> = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    category: initial?.category ?? 'Health' as Category,
    frequency: initial?.frequency ?? 'Daily' as Frequency,
    specificDays: initial?.specificDays ?? [1, 2, 3, 4, 5],
    targetPerDay: initial?.targetPerDay ?? 1,
    priority: initial?.priority ?? 'Medium' as Priority,
    status: initial?.status ?? 'Active' as HabitStatus,
    reminderNote: initial?.reminderNote ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Habit name is required';
    if (form.targetPerDay < 1) e.targetPerDay = 'Target must be at least 1';
    if (form.frequency === 'Specific days' && form.specificDays.length === 0)
      e.specificDays = 'Select at least one day';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  const toggleDay = (day: number) => {
    setForm(f => ({
      ...f,
      specificDays: f.specificDays.includes(day)
        ? f.specificDays.filter(d => d !== day)
        : [...f.specificDays, day],
    }));
  };

  return (
    <Modal title={initial?.id ? 'Edit Habit' : 'New Habit'} onClose={onClose} size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Name */}
        <div>
          <label>Habit Name *</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Morning meditation..."
          />
          {errors.name && <p style={errStyle}>{errors.name}</p>}
        </div>

        {/* Category + Priority row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
              {(['Health', 'Study', 'Work', 'Mindfulness', 'Other'] as Category[]).map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
              {(['Low', 'Medium', 'High'] as Priority[]).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label>Frequency</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Daily', 'Specific days'] as Frequency[]).map(f => (
              <button key={f} onClick={() => setForm(fm => ({ ...fm, frequency: f }))}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  fontSize: 13, fontWeight: 500,
                  background: form.frequency === f ? 'var(--gold-glow)' : 'var(--bg-elevated)',
                  color: form.frequency === f ? 'var(--gold)' : 'var(--text-secondary)',
                  border: `1px solid ${form.frequency === f ? 'var(--border-active)' : 'var(--border)'}`,
                  transition: 'var(--transition)',
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Specific days */}
        {form.frequency === 'Specific days' && (
          <div>
            <label>Active Days</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {DAY_LABELS.map((d, i) => (
                <button key={i} onClick={() => toggleDay(i)}
                  style={{
                    width: 38, height: 38, borderRadius: '50%', fontSize: 11, fontWeight: 600,
                    background: form.specificDays.includes(i) ? 'var(--gold)' : 'var(--bg-elevated)',
                    color: form.specificDays.includes(i) ? '#0e0f11' : 'var(--text-muted)',
                    border: `1px solid ${form.specificDays.includes(i) ? 'var(--gold)' : 'var(--border)'}`,
                    transition: 'var(--transition)',
                  }}>
                  {d}
                </button>
              ))}
            </div>
            {errors.specificDays && <p style={errStyle}>{errors.specificDays}</p>}
          </div>
        )}

        {/* Target + Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label>Target per Day</label>
            <input type="number" min={1} value={form.targetPerDay}
              onChange={e => setForm(f => ({ ...f, targetPerDay: Math.max(1, +e.target.value) }))} />
            {errors.targetPerDay && <p style={errStyle}>{errors.targetPerDay}</p>}
          </div>
          <div>
            <label>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as HabitStatus }))}>
              {(['Active', 'Paused', 'Archived'] as HabitStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Reminder note */}
        <div>
          <label>Reminder Note (optional)</label>
          <textarea rows={2} value={form.reminderNote}
            onChange={e => setForm(f => ({ ...f, reminderNote: e.target.value }))}
            placeholder="Add a motivating note..."
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initial?.id ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const errStyle: React.CSSProperties = {
  color: 'var(--danger)', fontSize: 11, marginTop: 4,
};
