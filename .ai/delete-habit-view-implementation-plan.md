# View Implementation Plan - Delete Habit

## 1. Overview

This plan outlines the implementation of the "Delete Habit" functionality. It involves creating a confirmation modal, updating the existing habit card to include a delete trigger (context menu), and integrating with the backend API to permanently remove the habit and its history.

## 2. View Routing

- **Main View:** `/dashboard` (The dashboard displays the habit list where the delete action originates).
- **API Endpoint:** `/rest/v1/habits` (DELETE method).

## 3. Component Structure

The following structure highlights the new and modified components required for this feature:

- `src/routes/(app)/dashboard/+page.svelte` (Parent / Orchestrator)
  - `src/lib/components/dashboard/DeleteHabitModal.svelte` **(New)**
  - `src/lib/components/dashboard/HabitList.svelte` **(Modified)**
    - `src/lib/components/dashboard/HabitCard.svelte` **(Modified)**

## 4. Component Details

### `DeleteHabitModal.svelte` (New)

- **Description:** A modal dialog that asks the user for confirmation before deleting a habit. It ensures the action is intentional.
- **Main Elements:**
  - `dialog` element (DaisyUI Modal).
  - Title: "Delete Habit".
  - Body: "Are you sure you want to delete **{habitTitle}**? This action cannot be undone and will remove all streak history."
  - Actions: "Cancel" (Ghost button) and "Delete" (Error/Red button).
- **Handled Interactions:**
  - `close`: Triggered by "Cancel" button or clicking the backdrop.
  - `confirm`: Triggered by "Delete" button. Calls the `onConfirm` prop.
- **State:**
  - `isSubmitting` ($state): Boolean to show a loading spinner on the confirm button during API call.
- **Props:**
  - `isOpen`: boolean (bindable) - Controls visibility.
  - `habitTitle`: string - The name of the habit to be deleted.
  - `onConfirm`: `() => Promise<void>` - Async function to execute the deletion.

### `HabitCard.svelte` (Modified)

- **Description:** Represents a single habit. Needs a way to trigger the delete action.
- **Main Elements:**
  - Existing elements (Title, Streak, Checkbox).
  - **New:** Context Menu (Dropdown) typically positioned at the top-right (e.g., three dots icon).
    - Item 1: "Edit" (If applicable/existing).
    - Item 2: "Delete" (Text-error color).
- **Handled Interactions:**
  - Click "Delete" option -> Calls `onDelete` prop with the habit's ID.
- **Props:**
  - `habit`: `HabitWithStats` (Existing).
  - `onDelete`: `(id: string) => void` **(New)** - Callback to notify parent of delete request.
  - `onEdit`: `(habit: HabitWithStats) => void` (Existing/Implied).

### `HabitList.svelte` (Modified)

- **Description:** Renders the list of `HabitCard` components.
- **Main Elements:**
  - Iteration block (`#each`).
- **Props:**
  - `habits`: `HabitWithStats[]`.
  - `onDeleteHabit`: `(id: string) => void` **(New)** - Passes the delete event from card to dashboard.

### `src/routes/(app)/dashboard/+page.svelte` (Modified)

- **Description:** The main dashboard page acting as the state manager.
- **State:**
  - `showDeleteModal`: boolean ($state).
  - `habitToDelete`: `HabitWithStats | null` ($state).
- **Logic:**
  - `openDeleteModal(habit)`: Sets `habitToDelete` and opens modal.
  - `handleDelete()`: The async function passed to the modal to perform the API call and update the local list.

## 5. Types

### Required DTOs

No new DTOs are required. We will use the existing `HabitWithStats` or `Habit` type defined in `$lib/data-access/types.ts`.

### View Models

- **DeleteTarget:** Simple object/reference to track which habit is being deleted.
  ```typescript
  {
  	id: string;
  	title: string;
  }
  ```

## 6. State Management

State is managed locally in `dashboard/+page.svelte` using Svelte 5 Runes.

- **Modal Visibility:** `let showDeleteModal = $state(false);`
- **Selected Habit:** `let habitToDelete = $state<HabitWithStats | null>(null);`
- **List State:** The `data.habits` array (or a local state copy of it if we are doing optimistic updates/filtering) will be updated upon successful deletion.

## 7. API Integration

### Endpoint

- **URL:** `/rest/v1/habits`
- **Method:** `DELETE`
- **Query Param:** `id=eq.{uuid}`

### Request

```typescript
await fetch(`/rest/v1/habits?id=eq.${habitToDelete.id}`, {
	method: 'DELETE'
});
```

### Response

- **204 No Content:** Success.
- **4xx/5xx:** Error.

## 8. User Interactions

1.  **Trigger:** User clicks the "Menu" (three dots) on a `HabitCard` and selects "Delete".
2.  **Open Modal:** The `DeleteHabitModal` appears, displaying the name of the habit.
3.  **Confirm:** User clicks "Delete" in the modal.
    - The "Delete" button enters a loading state (spinner/disabled).
    - API request is sent.
4.  **Completion:**
    - **Success:** Modal closes. The habit disappears from the dashboard list immediately.
    - **Failure:** Modal remains open (or closes), and an error notification is displayed.

## 9. Conditions and Validation

- **Authentication:** Verified by the backend (401 response).
- **Input Validation:**
  - `id`: Must be a valid UUID (Backend check).
  - The UI implicitly validates this by only allowing clicks on existing valid cards.

## 10. Error Handling

- **API Failure:** If the `DELETE` request fails (non-2xx status):
  - Log the error to the console.
  - Display a user-friendly alert or toast message (e.g., "Failed to delete habit. Please try again.").
  - Reset the `isSubmitting` state in the modal to allow retry or cancel.

## 11. Implementation Steps

1.  **Create Modal Component:** Implement `src/lib/components/dashboard/DeleteHabitModal.svelte` using the DaisyUI modal structure and Svelte 5 props/runes.
2.  **Update Habit Card:** Modify `src/lib/components/dashboard/HabitCard.svelte` to include a dropdown menu with a "Delete" option. Add the `onDelete` callback prop.
3.  **Update Habit List:** Pass the `onDelete` callback through `src/lib/components/dashboard/HabitList.svelte`.
4.  **Update Dashboard Page:**
    - Import `DeleteHabitModal`.
    - Create state variables (`showDeleteModal`, `habitToDelete`).
    - Implement `openDeleteModal` function.
    - Implement `handleDelete` async function (API call + list update).
    - Render `DeleteHabitModal` at the root of the page template.
5.  **Verify:** Test the flow (Open -> Cancel, Open -> Delete -> Success). Check that the item is removed from the UI.
