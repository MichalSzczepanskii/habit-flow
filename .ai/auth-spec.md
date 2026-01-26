# Authentication Architecture Specification

## 1. User Interface Architecture

The application will be divided into two main layout groups to separate authenticated and non-authenticated contexts.

### 1.1 Route Structure

```
src/routes/
├── (auth)/                 # Public authentication routes
│   ├── +layout.svelte      # Centered card layout with logo
│   ├── login/              # US-002: User Login
│   │   ├── +page.svelte
│   │   └── +page.server.ts
│   ├── register/           # US-001: User Registration
│   │   ├── +page.svelte
│   │   └── +page.server.ts
│   └── forgot-password/    # US-003: Password Recovery
│       ├── +page.svelte
│       └── +page.server.ts
├── (app)/                  # Protected application routes
│   ├── +layout.server.ts   # Protection logic (redirect if no session)
│   ├── +layout.svelte      # Main app layout (Sidebar/Nav, Logout button)
│   ├── dashboard/          # Main Habit Dashboard
│   └── settings/           # US-004: Account Deletion, Password Update
│       ├── +page.svelte
│       └── +page.server.ts
└── auth/
    └── callback/           # Handling email confirmation/magic link redirects
        └── +server.ts
```

### 1.2 Layouts & Components

#### Auth Layout (`(auth)/+layout.svelte`)

- **Design**: Minimalist, distraction-free. Centered container on the screen.
- **Elements**:
  - Application Logo/Name at the top.
  - Slot for content (forms).
  - Footer with links to toggle between Login/Register.
- **Responsive**: Full width on mobile, max-width card on desktop.

#### Login Page (`(auth)/login/+page.svelte`)

- **Form Fields**:
  - Email (`type="email"`, required)
  - Password (`type="password"`, required)
- **Actions**: "Sign In" button (primary), "Forgot Password?" link.
- **Feedback**: Loading state on button during submission. Top-level error alerts for invalid credentials.

#### Register Page (`(auth)/register/+page.svelte`)

- **Form Fields**:
  - Email (`type="email"`, required)
  - Password (`type="password"`, required, min length 6)
  - Confirm Password (optional for MVP, but good practice).
- **Actions**: "Sign Up" button.
- **Feedback**: Success message prompting to check email (if confirmation enabled) or auto-redirect to dashboard.

#### Forgot Password Page (`(auth)/forgot-password/+page.svelte`)

- **Form Fields**: Email (`type="email"`, required).
- **Actions**: "Send Reset Link" button.
- **Feedback**: Success message "Check your email for the reset link".

#### Settings Page (`(app)/settings/+page.svelte`)

- **Sections**:
  - **Update Password**: Form to set a new password (required for recovery flow).
  - **Delete Account**: Danger zone with confirmation UI (US-004).

### 1.3 Validation & Error Handling

- **Client-side**: HTML5 constraints (`required`, `type="email"`, `minlength`).
- **Server-side**:
  - Catch errors from Supabase Auth API.
  - Return `fail(status, { message })` in form actions.
  - **Common Errors**:
    - `invalid_credentials`: "Invalid email or password."
    - `user_already_exists`: "An account with this email already exists."
    - `weak_password`: "Password should be at least 6 characters."

## 2. Backend Logic

### 2.1 Server Actions (Form Handling)

All auth forms will use SvelteKit Form Actions in `+page.server.ts` files.

#### Login Action (`(auth)/login`)

1.  **Input**: `FormData` (email, password).
2.  **Process**:
    - Call `locals.supabase.auth.signInWithPassword({ email, password })`.
3.  **Outcome**:
    - **Success**: Redirect to `/dashboard`.
    - **Failure**: Return error message to generic page error block.

#### Register Action (`(auth)/register`)

1.  **Input**: `FormData` (email, password).
2.  **Process**:
    - Call `locals.supabase.auth.signUp({ email, password })`.
3.  **Outcome**:
    - **Success**:
      - If email confirmation is OFF: Session is created, redirect to `/dashboard`.
      - If email confirmation is ON: Show specific UI message "Please confirm your email".
    - **Failure**: Return error message.

#### Logout Action (`(app)/+page.server.ts` or generic action)

1.  **Process**:
    - Call `locals.supabase.auth.signOut()`.
2.  **Outcome**:
    - Redirect to `/login`.

#### Settings Actions (`(app)/settings`)

- **Update Password**:
  - Call `locals.supabase.auth.updateUser({ password: new_password })`.
  - On success, show toast/message "Password updated".
- **Delete Account**:
  - Call internal RPC `delete_own_account` or admin API (see 3.3).
  - On success, redirect to `/register` or `/login`.

### 2.2 Route Protection (`(app)/+layout.server.ts`)

- **Mechanism**: Use the `load` function in the root of the `(app)` group.
- **Logic**:
  - Check `locals.session` (populated by `hooks.server.ts`).
  - If `session` is `null`, throw `redirect(303, '/login')`.
  - This ensures all routes under `(app)/` are private.

## 3. Authentication System (Supabase)

### 3.1 Configuration

- **Provider**: Email & Password.
- **User Management**: Rely on Supabase `auth.users` table. No separate `public.profiles` table required for MVP as per Database Plan.
- **Sessions**: JWT managed via `@supabase/ssr` cookies helper (already configured in `hooks.server.ts`).

### 3.2 Recovery Flow (US-003)

1.  **Request**: User enters email on `/forgot-password`.
2.  **Supabase Action**: `resetPasswordForEmail(email, { redirectTo: '.../auth/callback?next=/settings' })`.
3.  **Email**: User receives link with code.
4.  **Callback**: Link directs to `/auth/callback` which exchanges code for session.
5.  **Redirect**: User is redirected to `/settings` where they can set a new password.

### 3.3 Account Deletion (US-004)

- **Endpoint**: Server action in `/settings`.
- **Supabase Action**: `supabase.auth.admin.deleteUser()` (requires Service Role) OR allow users to delete themselves via RLS?
  - _Standard approach_: Call an RPC function or use Supabase Management API.
  - _MVP approach_: Since users cannot delete themselves from the client SDK by default, we will likely need a server-side action using a `SERVICE_ROLE_KEY` (carefully managed) or an RPC function with `security definer` rights that executes `delete from auth.users where id = auth.uid()`.
  - _Recommendation_: Create a secure RPC function `delete_own_account()` for safety.

## 4. Implementation Steps Summary

1.  **Structure**: Create `(auth)` and `(app)` route groups. Move `dashboard` to `(app)`.
2.  **Pages**: Scaffold Login, Register, Forgot Password pages with DaisyUI card components.
3.  **Logic**: Implement `actions` in `+page.server.ts` files using `locals.supabase`.
4.  **Protection**: Add redirect logic to `(app)/+layout.server.ts`.
5.  **Callback**: Implement `/auth/callback/+server.ts` for PKCE flow.
