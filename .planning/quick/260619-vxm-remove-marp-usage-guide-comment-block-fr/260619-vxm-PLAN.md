---
quick_id: 260619-vxm
phase: quick
plan: vxm
type: execute
wave: 1
depends_on: []
files_modified:
  - slides/ShareShelf_product_intro.md
autonomous: true
requirements: []
user_setup: []

must_haves:
  truths:
    - "Marp renders exactly 6 slides (the 6 PechaKucha slides), no phantom extras"
    - "The frontmatter (marp: true, auto-advance: 20) is preserved"
    - "All 6 real slide sections (slide 1 through slide 6) are untouched"
  artifacts:
    - path: "slides/ShareShelf_product_intro.md"
      provides: "6-slide PechaKucha deck with no trailing HTML comment block"
      contains: "<!-- slide 6 -->"
      not_contains: "HOW TO PRESENT — MARP + AUTO-ADVANCE GUIDE"
  key_links: []
---

<objective>
Remove the trailing HTML comment block (lines 80-159) from `slides/ShareShelf_product_intro.md`.
This block contains Marp usage guides, CLI instructions, and rehearsal tips wrapped in an HTML comment,
but it uses `---` separators internally that Marp parses as slide breaks, creating 4 phantom slides
and inflating the deck from 6 to 10 slides.

Purpose: Restore the correct 6-slide PechaKucha deck so Marp renders exactly what the frontmatter
declares (6 slides, 20s auto-advance each).

Output: A clean `slides/ShareShelf_product_intro.md` with exactly 6 slides and no trailing comment block.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@slides/ShareShelf_product_intro.md
</context>

<tasks>

<task type="auto">
  <name>Task: Remove trailing HTML comment block causing phantom slides</name>
  <files>slides/ShareShelf_product_intro.md</files>
  <action>
Remove the HTML comment block at the end of `slides/ShareShelf_product_intro.md`.
The block spans from the blank line after slide 6's closing `&lt;!-- 20s --&gt;` (line 79)
through the end of the file (line 159).

The block to remove is lines 80-159 — starting with the empty line that separates slide 6
from the comment, continuing through the `&lt;!--` opening tag, and ending with the `--&gt;`
closing tag and the final newline.

Specifically, delete everything from the blank line at line 80 through the end of the file,
so the file ends cleanly after slide 6's `&lt;!-- 20s --&gt;` marker (line 77) plus a single
trailing newline. No trailing whitespace, no extra blank lines at end of file.

Do NOT modify the frontmatter (lines 1-7) or any of the 6 slide sections (lines 9-77).
The frontmatter must remain:
  ---
  marp: true
  paginate: true
  transition: fade
  auto-advance: 20
  ---

Verify after removal:
- `grep -c '^---$' slides/ShareShelf_product_intro.md` returns exactly 7 (one frontmatter open,
  one frontmatter close, five slide separators)
- `grep -c 'HOW TO PRESENT' slides/ShareShelf_product_intro.md` returns 0
- The last content line is `&lt;!-- 20s --&gt;` (slide 6's timing marker)
  </action>
  <verify>
    <automated>grep -c '^---$' slides/ShareShelf_product_intro.md</automated>
    expects 7
  </verify>
  <done>
The file contains exactly 6 slides. No HTML comment block remains. `grep -c '^---$'` returns 7
(one frontmatter open, one frontmatter close, five inter-slide separators).
`grep 'HOW TO PRESENT'` returns no matches.
Marp renders 6 slides with 20s auto-advance each.
  </done>
</task>

</tasks>

<verification>
1. Count `---` separators: `grep -c '^---$' slides/ShareShelf_product_intro.md` — must be exactly 7
2. Confirm slide 6 content intact: `grep "What's Live" slides/ShareShelf_product_intro.md` — must return 1 match
3. Confirm comment removed: `grep 'HOW TO PRESENT' slides/ShareShelf_product_intro.md` — must return 0 matches
4. Confirm frontmatter intact: `grep 'auto-advance: 20' slides/ShareShelf_product_intro.md` — must return 1 match
</verification>

<success_criteria>
- `slides/ShareShelf_product_intro.md` ends after slide 6's `&lt;!-- 20s --&gt;` marker
- No HTML comment block containing Marp guides, CLI instructions, or rehearsal tips
- Marp renders exactly 6 slides (confirmed by `grep -c '^---$'` returning 7)
- Frontmatter preserved as-is (`marp: true`, `auto-advance: 20`)
</success_criteria>

<output>
Commit the change with a descriptive message. No SUMMARY.md needed for quick tasks.
</output>
