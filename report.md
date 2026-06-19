# Chapter 3 Report

## Student Information

- **GitHub Username:** `winnaingsoe6666`
- **Repository URL:** `https://github.com/winnaingsoe6666/ShareShelf.git`
- **Submission Date:** `2026-06-16`

---

## Repository Information

### Repository Owner

`winnaingsoe6666`

### Repository Name

`ShareShelf`

### Branch

`main`

---

## Implemented Features

The following key features have been developed for the ShareShelf application:

- **Core Functionality**: User authentication (JWT), item management (CRUD with photo uploads), and a complete borrowing workflow (request, approve, reject, return).
- **Community Tools**: Search & discovery by category, reviews and 1-5 star ratings with trust scores, and community statistics.
- **In-app Notifications**: A robust notification system to track user activity and item requests.
- **Internationalization (i18n)**: Multi-language support for a diverse user base.
- **Reliability & Deployment**: Comprehensive testing suite (Vitest, Playwright, JUnit, MockK) and deployment configuration via Docker and Railway.

---

## MCP Configuration

### MCP Used

- MCP Name: `shareshelf-db`
- Purpose: `Provides secure access to the ShareShelf PostgreSQL database to inspect tables and execute queries.`

### Evidence

```text
.mcp.json
```

---

## Skill Implementation

### Skill Name

`analyze-shareshelf-db`

### Purpose

Helps Claude analyze the local PostgreSQL database for the ShareShelf application to assist with debugging and query optimization.

### Evidence

```text
.claude/skills/analyze-shareshelf-db/SKILL.md
```

---

## Agent Implementation

### Agent Name

`db-assistant`

### Purpose

Expert database administrator and backend developer specializing in PostgreSQL. Assists in debugging data inconsistencies and writing SQL/JPQL queries.

### Evidence

```text
.claude/agents/db-assistant.md
```

---

## Methodology

Describe how you implemented and tested:

1. MCP integration: Configured `@modelcontextprotocol/server-postgres` in `.mcp.json` pointing to the local dev database.
2. Skill creation: Wrote a markdown guide `SKILL.md` explaining how AI should interact with the database safely.
3. Agent creation: Created a profile `db-assistant.md` defining responsibilities and capabilities, specifically referencing the created skill.
4. Validation process: Tested the configuration by prompting AI to inspect tables and generate queries, ensuring read-only constraints were followed.

---

## Slides

### Marp Presentation Location

```text
slides/pechakucha-6x20.md
```

---
