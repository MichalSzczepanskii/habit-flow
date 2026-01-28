# View Implementation Plan: Habit Completion (Dashboard Interaction)

## 1. Overview

This implementation plan covers the **Habit Completion ("Check-in")** functionality within the **Dashboard View**. It details the user interaction for marking a habit as complete or incomplete, the visual feedback "Visual Void" strategy (shifting from neutral to vibrant colors), and the integration with the `habit_completions` API endpoints.

## 2. View Routing

- **Route:** `/dashboard` (Existing path)
- **File:** `src/routes/(app)/dashboard/+page.svelte`
- **Context:** This feature is an enhancement to the existing Dashboard view, adding interactivity to the `HabitList` and `HabitCard` components.

## 3. Component Structure

The hierarchy remains consistent with the Dashboard plan, with updates to specific components to support interactivity.

```
Dashboard (+page.svelte) [Controller]
└── HabitList
    └── HabitCard [Interactive]
        └── CompletionButton (Checkbox/Button with Spinner)
```

## 4. Component Details

### `Dashboard` (Controller)

- **Description:** Manages the list of habits and handles the business logic for toggling completion status.
- **New Handlers:**
  - `handleToggleCompletion(habitId: string, isCompleted: boolean)`: Async function passed down to children.
- **State Logic:**
  - Upon successful API response, it updates the specific habit in the `$state` array:
    - Toggles `completed_today`.
    - Adjusts `streak_count` (+1 if completing, -1 if undoing).

### `HabitCard`

- **Description:** Displays habit details and provides the check-in interaction. Implements the "Visual Void" design strategy.
- **Props:**
  - `habit: HabitWithStats` (Required)
  - `onToggle: (id: string) -> Promise<void>` (Required)
- **Internal State:**
  - `isToggling`: `$state<boolean>` - Controls the loading spinner state during API requests.
- **Visual Styles (DaisyUI/Tailwind):**
  - **Incomplete State:** `bg-base-200`, `text-base-content` (Neutral/Desaturated).
  - **Complete State:** `bg-emerald-500`, `text-white` (Vibrant).
  - **Transition:** `transition-colors duration-300` for smooth feedback.
- **Elements:**
  - **Container:** Applies conditional background color classes based on `habit.completed_today`.
  - **Action Button:**
    - **Icon:** Checkmark (if complete) or Empty Circle (if incomplete).
    - **Loading:** Replaces icon with `loading loading-spinner` when `isToggling` is true.
    - **Accessibility:** `aria-label="Mark {habit.title} as complete"`.

## 5. Types

Uses existing types from `src/lib/data-access/types.ts`.

### **Updated Component Interfaces**

**`HabitCardProps`**

```typescript
interface Props {
	habit: HabitWithStats;
	onToggle: (habitId: string) => Promise<void>;
}
```

## 6. State Management

State is managed in `src/routes/(app)/dashboard/+page.svelte` using Svelte 5 Runes.

- **Immutable Updates:** When a habit is toggled, the `habits` array is updated to trigger reactivity.
- **Optimistic vs. Confirmed UI:**
  - The plan follows a **Confirmed UI** pattern (per PRD):
    1. User clicks -> Button shows spinner (`isToggling = true`).
    2. API Request is made.
    3. On Success -> Spinner stops, Global `habits` state updates (Color change, Streak update).
    4. On Error -> Spinner stops, Toast error appears, State remains unchanged.

## 7. API Integration

### **Mark Complete**

- **Endpoint:** `POST /rest/v1/habit_completions`
- **Payload:**
  ```json
  {
  	"habit_id": "uuid",
  	"completed_date": "YYYY-MM-DD" // Must match the current logicalDate
  }
  ```
- **Response:** `201 Created`

### **Undo Completion**

- **Endpoint:** `DELETE /rest/v1/habit_completions`
- **Query Params:** `?habit_id=uuid&completed_date=YYYY-MM-DD`
- **Response:** `204 No Content`

## 8. User Interactions

1.  **Check-in (Complete):**
    - User clicks the "Check" button on a neutral card.
    - Button displays a spinner; card remains neutral.
    - **API Success:** Button shows checkmark, card background turns Emerald, Streak count increments.
    - **API Error:** Spinner reverts to empty circle, Red Toast notification displays.

2.  **Undo (Incomplete):**
    - User clicks the "Check" button on an Emerald card.
    - Button displays a spinner.
    - **API Success:** Button shows empty circle, card background turns Neutral, Streak count decrements.

## 9. Conditions and Validation

- **3 AM Rule:** The `completed_date` sent to the API must match the `logicalDate` calculated by the Dashboard (Current Time - 3 hours). This ensures checks at 1 AM count for the "previous" day.
- **Debounce/Lock:** The button must be `disabled` while `isToggling` is true to prevent double submissions.

## 10. Error Handling

- **409 Conflict:** If the user (or another tab) already marked it complete, the API returns 409. Treat this as "Success" and update the UI to Completed state.
- **404 Not Found:** If undoing a non-existent completion. Treat as "Success" (already undone) and update UI.
- **500/Network:** Display a generic error Toast ("Failed to update habit. Please try again.").

## 11. Implementation Steps

1.  **Preparation:**
    - Ensure `src/lib/utils/date.ts` has `getLogicalDate()`.
    - Ensure `HabitWithStats` type is available.

2.  **Update `HabitCard.svelte`:**
    - Add `onToggle` prop.
    - Implement `isToggling` local state.
    - Add conditional styling logic (Emerald vs Neutral).
    - Replace static icon with Button + Spinner logic.

3.  **Update `Dashboard.svelte` (+page.svelte):**
    - Implement `toggleHabit(id)` function.
    - Inside function:
      - Find habit in `habits` array.
      - Determine Action (POST vs DELETE) based on `habit.completed_today`.
      - Execute `fetch`.
      - Handle 201/204/409 responses.
      - Update `$state` `habits` array (flip boolean, adjust streak).
    - Pass `toggleHabit` to `HabitList` -> `HabitCard`.

4.  **Verification:**
    - Test marking a habit complete (check Database for new row).
    - Test undoing (check Database for row deletion).
    - Verify streak counter updates visually.
    - Verify visual transitions.
