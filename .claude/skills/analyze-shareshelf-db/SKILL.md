# Analyze ShareShelf DB

## Purpose
Helps Claude analyze the local PostgreSQL database for the ShareShelf application to assist with debugging and query optimization.

## Instructions
1. Use the `shareshelf-db` MCP server to inspect the database schema.
2. Run SELECT queries on tables like `users`, `items`, `borrow_requests` to understand data states.
3. Help users debug issues related to missing or incorrect data.
4. Do not run destructive operations (INSERT, UPDATE, DELETE, DROP) unless the user explicitly requests them for testing purposes.
