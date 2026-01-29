# Test Plan for Habit Flow Application

## 1. Introduction

This document outlines the comprehensive test strategy for the **Habit Flow** application. Habit Flow is a web-based habit tracker built with SvelteKit (Svelte 5), TypeScript, and Supabase. The application features a unique "Logical Date" system (days end at 3 AM), streak tracking, and optimistic UI updates.

The primary goal of this test plan is to ensure the reliability of the core habit tracking loop, the accuracy of temporal logic, and the security of user data.

## 2. Scope

### 2.1 In-Scope

- **Authentication:** Sign up, Sign in, Password Reset, Session persistence, and Route protection.
- **Dashboard Functionality:** Loading habits, daily progress calculation, and empty states.
- **Habit Management:** Create, Read, Update (Rename), Delete (CRUD).
- **Habit Interaction:** Completion toggling, streak calculation, and optimistic UI updates.
- **Date Logic:** Verification of the "Logical Day" (3 AM rollover) across the application.
- **API Endpoints:** `GET`, `POST`, `PATCH`, `DELETE` handlers in `src/routes/rest/v1`.
- **User Settings:** Password updates and Account deletion.

### 2.2 Out-of-Scope

- Supabase platform uptime and internal performance.
- Third-party email delivery services (SMTP provider reliability).
- Load testing beyond 100 concurrent users (current phase focus is functionality).

## 3. Test Strategy & Types

| Test Type               | Focus Area                                                                                                    | Tools                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------- |
| **Unit Testing**        | Pure logic functions (especially `date.ts`) and isolated Svelte components (`DailyProgressBar`, `HabitCard`). | Vitest                |
| **Integration Testing** | API endpoints (`rest/v1/*`) and interaction between SvelteKit loaders/actions and Supabase mocks.             | Vitest                |
| **E2E Testing**         | Critical user flows (Login → Habit Cycle → Logout) running against a staging database.                        | Playwright            |
| **UX/UI Testing**       | Responsive design verification (Mobile Drawer vs Desktop Navbar) and DaisyUI themes.                          | Manual / BrowserStack |

## 4. Test Scenarios

### 4.1 Core Logic: Date & Time (High Priority)

_The application considers a day active until 3:00 AM the next morning._

| ID        | Scenario                                      | Expected Result                                                                                             |
| --------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **DT-01** | User accesses app at 02:59 AM on Jan 2nd.     | Logical Date is **Jan 1st**. Header displays "Jan 1st" (or "Yesterday" context).                            |
| **DT-02** | User accesses app at 03:01 AM on Jan 2nd.     | Logical Date is **Jan 2nd**. Header displays "Today".                                                       |
| **DT-03** | App remains open while time crosses 03:00 AM. | `ClientDayTimer` triggers `onDateChange`, refreshing the habit list for the new day automatically.          |
| **DT-04** | Timezone crossing.                            | Verify `getLogicalDateString` sends the correct local date string to the API regardless of server UTC time. |

### 4.2 Authentication & Security

