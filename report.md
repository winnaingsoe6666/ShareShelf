# ch-3 Personal Project — Report

github_username: winnaingsoe6666
personal_repo_url: https://github.com/winnaingsoe6666/ShareShelf
project_summary: A community-powered tool library that lets neighbors borrow and lend rarely used tools and equipment — saving money, reducing waste, and building community trust.
slides_url: slides/pechakucha-6x20.md

## Methodology
Project-based approach: each feature phase (auth, items, borrowing, reviews, search, i18n, notifications) was planned and implemented incrementally, tracked via `.planning/STATE.md` and `.planning/ROADMAP.md`. Git workflow followed commit-as-you-build — every feature, refactor, and bugfix committed separately with descriptive messages. Claude Code was used throughout for implementation, debugging, code review, and test generation, with MCP/Skill/Agent tooling providing direct database access and domain-specific assistance.

## Evidence — Claude Code usage

### MCP
- path: .mcp.json
- what: `shareshelf-db` MCP server using `@modelcontextprotocol/server-postgres` — provides secure, read-only access to the local PostgreSQL database for schema inspection, data validation, and query optimization during development. Also configured: `memory` (knowledge graph persistence), `sequential-thinking` (complex reasoning), `github` (repository management), `playwright` (browser automation), and `filesystem` (file access).

### Skill
- path: .claude/skills/analyze-shareshelf-db/SKILL.md
- what: Guides Claude to safely analyze the ShareShelf PostgreSQL database — inspects tables (`users`, `items`, `borrow_requests`, `reviews`, `categories`), runs SELECT queries to debug data states, and enforces read-only access (no destructive operations without explicit user request).

### Agent
- path: .claude/agents/db-assistant.md
- what: Expert database administrator and backend developer agent specialized in PostgreSQL and Spring Data JPA for ShareShelf. Contains full schema reference (all tables, columns, relationships), entity/repository file locations, Flyway migration history, common debugging queries, and JPA query patterns. Used to debug data inconsistencies, write SQL/JPQL queries, and optimize database interactions.
