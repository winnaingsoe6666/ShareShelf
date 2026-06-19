---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# The Everyday Borrower
- Occasional DIY-ers, campers, students — people who need tools once or twice a year
- Neighbors tired of buying a \$200 drill for a single shelf-install job
- Community members who want to connect locally but lack a reason to reach out

**They don't need to own it — they just need to use it.**

<!-- 20s -->

---

<!-- slide 2 -->
# The "Buy It, Use Once, Store It" Problem
- Drills, tents, projectors — bought for one task, then buried in the closet forever
- Every neighbor buys the same gear; none of them share — money wasted, homes cluttered
- No simple, trustworthy way to borrow from someone nearby without awkward DMs

**We buy too much and share too little — and it costs everyone.**

<!-- 20s -->

---

<!-- slide 3 -->
# ShareShelf — A Community Tool Library
- List tools you rarely use; browse what neighbors are sharing nearby
- Full borrowing lifecycle: request → approve → pickup → return → review
- Trust & Safety built in — user ratings, reviews, and trust scores power every interaction

**A complete borrowing platform that makes sharing as easy as scrolling.**

<!-- 20s -->

---

<!-- slide 4 -->
# Built With AI, Ship With Confidence
- MCP server `shareshelf-db` — AI reads PostgreSQL schema and live data in real time
- Skill `analyze-shareshelf-db` — safe, read-only DB inspection directly from chat
- Agent `db-assistant` — expert DBA optimizing queries and debugging data models

**AI tooling didn't just help write code — it helped understand the data underneath.**

<!-- 20s -->

---

<!-- slide 5 -->
# Less Waste, More Neighbors
- Every borrow means one fewer purchase — saves money across the whole community
- Fewer idle tools manufactured, shipped, and thrown away — real environmental impact
- Every completed borrow builds a trust score — neighbors become collaborators, not strangers

**Sharing tools shrinks waste, grows savings, and weaves stronger neighborhoods.**

<!-- 20s -->

---

<!-- slide 6 -->
# What's Live & What's Next
- Repo public, deployed on Railway + Vercel — anyone can sign up and browse today
- Full workflow working: list → borrow → approve → return → review → trust score
- MCP + Skill + Agent used throughout development; `report.md` documented in team repo

**Six slides. Twenty seconds each. One working platform — live now.**

<!-- 20s -->


<!--
================================================================================
                      HOW TO PRESENT — MARP + AUTO-ADVANCE GUIDE
================================================================================

What is PechaKucha 6×20?
  6 slides × 20 seconds each = 2 minutes total.
  Each slide auto-advances after 20 seconds — no clicking, no pausing.

---

VS Code (recommended)

  1. Install "Marp for VS Code" extension:
     https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode

  2. Open this file: slides/pechakucha-6x20.md

  3. Enable auto-advance:
     Ctrl+Shift+P → "Marp: Toggle Auto-Advance"

  4. Open preview:
     Ctrl+Shift+P → "Marp: Open Preview"
     (or click the preview icon in the toolbar)

  5. Start presenting:
     Click the "present" icon (top-right of the preview panel)
     → Full-screen presentation with 20s auto-advance.

---

Marp CLI

  Install:
    npm install -g @marp-team/marp-cli

  Preview with auto-advance:
    marp --preview slides/pechakucha-6x20.md

  Export to PDF:
    marp slides/pechakucha-6x20.md -o slides/output.pdf

  Export to HTML:
    marp slides/pechakucha-6x20.md -o slides/output.html

  Export to PowerPoint:
    marp slides/pechakucha-6x20.md -o slides/output.pptx

---

How the frontmatter controls the deck

  ---
  marp: true            # Enable Marp rendering
  paginate: true        # Show slide numbers (1/6, 2/6, ...)
  transition: fade      # Smooth fade between slides
  auto-advance: 20      # Auto-advance every 20 seconds
  ---

  The comment "<!-- 20s -->" under each slide marks the timing for that slide.

---

Rehearsal tips

  1. Time your talking points — exactly 20 seconds per slide. Practice until
     your spoken content fits the auto-advance.

  2. Don't read the bullets verbatim — the audience can read. Use them as
     anchors and expand on each point.

  3. The bold punchline at the bottom of each slide is your retention line —
     let it land. Pause slightly before the auto-advance fires.

  4. Run it twice before presenting — the auto-advance feels fast the first
     time. Muscle memory helps.

================================================================================
-->
