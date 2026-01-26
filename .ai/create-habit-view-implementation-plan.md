# View Implementation Plan Create Habit

## 1. Overview

The **Create Habit** view is a modal-based interface allowing users to define new daily habits. It is accessible from the main dashboard via an "Empty State" call-to-action or a Floating Action Button (FAB). Upon successful creation, the new habit is immediately reflected in the user's dashboard and progress metrics without requiring a full page reload.

## 2. View Routing

This view is not a standalone route. It is a **component integrated into the Dashboard route**:

- Path: `/dashboard` (File: `src/routes/(app)/dashboard/+page.svelte`)

## 3. Component Structure

The functionality will be implemented primarily through a new modal component and updates to the existing dashboard page.

- `Dashboard (+page.svelte)` - Container and state manager.
  - `CreateHabitModal` (New) - The form dialog.
  - `CreateHabitFAB` (New Component or inline markup) - Floating action button trigger.
  - `EmptyStateHero` (Existing) - Modified to trigger the modal.
  - `HabitList` (Existing) - Displays the list (updated via state).

## 4. Component Details

### `CreateHabitModal` (New)

- **Description:** A modal dialog containing the form to create a new habit. It uses the native HTML `<dialog>` element styled with DaisyUI.
- **Location:** `src/lib/components/dashboard/CreateHabitModal.svelte`
- **Main Elements:**
  - `<dialog>` container.
  - Text Input (`<input type="text">`) for the habit title.
  - "Cancel" button (closes modal).
  - "Save" button (submits form).
- **Handled Interactions:**
  - **Open:** Focuses the input field automatically.
  - **Type:** Updates local reactive state `title`.
  - **Cancel/Backdrop Click:** Closes the modal and resets the form.
  - **Save:** Validates input, sends POST request, calls `onSuccess` on 201 response, closes modal.
- **Handled Validation:**
  - **Client-side:** Title must not be empty or whitespace only.
  - **Server-side:** Handles 400 Bad Request errors from API.
- **Types:**
  - Uses `CreateHabitCommand` for payload construction.
  - Uses `Habit` for the response type.
- **Props:**
  - `open`: `boolean` ($bindable) - Controls visibility.
  - `onSuccess`: `(habit: Habit) => void` - Callback executed after successful creation.

### `Dashboard` (Page Update)

- **Description:** The parent controller that manages the list of habits and the modal's visibility.
- **Updates:**
  - Maintain `isCreateModalOpen` state.
  - Maintain `habits` state (initialized from server data, updated locally).
  - Implement `handleAddHabit(newHabit: Habit)` function to merge the new habit into the list with default stats.
  - Pass toggle functions to `EmptyStateHero` and `CreateHabitFAB`.

## 5. Types

No new types need to be defined in `src/lib/data-access/types.ts`. We will strictly use the existing ones:

- **`CreateHabitCommand`**: `{ title: string }`
- **`Habit`**: Represents the raw habit entity returned by the creation endpoint.
- **`HabitWithStats`**: The type used by the Dashboard list. (We will need to cast/extend the `Habit` to this type locally by adding default `streak_current: 0` and `completed_today: false`).

## 6. State Management

State will be managed using Svelte 5 Runes:

- **Modal Visibility:** Controlled by a `$state(false)` boolean in the parent `+page.svelte`, passed to the modal via `$bindable()` prop.
- **Form Data:** Local `$state('')` for the title within the modal.
- **Loading State:** Local `$state(false)` within the modal to disable buttons during API submission.
- **List Data:** The dashboard's habit list must be reactive (`$state(data.habits)`) to allow immediate UI updates (optimistic or post-success) without re-running the server `load` function.

## 7. API Integration

- **Endpoint:** `POST /rest/v1/habits`
- **Request Type:**

  ```typescript
  // Content-Type: application/json
  {
      "title": "My New Habit"
  }
  ```

- **Response Type (Success 201):**

  ```typescript
  {
      "id": "uuid...",
      "user_id": "uuid...",
      "title": "My New Habit",
      "created_at": "...",
      "updated_at": "..."
  }
  ```

- **Implementation:** Use standard `fetch` within the `save` function of the modal.

## 8. User Interactions

1. **Trigger:** User clicks "Create Habit" (FAB) or "Add your first habit" (Empty State).
2. **Open:** Modal appears; background dims; focus lands on the input field.
3. **Input:** User types a title (e.g., "Drink Water").
4. **Action (Save):**
   - User clicks "Save" or presses "Enter".
   - Input is disabled; Save button shows loading spinner.
   - API request is sent.
5. **Success:**
   - Modal closes.
   - Notification/Toast (optional, but good UX) appears.
   - The new habit appears at the bottom (or top) of the habit list.
   - Empty state disappears (if it was visible).
6. **Action (Cancel):**
   - User clicks "Cancel" or outside the modal.
   - Modal closes; input is cleared.

## 9. Conditions and Validation

- **Empty Title:** The "Save" button should be disabled or the submission blocked if `title.trim() === ''`.
- **Default Stats:** Since the `POST` endpoint returns a raw `Habit` (without stats), the frontend must assume default stats (`streak: 0`, `completed: false`) when adding it to the `HabitWithStats[]` list to satisfy the type system and UI requirements.

## 10. Error Handling

- **Network Error:** If `fetch` fails, catch the error and display "Failed to create habit. Please try again." in the modal (e.g., red text above buttons).
- **Validation Error (400):** If API returns 400, display the specific error message provided by the backend.
- **Reset:** Error messages should clear when the user starts typing again or re-opens the modal.

## 11. Implementation Steps

1. **Create `CreateHabitModal.svelte`**:
   - Scaffold the component using `<dialog>` and DaisyUI classes.
   - Implement the `title` input and button layout.
   - Add the `saveHabit` logic with `fetch` call.
   - Implement `onSuccess` callback execution and form reset.

2. **Update `Dashboard` Page (`+page.svelte`)**:
   - Create a reactive state for `habits` initialized from `data.habits`.
   - Create `isCreateModalOpen` state.
   - Import `CreateHabitModal` and place it at the bottom of the markup.
   - Implement `handleHabitCreated` function to adapt the new `Habit` to `HabitWithStats` and push to the list.

3. **Implement Triggers**:
   - Add a Floating Action Button (FAB) to the Dashboard (bottom-right fixed, visible on mobile/desktop).
   - Update `EmptyStateHero` (or its usage in Dashboard) to accept an `onclick` handler that sets `isCreateModalOpen = true`.

4. **Verify & Test**:
   - Test opening/closing.
   - Test validation (empty title).
   - Test successful creation and list update.
   - Test persistence (refresh page to ensure server data matches).
