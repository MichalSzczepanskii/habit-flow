import type { Habit, HabitWithStats } from '$lib/data-access/types';

/**
 * Service for interacting with the Habits API.
 * Stateless functions that handle HTTP requests.
 */

export async function fetchHabits(date: string): Promise<HabitWithStats[]> {
	const response = await fetch(`/rest/v1/habits?target_date=${date}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch habits: ${response.statusText}`);
	}
	return response.json();
}

export async function createHabit(title: string): Promise<Habit> {
	const response = await fetch('/rest/v1/habits', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ title })
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.message || 'Failed to create habit');
	}
	return response.json();
}

export async function updateHabit(id: string, title: string): Promise<void> {
	const response = await fetch(`/rest/v1/habits?id=eq.${id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ title })
	});

	if (!response.ok) {
		throw new Error('Failed to update habit');
	}
}

export async function deleteHabit(id: string): Promise<void> {
	const response = await fetch(`/rest/v1/habits?id=eq.${id}`, {
		method: 'DELETE'
	});

	if (!response.ok) {
		throw new Error('Failed to delete habit');
	}
}

export async function toggleHabitCompletion(
	id: string,
	date: string,
	wasCompleted: boolean
): Promise<void> {
	const method = wasCompleted ? 'DELETE' : 'POST';
	let url = '/rest/v1/habit_completions';
	let body = undefined;
	let headers = undefined;

	if (method === 'POST') {
		body = JSON.stringify({
			habit_id: id,
			completed_date: date
		});
		headers = { 'Content-Type': 'application/json' };
	} else {
		// DELETE requires query params
		url += `?habit_id=${id}&completed_date=${date}`;
	}

	const response = await fetch(url, { method, headers, body });

	// Handle success or specific acceptable error codes
	if (response.ok || (method === 'POST' && response.status === 409)) {
		return;
	}

	// Handle 404 for undoing non-existent (treat as success)
	if (method === 'DELETE' && response.status === 404) {
		return;
	}

	throw new Error('Failed to update status');
}
