/**
 * ShareShelf Design Tokens
 *
 * Typed exports of all design system tokens defined in globals.css.
 * Use these for programmatic access to colors, spacing, fonts, and shadows.
 *
 * For Tailwind classes, prefer inline utility classes directly.
 * These tokens are for JS-driven styling (e.g., chart colors, dynamic styles).
 */

/* ------------------------------------------------------------------ */
/* Colors                                                              */
/* ------------------------------------------------------------------ */

export const colors = {
  primary: "#7C3AED",
  onPrimary: "#FFFFFF",
  secondary: "#A78BFA",
  accent: "#16A34A",
  background: "#FAF5FF",
  foreground: "#4C1D95",
  muted: "#ECEEF9",
  border: "#DDD6FE",
  destructive: "#DC2626",
  ring: "#7C3AED",
} as const;

export const purple = {
  50: "#FAF5FF",
  100: "#F3E8FF",
  200: "#DDD6FE",
  300: "#C4B5FD",
  400: "#A78BFA",
  500: "#8B5CF6",
  600: "#7C3AED",
  700: "#6D28D9",
  800: "#5B21B6",
  900: "#4C1D95",
} as const;

export const green = {
  600: "#16A34A",
  700: "#15803D",
} as const;

/* ------------------------------------------------------------------ */
/* Spacing                                                             */
/* ------------------------------------------------------------------ */

export const space = {
  xs: "0.25rem", // 4px
  sm: "0.5rem",  // 8px
  md: "1rem",    // 16px
  lg: "1.5rem",  // 24px
  xl: "2rem",    // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
} as const;

/* ------------------------------------------------------------------ */
/* Shadows                                                             */
/* ------------------------------------------------------------------ */

export const shadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px rgba(0, 0, 0, 0.15)",
} as const;

/* ------------------------------------------------------------------ */
/* Fonts                                                               */
/* ------------------------------------------------------------------ */

export const fonts = {
  heading: "'Cormorant Garamond', Georgia, serif",
  body: "'Crimson Pro', 'Times New Roman', serif",
  display: "'Cinzel', Georgia, serif",
} as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Look up a token by dot-separated path.
 * Example: getToken("colors.primary") → "#7C3AED"
 */
export function getToken(path: string): string | undefined {
  const parts = path.split(".");
  let current: Record<string, unknown> = { colors, purple, green, space, shadows, fonts };
  for (const part of parts) {
    const next = current[part];
    if (next === undefined) return undefined;
    if (typeof next === "string") return next;
    current = next as Record<string, unknown>;
  }
  return undefined;
}
