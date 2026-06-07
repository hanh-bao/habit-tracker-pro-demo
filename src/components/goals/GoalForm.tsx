import React, { useState } from 'react';
import { Goal, GoalType, Habit } from '../../types';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

interface GoalFormProps {
  habit: Habit;
  existingGoal?: Goal;
  onSave: (data: Omit<Goal, 'id' | 'createdAt'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ habit, existingGoal, onSave, onDelete, onClose }) => {
  const [type, setType] = useState<GoalType>(existingGoal?.type ?? 'Streak');
  const [target, setTarget] = useState(existingGoal?.target ?? 21);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (target < 1) { setError('Target must be at least 1'); return; }
    onSave({ habitId: habit.id, type, target });
    onClose();
  };

  return (
    <Modal title={`Goal for "${habit.name}"`} onClose={onClose} size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label>Goal Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Streak', 'Total'] as GoalType[]).map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
                fontSize: 13, fontWeight: 500,
                background: type === t ? 'var(--gold-glow)' : 'var(--bg-elevated)',
                color: type === t ? 'var(--gold)' : 'var(--text-secondary)',
                border: `1px solid ${type === t ? 'var(--border-active)' : 'var(--border)'}`,
                transition: 'var(--transition)',
              }}>
                {t === 'Streak' ? '🔥 Streak Days' : '✅ Total Sessions'}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            {type === 'Streak'
              ? 'Complete this habit for N consecutive days'
              : 'Complete this habit a total of N times'}
          </p>
        </div>

        <div>
          <label>Target ({type === 'Streak' ? 'days' : 'sessions'})</label>
          <input type="number" min={1} value={target}
            onChange={e => { setTarget(Math.max(1, +e.target.value)); setError(''); }} />
          {error && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{error}</p>}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', paddingTop: 4 }}>
          <div>
            {existingGoal && onDelete && (
              <Button variant="danger" size="sm" onClick={() => { onDelete(); onClose(); }}>Remove Goal</Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Goal</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
