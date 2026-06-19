# Slides Guide — PechaKucha 6×20

This project uses [Marp](https://marp.app/) to render the PechaKucha deck from Markdown.

## What is PechaKucha 6×20?

**6 slides × 20 seconds each = 2 minutes total.** Each slide auto-advances after 20 seconds — no clicking, no pausing. The speaker presents tight, focused content that matches the auto-advancing slides.

## Quick Start

### VS Code (recommended)

1. Install the [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) extension
2. Open `slides/pechakucha-6x20.md`
3. Press `Ctrl+Shift+P` → **"Marp: Toggle Auto-Advance"** to enable the 20s timer
4. Press `Ctrl+Shift+P` → **"Marp: Open Preview"** (or click the preview icon in the toolbar)
5. Click the **present** icon (top-right of the preview panel) to start full-screen presentation

### Marp CLI

```bash
# Install Marp CLI
npm install -g @marp-team/marp-cli

# Preview with auto-advance (browser opens automatically)
marp --preview slides/pechakucha-6x20.md

# Export to PDF
marp slides/pechakucha-6x20.md -o slides/output.pdf

# Export to HTML
marp slides/pechakucha-6x20.md -o slides/output.html

# Export to PowerPoint (PPTX)
marp slides/pechakucha-6x20.md -o slides/output.pptx
```

## How It Works

The frontmatter at the top of the slide file controls everything:

```yaml
---
marp: true            # Enable Marp rendering
paginate: true        # Show slide numbers (1/6, 2/6, ...)
transition: fade      # Smooth fade between slides
auto-advance: 20      # Auto-advance every 20 seconds
---
```

- **`auto-advance: 20`** — each slide stays visible for 20 seconds, then transitions automatically
- **`<!-- slide N -->`** — marks where each slide begins (for your own reference)
- **`<!-- 20s -->`** — comment noting the duration per slide

## Rehearsal Tips

1. **Time your talking points** — you have exactly 20 seconds per slide. Practice until your spoken content fits the auto-advance.
2. **Don't read the bullets verbatim** — the audience can read. Use the bullets as anchors, and expand on each point in your own words.
3. **The bold punchline** at the bottom of each slide is your retention line — let it land. Pause slightly before moving on.
4. **Run it twice** before presenting — the auto-advance feels fast the first time. Muscle memory helps.

## File

| File | Description |
|------|-------------|
| [`pechakucha-6x20.md`](./pechakucha-6x20.md) | The 6-slide PechaKucha deck |

## Resources

- [Marp documentation](https://marpit.marp.app/)
- [Marp CLI GitHub](https://github.com/marp-team/marp-cli)
- [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode)
