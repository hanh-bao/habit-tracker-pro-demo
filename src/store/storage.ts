import type { AppState, Habit, CheckIn, Goal, CompletionStatus, UserProfile } from '../types';
import { generateId } from '../utils/habitUtils';

const STORAGE_KEY = 'habit-tracker-pro-v1';

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  phone: '',
  address: '',
  avatar: '🧑',
  joinedAt: new Date().toISOString(),
};

const INITIAL_STATE: AppState = {
  isLoggedIn: false,
  profile: DEFAULT_PROFILE,
  habits: [
    {
      id: 'demo-1',
      name: 'Morning Meditation',
      category: 'Mindfulness',
      frequency: 'Daily',
      targetPerDay: 1,
      priority: 'High',
      status: 'Active',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      reminderNote: 'Just 10 minutes of calm',
    },
    {
      id: 'demo-2',
      name: 'Read 30 minutes',
      category: 'Study',
      frequency: 'Daily',
      targetPerDay: 1,
      priority: 'Medium',
      status: 'Active',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'demo-3',
      name: 'Exercise',
      category: 'Health',
      frequency: 'Specific days',
      specificDays: [1, 3, 5],
      targetPerDay: 1,
      priority: 'High',
      status: 'Active',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: 'demo-4',
      name: 'Deep Work Session',
      category: 'Work',
      frequency: 'Daily',
      targetPerDay: 2,
      priority: 'High',
      status: 'Active',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      reminderNote: 'No distractions!',
    },
  ],
  checkIns: (() => {
    const entries: CheckIn[] = [];
    const habitIds = ['demo-1', 'demo-2', 'demo-3', 'demo-4'];
    // Seed 14 days of realistic check-ins
    for (let d = 13; d >= 0; d--) {
      const date = new Date(Date.now() - d * 86400000);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      habitIds.forEach((hId, i) => {
        const roll = Math.random();
        const completed = roll > (i === 2 ? 0.4 : 0.25);
        entries.push({
          id: generateId(),
          habitId: hId,
          date: dateStr,
          completedCount: completed ? (hId === 'demo-4' ? 2 : 1) : (roll > 0.5 ? 1 : 0),
          completionStatus: completed ? 'Completed' : roll > 0.5 ? 'In Progress' : 'Not Started',
        });
      });
    }
    return entries;
  })(),
  goals: [
    { id: 'goal-1', habitId: 'demo-1', type: 'Streak', target: 21, createdAt: new Date().toISOString() },
    { id: 'goal-2', habitId: 'demo-2', type: 'Total', target: 30, createdAt: new Date().toISOString() },
    { id: 'goal-3', habitId: 'demo-3', type: 'Streak', target: 14, createdAt: new Date().toISOString() },
  ],
  lastCheckInAction: null,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as AppState;
    // Ensure profile exists on old saves
    if (!parsed.profile) parsed.profile = DEFAULT_PROFILE;
    if (parsed.isLoggedIn === undefined) parsed.isLoggedIn = false;
    return parsed;
  } catch {
    return INITIAL_STATE;
  }
}

export function saveState(state: AppState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function resetState(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  return INITIAL_STATE;
}

// Auth
export function login(state: AppState, profile: UserProfile): AppState {
  return { ...state, isLoggedIn: true, profile };
}

export function logout(state: AppState): AppState {
  return { ...state, isLoggedIn: false };
}

export function updateProfile(state: AppState, updates: Partial<UserProfile>): AppState {
  return { ...state, profile: { ...state.profile, ...updates } };
}

// Habit CRUD
export function addHabit(state: AppState, habit: Omit<Habit, 'id' | 'createdAt'>): AppState {
  const newHabit: Habit = { ...habit, id: generateId(), createdAt: new Date().toISOString() };
  return { ...state, habits: [...state.habits, newHabit] };
}

export function updateHabit(state: AppState, id: string, updates: Partial<Habit>): AppState {
  return { ...state, habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h) };
}

export function deleteHabit(state: AppState, id: string): AppState {
  return {
    ...state,
    habits: state.habits.filter(h => h.id !== id),
    checkIns: state.checkIns.filter(c => c.habitId !== id),
    goals: state.goals.filter(g => g.habitId !== id),
  };
}

// Check-in
export function upsertCheckIn(state: AppState, habitId: string, date: string, newCount: number, targetPerDay: number): AppState {
  const clampedCount = Math.max(0, Math.min(newCount, targetPerDay));
  const status: CompletionStatus =
    clampedCount === 0 ? 'Not Started' : clampedCount >= targetPerDay ? 'Completed' : 'In Progress';
  const existing = state.checkIns.find(c => c.habitId === habitId && c.date === date);
  if (existing) {
    const lastAction = { checkInId: existing.id, previousCount: existing.completedCount };
    return {
      ...state,
      checkIns: state.checkIns.map(c =>
        c.id === existing.id ? { ...c, completedCount: clampedCount, completionStatus: status } : c
      ),
      lastCheckInAction: lastAction,
    };
  }
  const newCI: CheckIn = { id: generateId(), habitId, date, completedCount: clampedCount, completionStatus: status };
  return { ...state, checkIns: [...state.checkIns, newCI], lastCheckInAction: { checkInId: newCI.id, previousCount: 0 } };
}

export function undoLastCheckIn(state: AppState): AppState {
  if (!state.lastCheckInAction) return state;
  const { checkInId, previousCount } = state.lastCheckInAction;
  const ci = state.checkIns.find(c => c.id === checkInId);
  if (!ci) return state;
  const habit = state.habits.find(h => h.id === ci.habitId);
  const targetPerDay = habit?.targetPerDay ?? 1;
  const status: CompletionStatus =
    previousCount === 0 ? 'Not Started' : previousCount >= targetPerDay ? 'Completed' : 'In Progress';
  return {
    ...state,
    checkIns: state.checkIns.map(c =>
      c.id === checkInId ? { ...c, completedCount: previousCount, completionStatus: status } : c
    ),
    lastCheckInAction: null,
  };
}

// Goals
export function upsertGoal(state: AppState, goal: Omit<Goal, 'id' | 'createdAt'>): AppState {
  const existing = state.goals.find(g => g.habitId === goal.habitId);
  if (existing) return { ...state, goals: state.goals.map(g => g.id === existing.id ? { ...g, ...goal } : g) };
  return { ...state, goals: [...state.goals, { ...goal, id: generateId(), createdAt: new Date().toISOString() }] };
}

export function deleteGoal(state: AppState, habitId: string): AppState {
  return { ...state, goals: state.goals.filter(g => g.habitId !== habitId) };
}
