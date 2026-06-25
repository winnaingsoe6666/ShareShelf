---
phase: quick
plan: vlx
type: execute
subsystem: configuration
tags: [mcp, settings, trust]
depends_on: []
requires: []
provides: [mcp-server-trust-config]
affects: [.claude/settings.json]
tech-stack:
  added: []
  patterns: []
key-files:
  modified:
    - .claude/settings.json
decisions:
  - "Enable all project MCP servers by default via enableAllProjectMcpServers: true"
metrics:
  duration: "2m 30s"
  completed_date: "2026-06-19T22:50:00Z"
---

# Phase quick Plan vlx: Enable Project MCP Servers via settings.json

**One-liner:** Added `enableAllProjectMcpServers: true` to `.claude/settings.json` so the project configures team-wide trust for the 6 MCP servers defined in `.mcp.json`.

## Summary

Added `"enableAllProjectMcpServers": true` as a top-level key in `.claude/settings.json`, placed alongside the existing `"enabledPlugins"` block. This setting enables Claude CLI to trust all MCP servers declared in the project's `.mcp.json` (shareshelf-db, memory, sequential-thinking, github, playwright, filesystem) without requiring individual user approval.

The existing `"enabledPlugins": { "ui-ux-pro-max@ui-ux-pro-max-skill": true }` block was preserved unchanged. The file remains valid JSON with exactly two top-level keys.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add enableAllProjectMcpServers to settings.json | e540c85 | .claude/settings.json (+2/-1) |

## Verification

- `grep -c '"enableAllProjectMcpServers"' .claude/settings.json` returns 1
- Python JSON validation: `enableAllProjectMcpServers` is `True`, `enabledPlugins` block preserved, exactly two top-level keys
- File is valid JSON

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- File exists: `/home/wns/winnaingsoe6666/ShareShelf/.claude/worktrees/agent-a4965df05068e8464/.claude/settings.json` — FOUND
- Commit exists: `e540c85` — FOUND (`git log --oneline -1` confirms)
- SUMMARY.md created: `.planning/quick/260619-vlx-add-enableallprojectmcpservers-true-to-c/260619-vlx-SUMMARY.md` — FOUND
