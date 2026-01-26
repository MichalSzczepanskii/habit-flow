You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## Always Run Lint

- Before suggesting, editing, or committing any code changes, run `npm run lint` to check for issues.
- If lint reports errors or warnings, run `npm run lint -- --fix` to auto-fix fixable problems.
- Verify fixes by re-running `npm run lint` and confirm clean output before proceeding.
- Only propose code that passes lint; explain any remaining issues and suggest manual fixes.

## When to Lint

- After any code modifications, imports changes, or refactoring.
- During debugging: Lint first to rule out style issues mimicking bugs.
- Pre-PR: Include lint output in your response, e.g., "Lint passed: no issues found."
- Integrate into workflows: Suggest `npm run lint` chains.

## Project Scripts

- `npm run lint`: Full project lint check (e.g., ESLint, Prettier).[web:12]
- `npm run lint -- --fix`: Auto-fix lint issues.
- Run on changed files when possible: `npm run lint -- path/to/file.ts` for efficiency.[web:21]

## Additional Rules

- Never ignore lint failures; fix or justify exemptions.
