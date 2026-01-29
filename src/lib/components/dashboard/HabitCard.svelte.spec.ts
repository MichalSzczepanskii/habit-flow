/**
 * @vitest-environment jsdom
 */
import { render, fireEvent, screen, cleanup } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import HabitCard from './HabitCard.svelte';
import type { HabitWithStats } from '$lib/data-access/types';

describe('HabitCard.svelte', () => {
	afterEach(() => {
		cleanup();
	});

	const mockHabit: HabitWithStats = {
		id: 'test-habit-id',
		title: 'Drink Water',
		created_at: '2023-01-01T00:00:00Z',
		streak_count: 5,
		completed_today: false
	};

	it('renders habit title correctly', () => {
		render(HabitCard, {
			habit: mockHabit,
			onToggle: vi.fn(),
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(screen.getByText('Drink Water')).toBeInTheDocument();
	});

	it('displays streak badge when streak > 0', () => {
		render(HabitCard, {
			habit: { ...mockHabit, streak_count: 5 },
			onToggle: vi.fn(),
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(screen.getByText('5')).toBeInTheDocument();
	});

	it('hides streak badge when streak is 0', () => {
		render(HabitCard, {
			habit: { ...mockHabit, streak_count: 0 },
			onToggle: vi.fn(),
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(screen.queryByText('0')).not.toBeInTheDocument();
	});

	it('applies completed styles when habit is completed', () => {
		render(HabitCard, {
			habit: { ...mockHabit, completed_today: true },
			onToggle: vi.fn(),
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		const card = screen.getByText('Drink Water').closest('.card');
		expect(card).toHaveClass('bg-emerald-500');
		expect(card).toHaveClass('text-white');
	});

	it('calls onToggle when main button is clicked', async () => {
		const onToggle = vi.fn().mockResolvedValue(undefined);
		render(HabitCard, {
			habit: mockHabit,
			onToggle,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		const toggleButton = screen.getByLabelText('Mark Drink Water as complete');
		await fireEvent.click(toggleButton);

		expect(onToggle).toHaveBeenCalledWith('test-habit-id');
	});

	it('shows loading spinner while toggling', async () => {
		// Mock a slow toggle function
		const onToggle = vi
			.fn()
			.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
		render(HabitCard, {
			habit: mockHabit,
			onToggle,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		const toggleButton = screen.getByLabelText('Mark Drink Water as complete');
		await fireEvent.click(toggleButton);

		// Spinner should be visible immediately after click
		// Note: The specific spinner class 'loading-spinner' is used in the component
		// We can look for the spinner element by class or existence
		const spinner = toggleButton.querySelector('.loading-spinner');
		expect(spinner).toBeInTheDocument();
	});

	it('prevents multiple clicks while toggling', async () => {
		const onToggle = vi
			.fn()
			.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
		render(HabitCard, {
			habit: mockHabit,
			onToggle,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		const toggleButton = screen.getByLabelText('Mark Drink Water as complete');
		await fireEvent.click(toggleButton);
		await fireEvent.click(toggleButton);

		expect(onToggle).toHaveBeenCalledTimes(1);
	});

	it('calls onedit when rename option is clicked', async () => {
		const onedit = vi.fn();
		render(HabitCard, {
			habit: mockHabit,
			onToggle: vi.fn(),
			onedit,
			ondelete: vi.fn()
		});

		// Find the rename button (might need to traverse dropdown or find by text)
		// The dropdown structure might hide it, but usually standard clicks work in JSDOM unless display:none prevents it.
		// Svelte dropdowns often just toggle visibility classes.
		const renameButton = screen.getByRole('button', { name: /rename/i });
		await fireEvent.click(renameButton);

		expect(onedit).toHaveBeenCalledWith(mockHabit);
	});

	it('calls ondelete when delete option is clicked', async () => {
		const ondelete = vi.fn();
		render(HabitCard, {
			habit: mockHabit,
			onToggle: vi.fn(),
			onedit: vi.fn(),
			ondelete
		});

		const deleteButton = screen.getByRole('button', { name: /delete/i });
		await fireEvent.click(deleteButton);

		expect(ondelete).toHaveBeenCalledWith('test-habit-id');
	});

	it('displays correct aria-label for accessibility based on state', () => {
		const { rerender } = render(HabitCard, {
			habit: { ...mockHabit, completed_today: false },
			onToggle: vi.fn(),
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(screen.getByLabelText('Mark Drink Water as complete')).toBeInTheDocument();

		rerender({
			habit: { ...mockHabit, completed_today: true },
			onToggle: vi.fn(),
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(screen.getByLabelText('Mark Drink Water as incomplete')).toBeInTheDocument();
	});
});
