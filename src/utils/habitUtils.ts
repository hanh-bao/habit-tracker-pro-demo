import { format, subDays, isToday, parseISO, isBefore, startOfDay } from 'date-fns';
import type { CheckIn, Habit, Goal, HabitStats } from '../types';

export const today = () => format(new Date(), 'yyyy-MM-dd');

export function getCheckInForDate(checkIns: CheckIn[], habitId: string, date: string): CheckIn | undefined {
  return checkIns.find(c => c.habitId === habitId && c.date === date);
}

export function computeCurrentStreak(checkIns: CheckIn[], habit: Habit): number {
  const habitCheckins = checkIns.filter(c => c.habitId === habit.id && c.completionStatus === 'Completed');
  const checkinDates = new Set(habitCheckins.map(c => c.date));

  let streak = 0;
  let cursor = new Date();

  while (true) {
    const dateStr = format(cursor, 'yyyy-MM-dd');
    if (!checkinDates.has(dateStr)) {
      // Allow today to not count yet
      if (isToday(cursor) && streak === 0) {
        cursor = subDays(cursor, 1);
        continue;
      }
      break;
    }
    streak++;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function computeLongestStreak(checkIns: CheckIn[], habitId: string): number {
  const habitCheckins = checkIns
    .filter(c => c.habitId === habitId && c.completionStatus === 'Completed')
    .map(c => c.date)
    .sort();

  if (habitCheckins.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < habitCheckins.length; i++) {
    const prev = parseISO(habitCheckins[i - 1]);
    const curr = parseISO(habitCheckins[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return longest;
}

export function computeTotalCompletions(checkIns: CheckIn[], habitId: string): number {
  return checkIns
    .filter(c => c.habitId === habitId && c.completionStatus === 'Completed')
    .length;
}

export function computeCompletionRateLast7Days(checkIns: CheckIn[], habit: Habit): number {
  const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
  const completed = last7.filter(date => {
    const ci = checkIns.find(c => c.habitId === habit.id && c.date === date);
    return ci?.completionStatus === 'Completed';
  });
  return Math.round((completed.length / 7) * 100);
}

export function computeGoalProgress(checkIns: CheckIn[], habit: Habit, goal: Goal): number {
  if (goal.type === 'Streak') {
    const current = computeCurrentStreak(checkIns, habit);
    return Math.min(Math.round((current / goal.target) * 100), 100);
  } else {
    const total = computeTotalCompletions(checkIns, habit.id);
    return Math.min(Math.round((total / goal.target) * 100), 100);
  }
}

export function computeHabitStats(checkIns: CheckIn[], habit: Habit, goals: Goal[]): HabitStats {
  const goal = goals.find(g => g.habitId === habit.id);
  const goalProgress = goal ? computeGoalProgress(checkIns, habit, goal) : undefined;

  return {
    habitId: habit.id,
    currentStreak: computeCurrentStreak(checkIns, habit),
    longestStreak: computeLongestStreak(checkIns, habit.id),
    totalCompletions: computeTotalCompletions(checkIns, habit.id),
    completionRateLast7Days: computeCompletionRateLast7Days(checkIns, habit),
    goalProgress,
  };
}

export function isHabitScheduledToday(habit: Habit): boolean {
  if (habit.frequency === 'Daily') return true;
  const dayOfWeek = new Date().getDay();
  return habit.specificDays?.includes(dayOfWeek) ?? false;
}

export function isFutureDate(dateStr: string): boolean {
  const date = startOfDay(parseISO(dateStr));
  const todayStart = startOfDay(new Date());
  return isBefore(todayStart, date);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export const CATEGORY_COLORS: Record<string, string> = {
  Health: '#4ade80',
  Study: '#60a5fa',
  Work: '#f59e0b',
  Mindfulness: '#c084fc',
  Other: '#94a3b8',
};

export const CATEGORY_ICONS: Record<string, string> = {
  Health: '💪',
  Study: '📚',
  Work: '💼',
  Mindfulness: '🧘',
  Other: '⭐',
};

export const PRIORITY_COLORS: Record<string, string> = {
  Low: '#94a3b8',
  Medium: '#f59e0b',
  High: '#ef4444',
};
