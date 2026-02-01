import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HabitStore } from './habit.store.svelte';
import * as habitService from '$lib/services/habit.service';
import type { HabitWithStats, Habit } from '$lib/data-access/types';

// Mock the service layer
vi.mock('$lib/services/habit.service', () => ({
	fetchHabits: vi.fn(),
	createHabit: vi.fn(),
	updateHabit: vi.fn(),
	deleteHabit: vi.fn(),
	toggleHabitCompletion: vi.fn()
}));

describe('HabitStore', () => {
	let store: HabitStore;

	beforeEach(() => {
		vi.clearAllMocks();
		// Silence console.error for expected error logging
		vi.spyOn(console, 'error').mockImplementation(() => {});
		store = new HabitStore();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('initializes with default values', () => {
		expect(store.habits).toEqual([]);
		expect(store.loading).toBe(false);
		expect(store.error).toBeNull();
	});

	it('loads habits successfully', async () => {
		const mockHabits: HabitWithStats[] = [
			{ id: '1', title: 'Test', streak_count: 0, completed_today: false } as HabitWithStats
		];
		vi.mocked(habitService.fetchHabits).mockResolvedValue(mockHabits);

		await store.load();

		expect(store.loading).toBe(false);
		expect(store.habits).toEqual(mockHabits);
		expect(store.error).toBeNull();
	});

	it('handles load error', async () => {
		vi.mocked(habitService.fetchHabits).mockRejectedValue(new Error('Fetch error'));

		await store.load();

		expect(store.loading).toBe(false);
		expect(store.error).toBe('Failed to load habits');
		expect(store.habits).toEqual([]);
		expect(console.error).toHaveBeenCalled();
	});

	it('adds a habit', async () => {
		const newHabit = { id: '2', title: 'New Habit' };
		vi.mocked(habitService.createHabit).mockResolvedValue(newHabit as unknown as Habit);

		await store.add('New Habit');

		expect(habitService.createHabit).toHaveBeenCalledWith('New Habit');
		expect(store.habits).toHaveLength(1);
		expect(store.habits[0].title).toBe('New Habit');
		expect(store.habits[0].streak_count).toBe(0);
	});

	it('deletes a habit', async () => {
		// Setup initial state
		store.habits = [{ id: '1', title: 'To Delete' } as HabitWithStats];

		await store.delete('1');

		expect(habitService.deleteHabit).toHaveBeenCalledWith('1');
		expect(store.habits).toHaveLength(0);
	});

	it('toggles habit completion (optimistic update)', async () => {
		// Setup
		const habit = {
			id: '1',
			title: 'Habit',
			completed_today: false,
			streak_count: 0
		} as HabitWithStats;
		store.habits = [habit];

		await store.toggle('1');

		// Expect optimistic update
		expect(store.habits[0].completed_today).toBe(true);
		expect(store.habits[0].streak_count).toBe(1);
		expect(habitService.toggleHabitCompletion).toHaveBeenCalledWith('1', expect.any(String), false);
	});

	it('reverts toggle on error', async () => {
		// Setup
		const habit = {
			id: '1',
			title: 'Habit',
			completed_today: false,
			streak_count: 0
		} as HabitWithStats;
		store.habits = [habit];

		vi.mocked(habitService.toggleHabitCompletion).mockRejectedValue(new Error('API Error'));

		try {
			await store.toggle('1');
		} catch {
			// Expected error
		}

		// Should be reverted
		expect(store.habits[0].completed_today).toBe(false);
		expect(store.habits[0].streak_count).toBe(0);
		expect(console.error).toHaveBeenCalled();
	});
});
