export type Category = 'Health' | 'Study' | 'Work' | 'Mindfulness' | 'Other';
export type Frequency = 'Daily' | 'Specific days';
export type Priority = 'Low' | 'Medium' | 'High';
export type HabitStatus = 'Active' | 'Paused' | 'Archived';
export type CompletionStatus = 'Not Started' | 'In Progress' | 'Completed';
export type GoalType = 'Streak' | 'Total';

export interface Habit {
  id: string;
  name: string;
  category: Category;
  frequency: Frequency;
  specificDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  targetPerDay: number;
  priority: Priority;
  status: HabitStatus;
  createdAt: string;
  reminderNote?: string;
  icon?: string;
}

export interface CheckIn {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedCount: number;
  completionStatus: CompletionStatus;
}

export interface Goal {
  id: string;
  habitId: string;
  type: GoalType;
  target: number;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string; // emoji or initials
  joinedAt: string;
}

export interface AppState {
  habits: Habit[];
  checkIns: CheckIn[];
  goals: Goal[];
  profile: UserProfile;
  lastCheckInAction?: { checkInId: string; previousCount: number } | null;
  isLoggedIn: boolean;
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRateLast7Days: number;
  goalProgress?: number;
}

export type FilterOptions = {
  category: Category | 'All';
  frequency: Frequency | 'All';
  priority: Priority | 'All';
  status: HabitStatus | 'All';
};
