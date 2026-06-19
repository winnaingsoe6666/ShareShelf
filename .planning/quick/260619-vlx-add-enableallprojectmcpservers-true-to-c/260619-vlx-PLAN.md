---
phase: quick
plan: vlx
type: execute
wave: 1
depends_on: []
files_modified:
  - .claude/settings.json
autonomous: true
requirements: []

must_haves:
  truths:
    - ".claude/settings.json contains enableAllProjectMcpServers: true at the top level"
  artifacts:
    - path: ".claude/settings.json"
      provides: "Claude CLI project settings with MCP server trust enabled"
      contains: "\"enableAllProjectMcpServers\": true"
  key_links: []
---

<objective>
Add `enableAllProjectMcpServers: true` to `.claude/settings.json` so the project configures team-wide trust for the 6 MCP servers defined in `.mcp.json` (shareshelf-db, memory, sequential-thinking, github, playwright, filesystem).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.claude/settings.json (current state: only enabledPlugins.ui-ux-pro-max defined)
@.mcp.json (defines 6 MCP servers: shareshelf-db, memory, sequential-thinking, github, playwright, filesystem)
</context>

<tasks>

<task type="auto">
  <name>Task: Add enableAllProjectMcpServers to settings.json</name>
  <files>.claude/settings.json</files>
  <action>
    Read .claude/settings.json, parse as JSON, add top-level key "enableAllProjectMcpServers" with value true,
    and write back the file preserving the existing "enabledPlugins" block and all formatting.
    The resulting JSON must have exactly two top-level keys: "enabledPlugins" (unchanged) and "enableAllProjectMcpServers" (new).
  </action>
  <verify>
    <automated>grep -c '"enableAllProjectMcpServers"' /home/wns/winnaingsoe6666/ShareShelf/.claude/settings.json | grep '1'</automated>
  </verify>
  <done>.claude/settings.json has enableAllProjectMcpServers: true as a top-level key, side-by-side with the existing enabledPlugins block</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| MCP servers -> local system | The 6 MCP servers (postgres, memory, sequential-thinking, github, playwright, filesystem) all run locally via npx; github server requires GITHUB_TOKEN env var; postgres server connects to localhost:5432 |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-vlx-01 | Information Disclosure | shareshelf-db MCP | accept | Server connects to localhost:5432 only; no remote exposure. Accepting as local-only risk. |
| T-vlx-02 | Elevation of Privilege | github MCP | accept | Requires GITHUB_TOKEN from user's environment; token scope limits blast radius. |
| T-vlx-03 | Tampering | filesystem MCP | accept | Server scoped to project root ("."); cannot access outside the repo. |
</threat_model>

<verification>
- Confirm `grep -c '"enableAllProjectMcpServers"' .claude/settings.json` returns 1
- Confirm `jq '.enableAllProjectMcpServers' .claude/settings.json` returns `true`
- Confirm existing `enabledPlugins` block is preserved with `jq '.enabledPlugins' .claude/settings.json`
</verification>

<success_criteria>
- `.claude/settings.json` has `"enableAllProjectMcpServers": true` as a top-level JSON key
- No existing keys are modified or removed
- The file remains valid JSON
</success_criteria>

<output>
Create `.planning/quick/260619-vlx-add-enableallprojectmcpservers-true-to-c/260619-vlx-SUMMARY.md` when done
</output>
