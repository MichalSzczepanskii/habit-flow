# UI Architecture for HabitFlow

## 1. UI Structure Overview

The HabitFlow User Interface is designed as a **Mobile-First Progressive Web App (PWA)**, utilizing **SvelteKit 5**, **Tailwind CSS 4**, and **DaisyUI 5**. The architecture enforces a strict separation between public authentication flows and the private application state using SvelteKit Route Groups (`(auth)` and `(app)`).

### Core Design Principles

- **Visual Void Strategy:** The interface uses neutral, desaturated colors for incomplete tasks to reduce cognitive load, switching to vibrant colors (Emerald/Blue) only upon task completion to provide a dopamine reward.
- **Modal-Driven Navigation:** To preserve user context and state, secondary actions (Creation, Editing, Settings) occur in overlay Modals (DaisyUI `<dialog>`) rather than navigating to separate pages.
- **Reactive Data Flow:** The UI leverages Svelte 5 Runes (`$state`, `$derived`) to manage local state, ensuring the Progress Bar and Streak counters update immediately upon successful API interactions without requiring full page reloads.
- **Feedback-First:** Every user action provides immediate feedback via Loading Spinners (during API latency) or Global Toasts (for errors), explicitly rejecting "Optimistic UI" in favor of data consistency.

## 2. View List

### 2.1 Public Layer `(auth)`

#### Login View

- **Path:** `/(auth)/login`
- **Purpose:** Entry point for returning users.
- **Key Components:** Email/Password Form, "Sign In" Button, Link to Register, Link to Forgot Password.
- **UX/Security:** Client-side validation for email format. Redirects to Dashboard upon success.

#### Register View

- **Path:** `/(auth)/register`
- **Purpose:** Onboarding for new users.
- **Key Components:** Email/Password Form, "Create Account" Button, Link to Login.
- **UX/Security:** Password strength validation (min-length). Auto-login upon successful registration.

#### Forgot Password View

- **Path:** `/(auth)/forgot-password`
- **Purpose:** Account recovery.
- **Key Components:** Email Input, "Send Reset Link" Button.
- **UX:** Success message replaces form upon submission to prevent spamming.

---

### 2.2 Private Layer `(app)`

#### Dashboard View (Main Layout)

- **Path:** `/(app)/dashboard` (acts as Home `/`)
- **Purpose:** The central hub for tracking habits, viewing progress, and managing daily goals.
- **Key Information:**
  - **Logical Date:** The current date calculated relative to the 3:00 AM grace period.
  - **Daily Progress:** Percentage of habits completed for the logical date.
  - **Habit List:** Ordered list of active habits (sorted by creation date).
- **Key Components:**
  - `TopNavigation`: Sticky header with Logo and User Avatar.
  - `DateHeader`: Displays "Today, [Month] [Day]" (respecting 3 AM rule).
  - `DailyProgressBar`: Animated bar showing completion percentage.
  - `HabitList`: Vertical stack of `HabitCard` components.
  - `EmptyStateHero`: Displayed only when no habits exist.
  - `CreateHabitFAB`: Floating Action Button (bottom-right) or Header Action for adding habits.
- **UX/Accessibility:**
  - Skeleton loaders during initial data fetch.
  - `aria-live` regions for progress updates.
  - Keyboard navigation support for the list.

#### Modals (Overlay Views)

1.  **Create Habit Modal**
    - **Trigger:** `CreateHabitFAB` or Empty State CTA.
    - **Purpose:** distinct input interface to define a new goal.
    - **Elements:** Title Input (focused on open), "Cancel" and "Save" buttons.

2.  **Edit Habit Modal**
    - **Trigger:** "Rename" option in `HabitCard` menu.
    - **Purpose:** Rename an existing habit.
    - **Elements:** Title Input (pre-filled), "Cancel" and "Save" buttons.

