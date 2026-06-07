import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppState, Habit, FilterOptions, UserProfile } from './types';
import {
  loadState, saveState, resetState, addHabit, updateHabit, deleteHabit,
  upsertCheckIn, undoLastCheckIn, upsertGoal, deleteGoal, login, logout, updateProfile
} from './store/storage';
import { computeHabitStats, today, isHabitScheduledToday, generateId } from './utils/habitUtils';
import { Sidebar, NavTab } from './components/shared/Sidebar';
import { LoginScreen } from './components/shared/LoginScreen';
import { ProfilePage } from './components/shared/ProfilePage';
import { HabitCard } from './components/habits/HabitCard';
import { HabitForm } from './components/habits/HabitForm';
import { HabitFilter } from './components/habits/HabitFilter';
import { GoalForm } from './components/goals/GoalForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { CalendarHeatmap } from './components/dashboard/CalendarHeatmap';
import { WeeklyProgressChart } from './components/dashboard/WeeklyProgressChart';
import { ExportPage } from './components/dashboard/ExportPage';
import { SummaryMode } from './components/dashboard/SummaryMode';
import { Toast, ToastMessage } from './components/shared/Toast';
import { Button } from './components/shared/Button';
import { Plus, Search, AlertTriangle, Menu, X } from 'lucide-react';

