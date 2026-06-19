import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/en.json";
import AboutPage from "../page";

vi.mock("@/components/layout/Navbar", () => ({ default: () => <nav>Navbar</nav> }));
vi.mock("@/components/layout/Footer", () => ({ default: () => <footer>Footer</footer> }));

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("AboutPage", () => {
  it("renders the about page title", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("About ShareShelf")).toBeInTheDocument();
  });

  it("renders the story section", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("Our Story")).toBeInTheDocument();
  });

  it("renders the mission section", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("Our Mission")).toBeInTheDocument();
  });

  it("renders the values section", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("Our Values")).toBeInTheDocument();
    expect(screen.getByText("Trust")).toBeInTheDocument();
    expect(screen.getByText("Sharing")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(screen.getByText("Sustainability")).toBeInTheDocument();
  });

  it("renders the CTA section with get started link", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("Join Your Neighborhood Tool Library")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Get Started/i })).toBeInTheDocument();
  });
});