3.  **Settings Modal**
    - **Trigger:** User Avatar Dropdown -> "Settings".
    - **Purpose:** Account management and Danger Zone.
    - **Elements:**
      - User Email display (readonly).
      - **Danger Zone:** "Delete Account" button (Red).
    - **Security:** Account deletion requires a secondary confirmation prompt (e.g., "Are you sure?").

## 3. User Journey Map

### Primary Flow: The Daily Check-in

1.  **Authentication:** User logs in and is redirected to the Dashboard.
2.  **Date Verification:**
    - App calculates `LogicalDate` (Current Time - 3 Hours).
    - App fetches data via `get_habits_with_stats(target_date: LogicalDate)`.
3.  **Assessment:** User sees the `DailyProgressBar` (e.g., 0%) and a list of neutral-colored habit cards.
4.  **Action:** User clicks the Checkbox/Button on a `HabitCard`.
    - **State:** Button shows a generic loading spinner.
    - **API:** `POST /habit_completions`.
5.  **Reward:**
    - On Success: Spinner disappears. Card background transitions to **Vibrant Emerald**. Check icon animates in. Streak count increments.
    - **Feedback:** `DailyProgressBar` animates to new percentage (e.g., 20%).

### Secondary Flow: Creating a Habit

1.  **Trigger:** User clicks the "Plus" FAB.
2.  **Input:** `CreateHabitModal` opens with focus on the input field. User types "Drink Water".
3.  **Submission:** User presses Enter or clicks "Save".
4.  **Update:** Modal closes. "Drink Water" is appended to the `HabitList`. Progress Bar recalculates (denominator increases, % decreases).

### Edge Case: The "Night Owl" (3 AM Rule)

1.  User opens app at **2:50 AM** on Tuesday.
    - Logical Date is **Monday**.
    - User sees Monday's habits.
2.  User leaves app open. Clock hits **3:01 AM**.
    - **Client Timer:** Detects logical day rollover.
    - **Action:** Triggers `invalidateAll()` / Data Refresh.
    - **Result:** Dashboard refreshes to show **Tuesday** (Logical Date). All completions reset to empty.

## 4. Layout and Navigation Structure

### Global Layout (`+layout.svelte`)

- Contains the `ToastNotificationContainer` (fixed z-index overlay) for global error/success messages.

### App Layout (`(app)/+layout.svelte`)

- **Sticky Top Navigation Bar:**
  - **Left:** Brand Logo (HabitFlow).
  - **Right:** User Avatar (Circle).
    - **Interaction:** Tapping Avatar opens a Dropdown Menu.
    - **Menu Items:** "Settings" (Opens Modal), "Logout" (Server Action).
- **Main Content Area:**
  - Scrollable container holding the Dashboard.
  - Padded to prevent content occlusion by the Sticky Header.

## 5. Key Components

| Component Name     | Description                                                                                                           | Key Props/State                                                                         |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| `HabitCard`        | The primary interactive unit. Displays Title, Streak, and Completion Status. Handles the "Visual Void" logic.         | `habit: Habit`, `isCompleted: boolean`, `onToggle: () => Promise`, `onEdit`, `onDelete` |
| `DailyProgressBar` | Visual indicator of daily success. Located at the top of the dashboard.                                               | `total: number`, `completed: number` (Derived Rune)                                     |
| `DateHeader`       | Displays the current _Logical_ date to reassure users about the 3 AM rule.                                            | `date: Date`                                                                            |
| `KebabMenu`        | A 3-dot dropdown menu on the HabitCard for secondary actions to save space on mobile.                                 | `options: [{ label: 'Rename', action }, { label: 'Delete', action }]`                   |
| `EmptyStateHero`   | A visually distinct component (Illustration + CTA) shown only when the habit list is empty.                           | `onCreate: () => void`                                                                  |
| `ClientDayTimer`   | A renderless component (or hook) that monitors the system clock and triggers a refresh when the Logical Date changes. | Internal `setInterval` checking `new Date()`                                            |
| `GlobalToast`      | A store-driven notification system for displaying API errors or critical system messages.                             | `$toastStore`                                                                           |
