# View Implementation Plan `Dashboard View` (List Only)

## 1. Overview

The Dashboard View is the core interface of HabitFlow. This implementation phase focuses solely on **displaying the list of habits** for the current "Logical Date". It handles data fetching, completion streak display, and visual progress tracking in a read-only manner (no creation, editing, or completion toggling in this step).

## 2. View Routing

- **Route Path:** `/dashboard` (served via `src/routes/(app)/dashboard/+page.svelte`)
- **Parent Layout:** `src/routes/(app)/+layout.svelte` (Provides the Top Navigation).

## 3. Component Structure

The view is composed of the following hierarchy:

```
Dashboard (+page.svelte)
├── ClientDayTimer (Logic/State Controller)
├── DateHeader
├── DailyProgressBar
├── Content Area (Conditional)
│   ├── HabitList
│   │   └── HabitCard
│   │       └── StatusIndicator (Visual Only)
│   └── EmptyStateHero
```

## 4. Component Details

### `Dashboard` (Page Controller)

- **Description:** The orchestrator component. It calculates the `logicalDate` and fetches habit data.
- **Main Elements:** Container `div` with responsive padding.
- **Handled Interactions:**
  - `onMount`: Calculates initial logical date and fetches habits.
  - Auto-refresh when `ClientDayTimer` signals a day change.
- **Types:** `HabitWithStats[]`.

### `DateHeader`

- **Description:** Displays the current logical date to reassure users about the 3 AM rule.
- **Main Elements:** `h1` for "Today/Yesterday", `p` for full date (e.g., "Mon, Jan 25").
- **Props:** `date: Date`.

### `DailyProgressBar`

- **Description:** A visual progress bar showing daily completion statistics.
- **Main Elements:** `progress` element (DaisyUI), text label for percentage.
- **Props:** `total: number`, `completed: number`.
- **Logic:** Calculates percentage (`(completed / total) * 100`).

### `HabitList`

- **Description:** A vertical stack container for habits.
- **Main Elements:** `ul` or `div` flex-col.
- **Props:** `habits: HabitWithStats[]`.

### `HabitCard`

- **Description:** Displays a single habit's status.
- **Main Elements:**
  - **Visual Status:** Distinct styles for completed vs. incomplete (e.g., dim vs. bright, checkmark icon presence).
  - **Content:** Habit Title, Streak Badge (Fire icon + count).
- **Props:** `habit: HabitWithStats`.
- **Events:** None (Read-only for this phase).

### `EmptyStateHero`

- **Description:** Illustration and text shown when the habit list is empty.
- **Main Elements:** SVG Illustration, "No habits found" text.
- **Events:** None.

### `ClientDayTimer`

- **Description:** A renderless component (or logic hook) that monitors the system time.
- **Logic:** Checks every minute. If the "logical date" (date adjusted for 3 AM) changes, it emits a signal to refresh the data.

## 5. Types

The view relies on types defined in `src/lib/data-access/types.ts`.

### **ViewModel: `HabitWithStats`**

Used for rendering the list.

```typescript
{
	id: string;
	title: string;
	created_at: string;
	streak_count: number; // Current streak
	completed_today: boolean; // Computed for target_date
}
```

## 6. State Management

State will be managed using **Svelte 5 Runes** within `+page.svelte`:

- **`habits`**: `$state<HabitWithStats[]>([])` - The source of truth for the UI.
- **`logicalDate`**: `$state<string>` - The current date string (YYYY-MM-DD) calculated by the client.
- **`isLoading`**: `$state<boolean>(true)` - Controls Skeleton visibility.
- **Derived State**:
  - **`progress`**: `$derived(...)` - Calculates `{ total, completed, percent }` based on `habits`.

## 7. API Integration

The view interacts with `src/routes/rest/v1/habits/+server.ts`.

### **Fetch Habits**

- **Request:** `GET /rest/v1/habits?target_date={logicalDate}`
- **Response:** `200 OK` with `HabitWithStats[]`.

## 8. User Interactions

1.  **Initial Load:**
    - App calculates `logicalDate` (if Time < 03:00, use Yesterday).
    - Shows Skeletons.
    - Fetches habits for that date.
2.  **Date Change (3 AM):**
    - If user leaves app open past 3 AM, `ClientDayTimer` triggers a refresh.
    - `logicalDate` updates.
    - New data is fetched.

## 9. Conditions and Validation

- **3 AM Rule:** The `logicalDate` must be calculated strictly on the client side using `new Date()`.

## 10. Error Handling

- **Network Errors:** Display a `Toast` notification (red) or a localized error message.
- **Auth Errors:** If API returns 401, redirect to `/login` (handled globally or via `goto`).
- **Empty Data:** Handled by `EmptyStateHero`.

## 11. Implementation Steps

1.  **Utilities:** Create `src/lib/utils/date.ts` with `getLogicalDate()` function (implementing the 3 AM logic).
2.  **Components (UI):** Implement `HabitCard.svelte` (display only), `DailyProgressBar.svelte`, and `DateHeader.svelte`.
3.  **Components (State):** Implement `EmptyStateHero.svelte`.
4.  **Page Logic:** Implement `src/routes/(app)/dashboard/+page.svelte`.
    - Initialize `logicalDate` state.
    - Implement `fetchHabits` function calling `GET /rest/v1/habits`.
    - Use `onMount` to trigger the initial fetch.
5.  **Refinement:** Add `ClientDayTimer` logic to auto-refresh the list if the logical date changes while viewing.
6.  **Styles:** Apply Tailwind/DaisyUI classes for a polished look.
