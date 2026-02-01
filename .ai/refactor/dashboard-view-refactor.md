# Refactor Plan: Dashboard View & Logic Extraction

**Status:** Draft
**Target:** `src/routes/(app)/dashboard/+page.svelte` and related components.
**Goal:** Decouple business logic and data fetching from the UI components by introducing a Service Layer and a generic Svelte 5 Store.

## 1. Architecture Overview

We will transition from a "God Component" pattern (where `+page.svelte` handles everything) to a layered architecture:

1. **Service Layer (`src/lib/services/habit.service.ts`)**:
   - Stateless, pure TypeScript functions.
   - Handles direct API communication (`fetch` calls).
   - Parses responses and handles HTTP errors.
   - Returns typed data (`HabitWithStats[]`, `Habit`, etc.).

2. **Store Layer (`src/lib/stores/habit.store.svelte.ts`)**:
   - Stateful, reactive class using Svelte 5 Runes (`$state`, `$derived`, `$effect`).
   - Manages the list of `habits`, `isLoading`, and `logicalDate`.
   - Exposes actions (`fetch`, `add`, `update`, `delete`, `toggle`).
   - Handles optimistic updates to the UI state.

3. **View Layer (Components)**:
   - `+page.svelte`: Orchestrates the layout and instantiates/provides the Store.
   - Modals (`Create`, `Edit`, `Delete`): Become "dumb" components that accept callbacks or use the store contexts, removing internal `fetch` logic.

## 2. Implementation Steps

### Step 1: Create Service Layer

**File:** `src/lib/services/habit.service.ts`

- Implement `fetchHabits(date: string): Promise<HabitWithStats[]>`
- Implement `createHabit(title: string): Promise<Habit>`
- Implement `updateHabit(id: string, title: string): Promise<void>`
- Implement `deleteHabit(id: string): Promise<void>`
- Implement `toggleHabitCompletion(id: string, date: string, wasCompleted: boolean): Promise<void>`

### Step 2: Create Store Layer

**File:** `src/lib/stores/habit.store.svelte.ts`

- Create `class HabitStore` with:
  - `habits = $state<HabitWithStats[]>([])`
  - `loading = $state(false)`
  - `error = $state<string | null>(null)`
  - `logicalDate = $state<Date>(...)`
  - `progress = $derived(...)`
- Implement methods that call `HabitService` and update local state (optimistically where appropriate).

### Step 3: Refactor Modals (Dumb Components)

Remove `fetch` logic from modals. They should simply capture input and fire an event/callback.

- **`CreateHabitModal.svelte`**:
  - Remove `fetch`.
  - `onSuccess` becomes `onSubmit: (title: string) => Promise<void>`.
  - Let the parent handle the API call and closing.
- **`EditHabitModal.svelte`**:
  - Remove `fetch`.
  - `onSave` becomes `onSave: (id: string, title: string) => Promise<void>`.
- **`DeleteHabitModal.svelte`**:
  - Already mostly correct, ensure it just calls `onConfirm`.

### Step 4: Refactor Dashboard Page

**File:** `src/routes/(app)/dashboard/+page.svelte`

- Instantiate `const store = new HabitStore()`.
- Replace local state (`habits`, `isLoading`, etc.) with `store.habits`, `store.loading`.
- Update `fetchHabits` to `store.load(date)`.
- Pass store actions to modals and list.
- Use `$effect` to sync `store.logicalDate` changes to data fetching.

## 3. Benefits

- **Testability:** Logic in `HabitStore` can be unit tested without mounting components.
- **Reusability:** The store can be shared if other views need habit data.
- **Cleanliness:** `+page.svelte` focuses on layout and composition.
- **Consistency:** All API calls are in one place (`habit.service.ts`), making it easier to add features like error toast handling globally.

## 4. Verification

- **Lint:** Run `npm run lint`.
- **Unit Tests:** Add basic tests for `habit.store.svelte.ts`.
- **Manual:** Verify Dashboard loads, creates, edits, deletes, and toggles habits correctly.