const DEFAULT_FILTERS: FilterOptions = { category: 'All', priority: 'All', status: 'All', frequency: 'All' };

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState);
  const [tab, setTab] = useState<NavTab>('dashboard');
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [goalHabit, setGoalHabit] = useState<Habit | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    setToasts(t => [...t, { id: generateId(), type, message }]);
  }, []);
  const removeToast = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);

  // --- Auth ---
  const handleLogin = useCallback((profile: UserProfile) => {
    setState(s => login(s, profile));
    addToast('success', `Welcome back, ${profile.name || profile.email}! ✦`);
  }, [addToast]);

  const handleLogout = useCallback(() => {
    setState(s => logout(s));
    setTab('dashboard');
  }, []);

  const handleProfileUpdate = useCallback((updates: Partial<UserProfile>) => {
    setState(s => updateProfile(s, updates));
    addToast('success', 'Profile updated');
  }, [addToast]);

  // --- Habit CRUD ---
  const handleAddHabit = useCallback((data: Omit<Habit, 'id' | 'createdAt'>) => {
    setState(s => addHabit(s, data));
    addToast('success', `"${data.name}" created ✦`);
  }, [addToast]);

  const handleUpdateHabit = useCallback((id: string, data: Omit<Habit, 'id' | 'createdAt'>) => {
    setState(s => updateHabit(s, id, data));
    addToast('success', 'Habit updated');
  }, [addToast]);

  const handleDeleteHabit = useCallback((id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      setState(s => deleteHabit(s, id));
      addToast('success', `"${name}" deleted`);
    }
  }, [addToast]);

  const handleStatusChange = useCallback((id: string, status: Habit['status']) => {
    setState(s => updateHabit(s, id, { status }));
  }, []);

  // --- Check-in ---
  const handleCheckIn = useCallback((habitId: string, count: number, targetPerDay: number, habitName: string) => {
    const newState = upsertCheckIn(state, habitId, today(), count, targetPerDay);
    setState(newState);
    const ci = newState.checkIns.find(c => c.habitId === habitId && c.date === today());
    if (ci?.completionStatus === 'Completed') {
      addToast('milestone', `✨ "${habitName}" completed for today!`);
    }
    const goal = state.goals.find(g => g.habitId === habitId);
    if (goal) {
      const habit = state.habits.find(h => h.id === habitId)!;
      const stats = computeHabitStats(newState.checkIns, habit, newState.goals);
      if (stats.goalProgress === 100) addToast('milestone', `🏆 Goal achieved for "${habitName}"!`);
      else if ((stats.goalProgress ?? 0) >= 80) {
        const prevStats = computeHabitStats(state.checkIns, habit, state.goals);
        if ((prevStats.goalProgress ?? 0) < 80) addToast('warning', `80% of goal reached for "${habitName}"!`);
      }
    }
  }, [state, addToast]);

  const handleUndo = useCallback(() => {
    setState(s => undoLastCheckIn(s));
    addToast('success', 'Last check-in undone');
  }, [addToast]);

  const confirmReset = useCallback(() => {
    setState(resetState());
    setShowResetConfirm(false);
    addToast('success', 'Data reset to initial state');
  }, [addToast]);

  const handleGoalSave = useCallback((data: any) => {
    setState(s => upsertGoal(s, data));
    addToast('success', 'Goal saved');
  }, [addToast]);

  const handleGoalDelete = useCallback((habitId: string) => {
    setState(s => deleteGoal(s, habitId));
  }, []);

  // --- Filtered habits ---
  const filteredHabits = useMemo(() => state.habits.filter(h => {
    if (filters.category !== 'All' && h.category !== filters.category) return false;
    if (filters.priority !== 'All' && h.priority !== filters.priority) return false;
    if (filters.status !== 'All' && h.status !== filters.status) return false;
    if (filters.frequency !== 'All' && h.frequency !== filters.frequency) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [state.habits, filters, search]);

  const todayStr = today();
  const activeHabits = state.habits.filter(h => h.status === 'Active' && isHabitScheduledToday(h));
  const uncheckedToday = activeHabits.filter(h => {
    const ci = state.checkIns.find(c => c.habitId === h.id && c.date === todayStr);
    return !ci || ci.completionStatus !== 'Completed';
  });

  // --- Login gate ---
  if (!state.isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 90, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
      }} className="sidebar-wrapper">
        <Sidebar
          activeTab={tab}
          onTabChange={(t) => { setTab(t); setSidebarOpen(false); }}
          onUndo={handleUndo}
          onReset={() => setShowResetConfirm(true)}
          onSummary={() => setShowSummary(true)}
          canUndo={!!state.lastCheckInAction}
          profile={state.profile}
        />
      </div>

      {/* Main content */}
      <main style={{
        flex: 1, overflow: 'auto', padding: '40px 48px',
        minWidth: 0,
      }} className="main-content">

        {/* Mobile header */}
        <div className="mobile-header" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>✦</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>
              Habit Tracker Pro
            </span>
          </div>
          <button onClick={() => setSidebarOpen(s => !s)} style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}>
            <Menu size={18} />
          </button>
        </div>

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div className="animate-in">
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, letterSpacing: '0.02em' }}>
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}{state.profile.name ? `, ${state.profile.name.split(' ')[0]}` : ''} ✦
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Dashboard habits={state.habits} checkIns={state.checkIns} goals={state.goals} />
            <div style={{ marginTop: 24 }}>
              <WeeklyProgressChart habits={state.habits} checkIns={state.checkIns} />
            </div>
            <div style={{ marginTop: 24 }}>
              <CalendarHeatmap habits={state.habits} checkIns={state.checkIns} />
            </div>
          </div>
        )}

        {/* Habits */}
        {tab === 'habits' && (
          <div className="animate-in">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300 }}>My Habits</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
                  {state.habits.filter(h => h.status === 'Active').length} active · {state.habits.length} total
                </p>
              </div>
              <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowAddForm(true)}>
                New Habit
              </Button>
            </div>

            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search habits..."
                style={{ paddingLeft: 36, background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <HabitFilter filters={filters} onChange={setFilters} />
            </div>

            {filteredHabits.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {state.habits.length === 0 ? 'No habits yet' : 'No matching habits'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                  {state.habits.length === 0 ? 'Start building better habits today' : 'Try adjusting your filters'}
                </p>
                {state.habits.length === 0 && (
                  <Button variant="primary" onClick={() => setShowAddForm(true)}>Create your first habit</Button>
                )}
              </div>
            ) : (
              <div className="habit-grid">
                {filteredHabits.map(habit => {
                  const stats = computeHabitStats(state.checkIns, habit, state.goals);
                  const goal = state.goals.find(g => g.habitId === habit.id);
                  const isUnchecked = uncheckedToday.some(h => h.id === habit.id);
                  return (
                    <HabitCard
                      key={habit.id}
                      habit={habit} checkIns={state.checkIns} stats={stats} goal={goal}
                      highlight={isUnchecked}
                      onEdit={() => setEditingHabit(habit)}
                      onDelete={() => handleDeleteHabit(habit.id, habit.name)}
                      onStatusChange={s => handleStatusChange(habit.id, s)}
                      onCheckIn={count => handleCheckIn(habit.id, count, habit.targetPerDay, habit.name)}
                      onGoalClick={() => setGoalHabit(habit)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {tab === 'stats' && (
          <div className="animate-in">
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300 }}>Statistics</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>Your habit performance at a glance</p>
            </div>
            <Dashboard habits={state.habits} checkIns={state.checkIns} goals={state.goals} />
            <div style={{ marginTop: 24 }}>
              <WeeklyProgressChart habits={state.habits} checkIns={state.checkIns} />
            </div>
            <div style={{ marginTop: 24 }}>
              <CalendarHeatmap habits={state.habits} checkIns={state.checkIns} />
            </div>
          </div>
        )}

        {/* Export */}
        {tab === 'export' && (
          <div className="animate-in">
            <ExportPage state={state} />
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="animate-in">
            <ProfilePage profile={state.profile} onUpdate={handleProfileUpdate} onLogout={handleLogout} />
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddForm && (
        <HabitForm onSave={handleAddHabit} onClose={() => setShowAddForm(false)} />
      )}
      {editingHabit && (
        <HabitForm
          initial={editingHabit}
          onSave={data => { handleUpdateHabit(editingHabit.id, data); setEditingHabit(null); }}
          onClose={() => setEditingHabit(null)}
        />
      )}
      {goalHabit && (
        <GoalForm
          habit={goalHabit}
          existingGoal={state.goals.find(g => g.habitId === goalHabit.id)}
          onSave={handleGoalSave}
          onDelete={() => handleGoalDelete(goalHabit.id)}
          onClose={() => setGoalHabit(null)}
        />
      )}

      {/* Summary Mode FR20 */}
      {showSummary && (
        <SummaryMode
          habits={state.habits} checkIns={state.checkIns} goals={state.goals}
          profileName={state.profile.name || 'My'}
          onClose={() => setShowSummary(false)}
        />
      )}

      {/* Reset confirm */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(8,8,9,0.85)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: 32, maxWidth: 380, width: '90%',
            textAlign: 'center', boxShadow: 'var(--shadow-elevated)',
          }}>
            <AlertTriangle size={36} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>Reset All Data?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              This will permanently delete all habits, check-ins, and goals.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={confirmReset}>Yes, Reset Everything</Button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;