| ID          | Scenario                              | Expected Result                                                                            |
| ----------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| **AUTH-01** | Access `/dashboard` without session.  | Redirect to `/login` with HTTP 303.                                                        |
| **AUTH-02** | Login with invalid credentials.       | Display specific error message returned by Supabase.                                       |
| **AUTH-03** | Register with mismatched passwords.   | Form validation error prevents submission.                                                 |
| **AUTH-04** | API Access without Session.           | `GET /rest/v1/habits` returns 401 Unauthorized.                                            |
| **SEC-01**  | IDOR Check (Edit other user's habit). | Sending `PATCH` to a random UUID not owned by user returns 404/401 (RLS enforcement).      |
| **SET-01**  | Account Deletion.                     | User authenticated → Confirm Delete → Data removed → Redirect to Home → Session destroyed. |

### 4.3 Habit Management (CRUD)

| ID         | Scenario                    | Expected Result                                                                                 |
| ---------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| **HAB-01** | Create Habit (Empty Title). | "Save" button disabled or API returns 400.                                                      |
| **HAB-02** | Create Valid Habit.         | Modal closes, new habit appears at bottom of list immediately, `streak_count` initialized to 0. |
| **HAB-03** | Rename Habit.               | Update reflects immediately in UI. Revert to old name if API fails.                             |
| **HAB-04** | Delete Habit.               | Confirmation modal appears. On confirm: Item removed from list.                                 |

### 4.4 Interaction & Optimistic UI

| ID         | Scenario                        | Expected Result                                                                                    |
| ---------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| **INT-01** | Toggle Habit Complete.          | UI turns Green immediately. Streak increments +1. Progress bar updates.                            |
| **INT-02** | Toggle Habit Uncomplete.        | UI turns Grey immediately. Streak decrements -1. Progress bar updates.                             |
| **INT-03** | Toggle Failure (Network Error). | User clicks toggle → UI updates → API fails → UI reverts to previous state and shows Toast error.  |
| **INT-04** | Rapid Toggling.                 | Prevent multiple API calls or race conditions if user clicks checkbox repeatedly (Debounce check). |

## 5. Environment & Configuration

### 5.1 Test Environment (Local/CI)

- **Database:** Local Supabase instance (using `supabase start`) to ensure isolation and RLS testing.
- **Environment Variables:**
- `PUBLIC_SUPABASE_URL`: Localhost URL.
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Local anon key.
- `SERVICE_ROLE_KEY`: For setting up test data (seeds).

### 5.2 Staging

- A persistent Supabase project replicating production settings.
- Used for manual acceptance testing and mobile device testing.

## 6. Tools

- **Vitest:** For Unit and Integration tests (already present in `package.json`).
- _Action:_ Expand `src/demo.spec.ts` pattern to cover `src/lib/utils/date.ts` comprehensively.

- **Playwright:** Recommended for End-to-End testing.
- _Why:_ Native support for SvelteKit hydration waiting and multi-tab testing.

- **Postman/Insomnia:** For manual API exploration and edge-case testing of REST endpoints.

## 7. Execution Schedule

1. **Phase 1: Unit & Logic Verification (Days 1-2)**

- Deep testing of `src/lib/utils/date.ts`.
- Unit tests for Svelte components (specifically `DailyProgressBar` math).

2. **Phase 2: API Integration (Days 3-4)**

- Testing `routes/rest/v1` endpoints via Vitest request mocking.
- Verifying Error Handling (400 vs 500 responses).

3. **Phase 3: E2E & UI (Days 4-5)**

- Critical Path testing (Register -> Daily usage -> Settings).
- Mobile responsiveness checks (DaisyUI Drawer behavior).

## 8. Acceptance Criteria

- **Critical Path:** 100% Pass rate on User Login and Habit Completion flows.
- **Logic:** 100% Unit test coverage for `getLogicalDate` logic.
- **Bugs:** Zero Critical or High severity open bugs.
- **Performance:** Dashboard loads in < 1.5 seconds on 4G networks.

## 9. Roles and Responsibilities

- **QA Engineer:**
- Write and execute E2E tests.
- Perform manual exploratory testing (specifically around 3 AM logic).
- Verify RLS security rules.

- **Developer:**
- Maintain Unit tests for `date.ts` and component logic.
- Fix bugs reported in the issue tracker.

- **Product Owner:**
- Approve UX flows for "Logical Date" display (e.g., confirming "Yesterday" label behavior).

## 10. Defect Reporting Procedure

Bugs should be reported in the repository Issue Tracker with the following template:

```markdown
**Title:** [Component] Short description
**Severity:** Critical / High / Medium / Low
**Environment:** (e.g., Chrome Desktop, iPhone Safari, Localhost)
**Pre-conditions:** (e.g., User logged in, Time is 02:55 AM)

**Steps to Reproduce:**

1. Go to...
2. Click on...
3. ...

**Expected Result:** Logical date should be yesterday.
**Actual Result:** Logical date flipped to today prematurely.

**Attachments:** (Screenshots/Logs)
```
