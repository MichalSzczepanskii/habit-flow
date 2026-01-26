# HabitFlow

HabitFlow is a responsive web application designed to help users build and maintain daily habits through a streamlined, low-friction interface.

The application focuses on the core mechanics of habit formation—consistency and visual progression—replacing tedious manual tracking with an automated system that calculates streaks and visualizes daily progress. Designed with a mobile-first philosophy, HabitFlow helps users overcome the "all-or-nothing" trap by implementing a unique 3:00 AM grace period for daily resets.

## Table of Contents

- [Tech Stack](#-tech-stack)
- [Getting Started Locally](#-getting-started-locally)
- [Available Scripts](#-available-scripts)
- [Project Scope (MVP)](#-project-scope-mvp)
- [Project Status](#-project-status)
- [License](#-license)

## 🚀 Tech Stack

**Frontend**

- **Framework:** [SvelteKit 5](https://kit.svelte.dev/)
- **UI Library:** [Svelte 5](https://svelte.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Components:** [DaisyUI 5](https://daisyui.com/)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)

**Backend & Data**

- **BaaS:** [Supabase](https://supabase.com/) (Authentication & Database)

**Tooling & Quality**

- **Build Tool:** [Vite](https://vitejs.dev/)
- **Unit Testing:** [Vitest](https://vitest.dev/)
- **E2E Testing:** [Playwright](https://playwright.dev/)
- **Linting/Formatting:** ESLint, Prettier

## 🛠 Getting Started Locally

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js**: Version `24.13.0` (as specified in `.nvmrc`).
- **npm**: Included with Node.js.

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd habit-flow
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Setup**
    This project uses Supabase for backend services. You will need to configure your environment variables.

    Create a `.env` file in the root directory and add your Supabase credentials (URL and Anon Key).

4.  **Start the development server**
    ```bash
    npm run dev
    ```

## 📜 Available Scripts

In the project directory, you can run the following scripts:

| Script              | Description                                        |
| :------------------ | :------------------------------------------------- |
| `npm run dev`       | Starts the development server using Vite.          |
| `npm run build`     | Builds the app for production.                     |
| `npm run preview`   | Locally previews the production build.             |
| `npm run check`     | Syncs SvelteKit and runs TypeScript type checking. |
| `npm run lint`      | Runs Prettier check and ESLint.                    |
| `npm run format`    | Formats code using Prettier.                       |
| `npm run test`      | Runs both unit and end-to-end tests.               |
| `npm run test:unit` | Runs unit tests with Vitest.                       |
| `npm run test:e2e`  | Runs end-to-end tests with Playwright.             |

## 🎯 Project Scope (MVP)

The current version of HabitFlow is an MVP (Minimum Viable Product) focusing on essential habit tracking features.

### Key Features

- **Habit Management**: Create, read, edit, and delete daily habits.
- **User Authentication**: Secure sign-up, login, password recovery, and account deletion via Supabase.
- **Smart Streaks**: Automatic streak calculation with a 3:00 AM local grace period (night-owl friendly).
- **Visual Feedback**: Real-time progress bars and visual completion states.
- **Mobile-First Design**: Optimized for usage on mobile devices.

### Out of Scope (Current Phase)

- Advanced Analytics (History charts, heatmaps).
- Notifications (Push, SMS, Email).
- Gamification (XP, Levels, Badges).
- Social Features (Sharing, Leaderboards).
- Flexible Scheduling (e.g., "3 times a week").

## 📌 Project Status

🚧 **MVP Phase** - Active Development

The project is currently in the MVP phase, focusing on delivering core functionality for daily habit tracking and persistence.

## 📄 License

This project is private and proprietary (`"private": true` in `package.json`).
