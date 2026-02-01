import { getLogicalDate, formatLogicalDate } from '$lib/utils/date';
import type { HabitWithStats } from '$lib/data-access/types';
import * as habitService from '$lib/services/habit.service';

export class HabitStore {
	// State using runes
	habits = $state<HabitWithStats[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	logicalDate = $state<Date>(getLogicalDate());

	// Derived state
	dateString = $derived(formatLogicalDate(this.logicalDate));
	progress = $derived.by(() => {
		const total = this.habits.length;
		const completed = this.habits.filter((h) => h.completed_today).length;
		return { total, completed };
	});

	constructor() {
		// Initialize
	}

	async load() {
		this.loading = true;
		this.error = null;
		try {
			this.habits = await habitService.fetchHabits(this.dateString);
		} catch (e) {
			console.error('Error fetching habits', e);
			this.error = 'Failed to load habits';
		} finally {
			this.loading = false;
		}
	}

	async add(title: string) {
		// We don't set loading globally for add to keep UI responsive,
		// but the modal might handle its own loading state.
		// However, the store action should probably return the promise.
		try {
			const newHabit = await habitService.createHabit(title);
			// Adapt to HabitWithStats
			const habitWithStats: HabitWithStats = {
				...newHabit,
				streak_count: 0,
				completed_today: false
			} as unknown as HabitWithStats;

			this.habits = [...this.habits, habitWithStats];
		} catch (e) {
			console.error('Error creating habit', e);
			throw e; // Re-throw so component can handle it
		}
	}

	async update(id: string, title: string) {
		try {
			await habitService.updateHabit(id, title);
			// Optimistic update
			const habit = this.habits.find((h) => h.id === id);
			if (habit) {
				habit.title = title;
			}
		} catch (e) {
			console.error('Error updating habit', e);
			throw e;
		}
	}

	async delete(id: string) {
		try {
			await habitService.deleteHabit(id);
			this.habits = this.habits.filter((h) => h.id !== id);
		} catch (e) {
			console.error('Error deleting habit', e);
			throw e;
		}
	}

	async toggle(id: string) {
		const habit = this.habits.find((h) => h.id === id);
		if (!habit) return;

		const wasCompleted = habit.completed_today;

		// Optimistic update immediately for UI responsiveness
		habit.completed_today = !wasCompleted;
		if (!wasCompleted) {
			habit.streak_count += 1;
		} else {
			habit.streak_count = Math.max(0, habit.streak_count - 1);
		}

		try {
			await habitService.toggleHabitCompletion(id, this.dateString, wasCompleted);
		} catch (e) {
			console.error('Error toggling habit', e);
			// Revert on error
			habit.completed_today = wasCompleted;
			// Revert streak
			if (!wasCompleted) {
				habit.streak_count = Math.max(0, habit.streak_count - 1);
			} else {
				habit.streak_count += 1; // Assuming we knew previous streak, simplified logic here
				// Ideally we might reload or fetch the specific habit to be sure
			}
			throw e;
		}
	}

	setDate(date: Date) {
		this.logicalDate = date;
		this.load();
	}
}
