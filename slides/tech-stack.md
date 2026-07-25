---
marp: true
theme: default
paginate: true
---

# ShareShelf Tech Stack & AI Workflow
A community-powered tool library project.

---

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Java, Spring Boot, Spring Data JPA
- **Database**: PostgreSQL (with Flyway for migrations)
- **Deployment**: Docker, Railway
- **Mobile**: React Native / Expo

---

## Agents
- **db-assistant**: Expert database administrator and backend developer. Specialized in PostgreSQL schema inspection and writing complex JPQL queries.
- **qa-bot**: QA automation engineer focusing on ensuring code quality, running tests, and suggesting test coverage improvements.

---

## Skills
- **analyze-shareshelf-db**: Safely inspects the PostgreSQL database, validates data states, and helps debug without destructive operations.
- **test-runner**: Automatically executes backend unit and integration tests using Maven and summarizes results.

---

## Methodology
- **Project-based approach**: Feature phases planned and implemented incrementally (tracked via `.planning/ROADMAP.md`).
- **Commit-as-you-build**: Frequent, descriptive commits for every feature, refactor, and bugfix.
- **AI-Driven Development**: Deep integration of AI workflows, Subagents, and MCP for coding, debugging, and database management.

---

## Triggers
How our custom AI tools are activated:
- **Automatic Triggers**: Subagents and skills can trigger contextually based on the user's prompt (e.g., asking to "run tests" automatically matches the test-runner skill).
- **Manual Triggers**: Explicit invocation by the developer during specific lifecycle events (e.g., post-commit, pre-PR).

---

## Commands
Specific commands used to invoke our AI tooling:
- **DB Assistant**: `@db-assistant please check the schema for the items table`
- **QA Bot**: `/invoke qa-bot to verify the latest backend changes`
- **Test Runner**: `Run the test-runner skill`

---
