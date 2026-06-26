import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewItemPage from "../page";

const mockPush = vi.fn();

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(() => true),
  getUser: vi.fn(() => ({ id: 1, name: "Test", email: "t@t.com", trustScore: 4.5 })),
  getToken: vi.fn(() => "mock-token"),
  clearAuth: vi.fn(),
  saveAuth: vi.fn(),
}));

const itemNewTranslations: Record<string, string> = {
  "itemNew.title": "Add New Item",
  "itemNew.itemTitle": "Item Title",
  "itemNew.titlePlaceholder": "e.g., Power Drill, Camping Tent",
  "itemNew.description": "Description",
  "itemNew.descPlaceholder": "Describe your item...",
  "itemNew.dailyPrice": "Daily Price (MMK)",
  "itemNew.deposit": "Deposit Amount (MMK)",
  "itemNew.category": "Category",
  "itemNew.selectCategory": "Select a category",
  "itemNew.location": "Location",
  "itemNew.locationHint": "Click on the map to set your item's location",
  "itemNew.images": "Images",
  "itemNew.submit": "Create Item",
  "itemNew.failed": "Failed to create item.",
};

vi.mock("next-intl", () => ({
  useLocale: vi.fn(() => "en"),
  useTranslations: vi.fn(() => (key: string) => itemNewTranslations[key] || key),
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: vi.fn(() => ({ push: mockPush })),
}));
vi.mock("@/components/layout/Navbar", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));
vi.mock("next/dynamic", () => ({
  default: () => {
    const MockLocationPicker = ({ latitude, longitude, onChange, onClear, disabled }: any) => (
      <div data-testid="location-picker">
        <span data-testid="lp-lat">{String(latitude)}</span>
        <span data-testid="lp-lng">{String(longitude)}</span>
        <button data-testid="lp-set" onClick={() => onChange?.(16.84, 96.17)} disabled={disabled}>Set Location</button>
        <button data-testid="lp-clear" onClick={() => onClear?.()} disabled={disabled}>Clear</button>
      </div>
    );
    MockLocationPicker.displayName = "MockLocationPicker";
    return MockLocationPicker;
  },
}));
vi.mock("@/components/ui/ImageUpload", () => ({
  default: ({ images, onUpload, onRemove, disabled, uploading, maxFiles }: any) => (
    <div data-testid="image-upload">
      <span data-testid="image-count">{images?.length ?? 0}</span>
      <button data-testid="image-upload-add" onClick={() => onUpload?.(new File(["dummy"], "test.png", { type: "image/png" }))} disabled={disabled}>Add Image</button>
      <button data-testid="image-upload-remove" onClick={() => onRemove?.("/test.png")} disabled={disabled}>Remove</button>
      <span data-testid="uploading">{String(uploading)}</span>
      <span data-testid="max-files">{maxFiles}</span>
    </div>
  ),
}));

import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

const mockApiGet = api.get as ReturnType<typeof vi.fn>;
const mockApiPost = api.post as ReturnType<typeof vi.fn>;

describe("NewItemPage", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  const renderPage = () => render(<NewItemPage />);

  it("renders form when authenticated", async () => {
    mockApiGet.mockResolvedValue({ data: { data: [{ id: 1, name: "Tools" }] } });
    renderPage();
    await waitFor(() => { expect(screen.getByText("Tools")).toBeTruthy(); });
    expect(screen.getByText("Add New Item")).toBeTruthy();
    expect(screen.getByText("Create Item")).toBeTruthy();
  });

  it("fetches categories from API on mount", async () => {
    mockApiGet.mockResolvedValue({ data: { data: [{ id: 1, name: "Tools" }] } });
    renderPage();
    await waitFor(() => { expect(mockApiGet).toHaveBeenCalledWith("/categories"); });
  });

  it("shows loading state while categories load", async () => {
    let r!: (v: unknown) => void;
    const d = new Promise((res) => { r = res; });
    mockApiGet.mockReturnValue(d);
    renderPage();
    await waitFor(() => { expect(screen.getByText(/loading categories/i)).toBeTruthy(); });
    (r as any)!({ data: { data: [] } });
  });

  it("shows error when categories API fails", async () => {
    mockApiGet.mockRejectedValue(new Error("fail"));
    renderPage();
    await waitFor(() => { expect(screen.getByText(/failed to load/i)).toBeTruthy(); });
  });

  it("shows empty state when no categories", async () => {
    mockApiGet.mockResolvedValue({ data: { data: [] } });
    renderPage();
    await waitFor(() => { expect(screen.getByText(/no categories available/i)).toBeTruthy(); });
  });

  it("redirects to /login when not authenticated", async () => {
    (isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(false);
    mockApiGet.mockResolvedValue({ data: { data: [] } });
    renderPage();
    await waitFor(() => { expect(mockPush).toHaveBeenCalledWith("/login"); });
  });

  it("renders ImageUpload component with zero images on the new item form", async () => {
    mockApiGet.mockResolvedValue({ data: { data: [{ id: 1, name: "Tools" }] } });
    renderPage();
    await waitFor(() => { expect(screen.getByTestId("image-upload")).toBeTruthy(); });
    expect(screen.getByTestId("image-count").textContent).toBe("0");
  });

  it("uploads images after creating the item", async () => {
    const user = userEvent.setup();
    mockApiGet.mockResolvedValue({ data: { data: [{ id: 1, name: "Tools" }] } });
    // First API call: POST /items returns success with item id 99
    mockApiPost.mockResolvedValueOnce({
      data: { success: true, data: { id: 99 } },
    });
    // Subsequent call: POST /items/99/images returns success
    mockApiPost.mockResolvedValueOnce({
      data: { success: true },
    });
    renderPage();

    // Wait for the form to render
    await waitFor(() => { expect(screen.getByTestId("image-upload")).toBeTruthy(); });

    // Click the Add Image button to add a file
    await user.click(screen.getByTestId("image-upload-add"));

    // Fill in the title (required)
    const titleInput = screen.getByLabelText("Item Title *");
    await user.type(titleInput, "Test Item");

    // Submit the form
    await user.click(screen.getByText("Create Item"));

    // Verify POST /items was called
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith("/items", expect.objectContaining({ title: "Test Item" }));
    });

    // Verify POST /items/99/images was called with FormData
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith("/items/99/images", expect.any(FormData));
    });

    // Should navigate to the created item
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/items/99");
    });
  });
});
