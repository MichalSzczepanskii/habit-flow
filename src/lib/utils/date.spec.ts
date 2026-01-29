import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	getLogicalDate,
	formatLogicalDate,
	getDateLabel,
	isYesterday,
	formatDateForDisplay
} from './date';

describe('Date Utilities', () => {
	beforeEach(() => {
		// Enable fake timers to strictly control "now"
		vi.useFakeTimers();
	});

	afterEach(() => {
		// Restore real timers after each test to avoid polluting other tests
		vi.useRealTimers();
	});

	describe('getLogicalDate', () => {
		it('returns the current date when the time is after 3 AM (Day shift start)', () => {
			// Arrange: Set time to 3:00 AM on May 10, 2023
			const mockNow = new Date('2023-05-10T03:00:00');
			vi.setSystemTime(mockNow);

			// Act
			const result = getLogicalDate();

			// Assert
			expect(result.getDate()).toBe(10);
			expect(formatLogicalDate(result)).toBe('2023-05-10');
		});

		it('returns the current date when the time is well into the day (2 PM)', () => {
			// Arrange: Set time to 2:00 PM on May 10, 2023
			const mockNow = new Date('2023-05-10T14:00:00');
			vi.setSystemTime(mockNow);

			// Act
			const result = getLogicalDate();

			// Assert
			expect(result.getDate()).toBe(10);
			expect(formatLogicalDate(result)).toBe('2023-05-10');
		});

		it('returns the previous date when the time is before 3 AM (Late night)', () => {
			// Arrange: Set time to 2:59 AM on May 10, 2023
			// Ideally, this counts as "May 9th" logically
			const mockNow = new Date('2023-05-10T02:59:59');
			vi.setSystemTime(mockNow);

			// Act
			const result = getLogicalDate();

			// Assert
			expect(result.getDate()).toBe(9);
			expect(formatLogicalDate(result)).toBe('2023-05-09');
		});

		it('handles month/year rollovers correctly (New Year early morning)', () => {
			// Arrange: Set time to 1 AM on Jan 1, 2024
			// Should be Dec 31, 2023 logically
			const mockNow = new Date('2024-01-01T01:00:00');
			vi.setSystemTime(mockNow);

			// Act
			const result = getLogicalDate();

			// Assert
			expect(formatLogicalDate(result)).toBe('2023-12-31');
		});
	});

	describe('formatLogicalDate', () => {
		it('formats dates as YYYY-MM-DD with zero padding', () => {
			// Arrange
			const date = new Date('2023-01-05T10:00:00');

			// Act
			const result = formatLogicalDate(date);

			// Assert
			expect(result).toMatchInlineSnapshot(`"2023-01-05"`);
		});

		it('formats dates correctly for double digit months/days', () => {
			// Arrange
			const date = new Date('2023-11-25T10:00:00');

			// Act
			const result = formatLogicalDate(date);

			// Assert
			expect(result).toMatchInlineSnapshot(`"2023-11-25"`);
		});
	});

	describe('getDateLabel', () => {
		it('returns "Today" when the logical date matches the calendar date', () => {
			// Arrange: Real time is May 15, 10 AM
			vi.setSystemTime(new Date('2023-05-15T10:00:00'));
			const logicalDate = new Date('2023-05-15T00:00:00');

			// Act
			const label = getDateLabel(logicalDate);

			// Assert
			expect(label).toMatchInlineSnapshot(`"Today"`);
		});

		it('returns "Yesterday" when the logical date is one day prior to calendar date', () => {
			// Arrange: Real time is May 15, 10 AM
			vi.setSystemTime(new Date('2023-05-15T10:00:00'));
			const logicalDate = new Date('2023-05-14T00:00:00');

			// Act
			const label = getDateLabel(logicalDate);

			// Assert
			expect(label).toMatchInlineSnapshot(`"Yesterday"`);
		});

		it('returns formatted date for older dates', () => {
			// Arrange: Real time is May 15
			vi.setSystemTime(new Date('2023-05-15T10:00:00'));
			const logicalDate = new Date('2023-05-10T00:00:00'); // 5 days ago

			// Act
			const label = getDateLabel(logicalDate);

			// Assert
			// Note: The specific output depends on Intl.DateTimeFormat (locale en-US)
			// expected: "Wed, May 10"
			expect(label).toMatchInlineSnapshot(`"Wed, May 10"`);
		});

		it('considers date equality regardless of time', () => {
			// Arrange: Real time is May 15, 10 AM
			vi.setSystemTime(new Date('2023-05-15T10:00:00'));
			// Logical date input has a time component that shouldn't matter for the label logic
			const logicalDate = new Date('2023-05-15T23:00:00');

			// Act
			const label = getDateLabel(logicalDate);

			// Assert
			expect(label).toBe('Today');
		});
	});

	describe('isYesterday', () => {
		it('returns true if the checked date is exactly one day before "now"', () => {
			// Arrange
			vi.setSystemTime(new Date('2023-06-20T12:00:00'));
			const checkDate = new Date('2023-06-19T10:00:00');

			// Act
			const result = isYesterday(checkDate);

			// Assert
			expect(result).toBe(true);
		});

		it('returns false for today', () => {
			// Arrange
			vi.setSystemTime(new Date('2023-06-20T12:00:00'));
			const checkDate = new Date('2023-06-20T08:00:00');

			// Act
			const result = isYesterday(checkDate);

			// Assert
			expect(result).toBe(false);
		});

		it('returns false for two days ago', () => {
			// Arrange
			vi.setSystemTime(new Date('2023-06-20T12:00:00'));
			const checkDate = new Date('2023-06-18T12:00:00');

			// Act
			const result = isYesterday(checkDate);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe('formatDateForDisplay', () => {
		it('formats date using short weekday, short month, and numeric day', () => {
			// Arrange
			const date = new Date('2023-12-25T00:00:00');

			// Act
			const result = formatDateForDisplay(date);

			// Assert
			expect(result).toMatchInlineSnapshot(`"Mon, Dec 25"`);
		});
	});
});
