# Product Requirements Document (PRD) - HabitFlow (MVP)

## 1. Product Overview

HabitFlow is a responsive web application designed to help users build and maintain daily habits through a streamlined, low-friction interface. The MVP focuses on the core mechanics of habit formation: consistency and visual progression. By providing a centralized digital space to log activities, HabitFlow replaces manual tracking methods with an automated system that calculates streaks and visualizes daily completion progress. The application utilizes a mobile-first design philosophy and leverages Supabase for authentication and data persistence.

## 2. User Problem

Maintaining consistency when building new habits is notoriously difficult without a structured system. Users often face three primary obstacles:

- Cognitive Load: Manual journals are tedious to maintain, leading to abandonment.
- Lack of Momentum: Without immediate visual feedback (like streaks), it is easy to quit after a single missed day as the perceived "cost" of stopping feels low.
- The "All-or-Nothing" Trap: Users often feel discouraged if they miss a deadline by a few minutes. HabitFlow addresses this by implementing a 3:00 AM grace period to accommodate non-standard daily schedules.

## 3. Functional Requirements

### 3.1 Habit Management (CRUD)

- The system shall allow users to create daily habits with a title.
- The system shall display a list of all active habits on a main dashboard.
- The system shall allow users to edit habit titles without affecting existing streak data.
- The system shall allow users to delete habits, which permanently removes associated streak history.

### 3.2 User Authentication

- The system shall support email and password-based sign-up and login.
- The system shall include a "Forgot Password" flow for account recovery.
- The system shall provide a "Delete Account" option that wipes all user-associated data from the database.

### 3.3 Daily Check-ins & Streak Logic

- The system shall provide a button-based interaction to mark a habit as "complete" for the current day.
- The system shall automatically calculate streaks based on consecutive daily completions.
- The system shall implement a 3:00 AM local device time "grace period" for the daily reset.
- If a habit is not marked complete by 3:00 AM the following day, the streak shall reset to zero.

### 3.4 Visual Indicators & Feedback

- The system shall change the visual state (color shift) of a habit card upon completion.
- The system shall display a real-time progress bar at the top of the dashboard showing the percentage of total habits completed for the day.
- The system shall feature an "Empty State" dashboard for new users with clear calls-to-action (CTA) to create their first habit.

## 4. Product Boundaries

### 4.1 Out of Scope for MVP

- Advanced Analytics: No long-term charts, heatmaps, or monthly reports.
- Notifications: No push notifications, SMS, or email reminders.
- Gamification: No experience points, levels, or badges.
- Social Features: No friends list, public profiles, or leaderboards.
- Flexible Scheduling: Only "daily" habits are supported (no "3 times a week" or specific weekdays).

### 4.2 Technical Constraints

- Platform: Responsive Web Application only.
- Timezones: The system will rely on the local system clock of the user's device.
- Habit Limits: No hard limit on the number of habits a user can create.

## 5. User Stories

### 5.1 Authentication & Security

ID: US-001
Title: User Registration
Description: As a new user, I want to create an account using my email and password so that my habit data is saved across sessions.
Acceptance Criteria:

- User can enter a valid email and a secure password.
- System creates a unique user profile in the database.
- User is automatically logged in upon successful registration.

ID: US-002
Title: User Login/Logout
Description: As a returning user, I want to log in and out of my account so that my data remains private and accessible.
Acceptance Criteria:

- User can log in with registered credentials.
- User can log out, terminating the active session.
- Incorrect credentials trigger a clear error message.

ID: US-003
Title: Password Recovery
Description: As a user who forgot my password, I want to reset it via email so that I don't lose access to my account.
Acceptance Criteria:

- User can request a reset link via the login screen.
- System sends an email with a secure reset token/link.
- User can set a new password and log in.

ID: US-004
Title: Data Privacy & Account Deletion
Description: As a user, I want to be able to delete my account and all associated data so that I have control over my personal information.
Acceptance Criteria:

- User can trigger account deletion from a settings or profile area.
- System prompts for confirmation before deletion.
- All user records (habits, streaks, account info) are permanently removed from the database.

### 5.2 Habit Management

ID: US-005
Title: Create First Habit (Empty State)
Description: As a first-time user, I want to be guided on how to add my first habit so that I don't feel lost on an empty dashboard.
Acceptance Criteria:

- If zero habits exist, the dashboard displays an "Empty State" message.
- A prominent "Quick Add" or "Create Habit" button is visible.
- Clicking the button opens a creation modal or form.

ID: US-006
Title: Create Habit
Description: As a user, I want to add a new habit to my list so that I can start tracking it.
Acceptance Criteria:

- User can input a title for the habit.
- The habit appears immediately on the dashboard upon saving.
- The progress bar updates to reflect the new total count of habits.

ID: US-007
Title: Edit Habit Title
Description: As a user, I want to rename a habit without losing my streak so that I can refine my goals.
Acceptance Criteria:

- User can update the text of an existing habit.
- The streak count remains unchanged after the title update.

ID: US-008
Title: Delete Habit
Description: As a user, I want to remove a habit I am no longer interested in so that my dashboard stays clean.
Acceptance Criteria:

- User can select a delete option on a specific habit card.
- System confirms deletion.
- Habit and all historical streak data for that habit are removed.

### 5.3 Daily Tracking & Logic

ID: US-009
Title: Daily Check-in
Description: As a user, I want to mark a habit as complete for the day so that I can track my progress.
Acceptance Criteria:

- Each habit card has a visible "Complete" button.
- Clicking the button updates the habit card's color/style to indicate completion.
- The action is reversible (unchecking) within the same daily window.

ID: US-010
Title: Daily Progress Visualization
Description: As a user, I want to see a summary of my day's progress so that I feel motivated to finish all tasks.
Acceptance Criteria:

- A progress bar is visible at the top of the dashboard.
- The bar shows the percentage of completed vs. total habits for the current day.
- The percentage updates in real-time when habits are marked complete/incomplete or added/deleted.

ID: US-011
Title: Streak Calculation
Description: As a user, I want my streak to increase automatically when I stay consistent so that I can see my long-term progress.
Acceptance Criteria:

- Streak increments by 1 if a habit is marked complete for the day.
- The streak count is displayed prominently on the habit card.
- Streak calculation persists across logins.

ID: US-012
Title: 3:00 AM Reset Logic (Grace Period)
Description: As a night-owl user, I want the "day" to reset at 3:00 AM instead of midnight so that I can log late-night habits.
Acceptance Criteria:

- Completion status for habits is cleared at 3:00 AM local device time.
- If a habit was not marked complete by 3:00 AM, its streak resets to 0.
- If a habit was marked complete, the streak is maintained and the card resets to "incomplete" for the new day.

## 6. Success Metrics

The following metrics will be tracked internally (via Supabase logs or basic analytics) to evaluate MVP performance:

- Engagement: 80% of users maintaining at least 3 active habits in their dashboard.
- Consistency: 70% of users achieving a 5-day streak within their first 14 days of registration.
- Retention: Measured via Weekly Active Users (WAU), targeting a stable user base that interacts with the app at least 3 days per week.
- Completion Rate: Percentage of users completing at least 100% of their daily tasks at least twice a week.
