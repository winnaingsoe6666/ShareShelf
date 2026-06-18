import { describe, it, expect } from "vitest";
import { formatPrice, formatDate, cn } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats a dollar amount with two decimal places", () => {
    expect(formatPrice(10)).toBe("$10.00");
  });

  it("formats fractional amounts", () => {
    expect(formatPrice(0.5)).toBe("$0.50");
  });

  it('returns "Free" for null', () => {
    expect(formatPrice(null as never)).toBe("Free");
  });

  it('returns "Free" for undefined', () => {
    expect(formatPrice(undefined)).toBe("Free");
  });

  it("formats zero correctly", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });
});

describe("formatDate", () => {
  it("returns a formatted date string for a valid date", () => {
    const result = formatDate("2026-01-15T12:00:00Z");
    expect(result).toMatch(/Jan 15, 2026/);
  });

  it("returns empty string for undefined", () => {
    expect(formatDate(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(formatDate("")).toBe("");
  });
});

describe("cn", () => {
  it("joins multiple truthy classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, "b", null, "c", undefined)).toBe("a b c");
  });

  it("filters boolean and null/undefined values", () => {
    expect(cn("base", true && "active", false && "hidden")).toBe("base active");
  });

  it("returns empty string for all falsy inputs", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("handles single class", () => {
    expect(cn("only")).toBe("only");
  });
});
