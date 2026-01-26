# View Implementation Plan - Edit Habit Modal

## 1. Overview

The **Edit Habit Modal** provides a user interface to rename an existing habit. It is triggered via a context menu on the `HabitCard` and communicates with the backend to persist changes while preserving the habit's streak and completion history.

## 2. View Routing

This view is not a standalone page. It is a **modal component** integrated into the Dashboard view:

- **Parent Route:** `/dashboard` (and potentially `/(app)/dashboard`)
- **Parent Component:** `src/lib/components/dashboard/HabitList.svelte` (or `src/routes/(app)/dashboard/+page.svelte`)

## 3. Component Structure

The implementation involves creating one new component and modifying two existing ones.

- **HabitList** (Container/Controller)
  - **EditHabitModal** (New Component)
  - **HabitCard** (Existing - needs modification for trigger)

## 4. Component Details

### 1. `EditHabitModal.svelte` (New)

- **Description:** A modal dialog containing a form to edit the habit's title. It handles form validation and loading states locally, delegating the actual save action to the parent via a callback/prop.
- **Main Elements:**
  - `<dialog>` (DaisyUI modal structure).
  - `<input type="text">` for the title.
  - "Cancel" button (ghost/outline).
  - "Save" button (primary).
  - Error message alert (if save fails).
- **Handled Interactions:**
  - `open`: Logic to pre-fill input with current habit title.
  - `input`: Updates local state.
  - `submit`: Triggers validation and calls `onSave`.
  - `cancel`: Closes modal.
- **Handled Validation:**
  - **Required:** Title cannot be empty or whitespace only.
  - **Max Length:** 255 characters (enforced via `maxlength` attribute and validation check).
- **Types:**
  - Uses `Habit` type for the input prop.
- **Props:**
  - `habit`: `Habit | null` (The habit to edit).
  - `isOpen`: `boolean` (Controls visibility).
  - `onClose`: `() => void`.
  - `onSave`: `(id: string, newTitle: string) => Promise<void>`.

### 2. `HabitCard.svelte` (Modification)

- **Description:** Currently displays habit details. Needs a mechanism to trigger the edit action.
- **Modifications:**
  - Add a **Dropdown Menu** (Kebab/Three-dots icon) in the card header.
  - Add a "Rename" menu item.
- **Main Elements:**
  - DaisyUI `dropdown` component.
  - Button with icon (e.g., `EllipsisVertical`).
- **Handled Interactions:**
  - Click "Rename": Dispatches an `edit` event with the habit object.

### 3. `HabitList.svelte` (Modification)

- **Description:** Renders the list of habits.
- **Modifications:**
  - State for `editingHabit` (`Habit | null`).
  - State for `isEditModalOpen` (`boolean`).
  - Event handler for the `edit` event from `HabitCard`.
  - Function `handleSaveTitle` to call the API and update the local `habits` array.

## 5. Types

No new global types are strictly required, but we will utilize existing ones:

- **`Habit`**: From `$lib/data-access/types`.
- **`UpdateHabitCommand`**: From `$lib/data-access/types` (used for API payload typing).

## 6. State Management

The state is split between the parent (`HabitList`) and the modal (`EditHabitModal`).

- **Parent (`HabitList`)**:
  - Controls _which_ habit is being edited (`editingHabit`).
  - Controls _visibility_ of the modal (`isEditModalOpen`).
  - Owns the "Source of Truth" for the list of habits.

- **Child (`EditHabitModal`)**:
  - Controls the _form state_ (`title` input value).
  - Controls _UI state_ (`isLoading`, `errorMessage`) specific to the save operation.
  - **Note:** Use Svelte 5 `$state` runes. Use an `$effect` to reset the `title` state whenever the `habit` prop changes.

## 7. API Integration

- **Endpoint:** `PATCH /rest/v1/habits?id=eq.{id}`
- **Method:** `PATCH`
- **Request Body:** `UpdateHabitCommand` (`{ title: string }`)
- **Response:** `Habit` (The updated object).
- **Implementation Location:** `HabitList.svelte` (inside `handleSaveTitle`).

## 8. User Interactions

1.  **Triggering Edit:**
    - User clicks the "..." icon on a habit card.
    - Dropdown opens.
    - User clicks "Rename".
    - `HabitCard` dispatches `edit` event.
    - `HabitList` sets `editingHabit` and opens `EditHabitModal`.

2.  **Editing:**
    - Modal appears with focus on the input, text pre-filled.
    - User types new title.

3.  **Saving:**
    - User clicks "Save" or presses Enter.
    - Modal shows loading spinner on button.
    - API request is sent.
    - **Success:** Modal closes. `HabitList` updates the specific habit in the list with the new title.
    - **Failure:** Modal stops loading, displays error message (e.g., "Failed to rename"). Modal remains open.

4.  **Canceling:**
    - User clicks "Cancel", "X", or clicks backdrop.
    - Modal closes. State is reset.

## 9. Conditions and Validation

- **Input Validation:**
  - Condition: `title.trim().length === 0`.
  - Action: Disable "Save" button or show "Title is required" error.
- **Length Validation:**
  - Condition: `title.length > 255`.
  - Action: Prevent input (via HTML attribute) or show error.
- **API Validation:**
  - The API enforces `target_date` (for GET) and ID format. For PATCH, it enforces title presence and length. Frontend should mirror these constraints to avoid unnecessary API calls.

## 10. Error Handling

- **Client-Side:** Form validation prevents submission of invalid data.
- **Network/Server Errors:**
  - Wrapped in a `try/catch` block within the save handler.
  - If the API returns a non-200 status or throws, the `EditHabitModal` displays a user-friendly error message (e.g., "Connection error" or "Server error").

## 11. Implementation Steps

1.  **Modify `HabitCard.svelte`:**
    - Import a suitable icon (e.g., from `lucide-svelte` if available, or SVG).
    - Add the DaisyUI dropdown menu structure to the header.
    - Implement `onEdit` callback/dispatch logic.

2.  **Create `EditHabitModal.svelte`:**
    - Scaffold the component with `<dialog>` and DaisyUI modal classes.
    - Define `$props` (`habit`, `isOpen`, `onClose`, `onSave`).
    - Implement form state using `$state` and `$effect` to sync with props.
    - Add validation logic and loading state.

3.  **Modify `HabitList.svelte`:**
    - Add state for `editingHabit` and `isModalOpen`.
    - Import and render `EditHabitModal` at the bottom of the template.
    - Create `openEditModal(habit)` function.
    - Create `saveHabitTitle(id, newTitle)` async function:
      - Call `fetch('/rest/v1/habits?id=eq.' + id, { method: 'PATCH', ... })`.
      - On success: Update local `habits` array (map over array and replace modified item). Close modal.
      - On error: Throw so modal can handle it.
    - Connect `HabitCard`'s edit event to `openEditModal`.

4.  **Verify:**
    - Test opening modal for different habits.
    - Test saving valid titles.
    - Test validation (empty title).
    - Test error handling (simulating network failure if possible).
    - Verify streak remains unchanged (visual check).
