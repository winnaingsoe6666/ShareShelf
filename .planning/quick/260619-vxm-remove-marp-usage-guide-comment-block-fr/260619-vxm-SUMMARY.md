# Quick Task 260619-vxm: Remove Marp Usage Guide Comment Block

**Completed:** 2026-06-19
**Commit:** 729dd9c
**Duration:** < 5 minutes

## One-liner

Removed trailing HTML comment block (Marp usage guide) from the PechaKucha deck that contained `---` separators incorrectly parsed as slide breaks by Marp.

## What Changed

**File:** `slides/ShareShelf_product_intro.md`

- Removed lines 80-159: the `<!-- HOW TO PRESENT ...` through `-->` HTML comment block
- The removed block contained `---` separators inside the comment, which Marp parsed as additional slide breaks, creating phantom slides beyond the intended 6-slide PechaKucha deck
- File now ends at line 77 (`<!-- 20s -->` for slide 6) with no trailing blank lines
- Frontmatter (`marp: true`, `auto-advance: 20`) and all 6 slides preserved exactly

## Verification

- `grep -n '^---$'` shows exactly 7 `---` lines: frontmatter opener/closer (2) + 5 slide separators for 6 slides — correct
- File ends at line 77 with the final `<!-- 20s -->` comment, no trailing whitespace
- The Marp usage guide content was already replicated in a separate README (commit be238af)

## Deviations from Plan

None — executed exactly as written.

## Self-Check: PASSED

- [x] File exists and ends at line 77: `slides/ShareShelf_product_intro.md`
- [x] Commit exists: `729dd9c`
