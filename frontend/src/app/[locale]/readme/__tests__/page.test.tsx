import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/en.json";
import ReadmePage from "../page";

vi.mock("@/components/layout/Navbar", () => ({ default: () => <nav>Navbar</nav> }));
vi.mock("@/components/layout/Footer", () => ({ default: () => <footer>Footer</footer> }));

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("ReadmePage", () => {
  it("renders the readme page title", () => {
    renderWithIntl(<ReadmePage />);
    expect(screen.getByText("How to Use ShareShelf")).toBeInTheDocument();
  });

  it("renders the getting started section with steps", () => {
    renderWithIntl(<ReadmePage />);
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("1. Create an Account")).toBeInTheDocument();
    expect(screen.getByText("5. Use with Care & Return")).toBeInTheDocument();
  });

  it("renders the safety tips section", () => {
    renderWithIntl(<ReadmePage />);
    expect(screen.getByText("Safety Tips")).toBeInTheDocument();
    expect(screen.getByText(/check the owner's trust score/)).toBeInTheDocument();
  });

  it("renders the FAQ section", () => {
    renderWithIntl(<ReadmePage />);
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(screen.getByText("Is ShareShelf free to use?")).toBeInTheDocument();
    expect(screen.getByText("What if an item gets damaged?")).toBeInTheDocument();
  });

  it("renders the community rules section", () => {
    renderWithIntl(<ReadmePage />);
    expect(screen.getByText("Community Rules")).toBeInTheDocument();
    expect(screen.getByText(/Be respectful/)).toBeInTheDocument();
    expect(screen.getByText(/Report any issues immediately/)).toBeInTheDocument();
  });
});
