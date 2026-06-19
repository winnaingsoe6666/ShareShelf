import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageUpload from "../ImageUpload";

vi.mock("@/components/ui/Spinner", () => ({
  default: () => <div data-testid="spinner" />,
}));

describe("ImageUpload", () => {
  let onUpload: ReturnType<typeof vi.fn>;
  let onRemove: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onUpload = vi.fn().mockResolvedValue(undefined);
    onRemove = vi.fn();
  });

  const renderComponent = (props: Partial<Parameters<typeof ImageUpload>[0]> = {}) =>
    render(
      <ImageUpload
        images={props.images ?? []}
        onUpload={props.onUpload ?? onUpload}
        onRemove={props.onRemove ?? onRemove}
        disabled={props.disabled}
        maxFiles={props.maxFiles}
        uploading={props.uploading}
      />
    );

  it("renders Add Image button when no images exist and not at maxFiles limit", () => {
    renderComponent();
    expect(screen.getByText("Add Image")).toBeTruthy();
  });

  it("shows each existing image URL as a thumbnail with X remove button", () => {
    renderComponent({ images: ["/uploads/1.jpg", "/uploads/2.jpg"] });
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0].getAttribute("src")).toBe("/uploads/1.jpg");
    expect(images[1].getAttribute("src")).toBe("/uploads/2.jpg");
    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    expect(removeButtons).toHaveLength(2);
  });

  it("clicking X remove button on an image calls onRemove with that image URL", async () => {
    const user = userEvent.setup();
    renderComponent({ images: ["/uploads/1.jpg", "/uploads/2.jpg"] });
    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await user.click(removeButtons[1]);
    expect(onRemove).toHaveBeenCalledWith("/uploads/2.jpg");
  });

  it("selecting a file via hidden input calls onUpload with the File object", async () => {
    const user = userEvent.setup();
    renderComponent();
    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const input = screen.getByTestId("file-input");
    await user.upload(input, file);
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it("shows preview of selected file via URL.createObjectURL before upload completes", async () => {
    const mockUrl = "blob:preview-url";
    vi.spyOn(URL, "createObjectURL").mockReturnValue(mockUrl);
    const user = userEvent.setup();
    // Return a never-resolving promise so preview stays visible
    onUpload.mockReturnValue(new Promise(() => {}));
    renderComponent();
    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const input = screen.getByTestId("file-input");
    await user.upload(input, file);
    expect(screen.getByAltText("Preview")).toBeTruthy();
    vi.restoreAllMocks();
  });

  it("shows loading spinner on the uploading tile when uploading is true", () => {
    renderComponent({ uploading: true, images: ["/uploads/loading-test.jpg"] });
    // The uploading tile is the last "image" tile that should show a spinner
    expect(screen.getByTestId("spinner")).toBeTruthy();
  });

  it("shows error indicator on a tile when errorUrls includes the URL", async () => {
    const user = userEvent.setup();
    onUpload.mockRejectedValue(new Error("Upload failed"));
    renderComponent();
    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const input = screen.getByTestId("file-input");
    await user.upload(input, file);
    await waitFor(() => {
      expect(screen.getByText("Upload failed")).toBeTruthy();
    });
  });

  it("hides the Add Image button when current image count reaches maxFiles", () => {
    renderComponent({ images: ["/1.jpg", "/2.jpg", "/3.jpg"], maxFiles: 3 });
    expect(screen.queryByText("Add Image")).toBeNull();
  });

  it('shows "max N images" hint text below the grid', () => {
    renderComponent({ maxFiles: 3 });
    expect(screen.getByText(/max 3 images/i)).toBeTruthy();
  });

  it("Add Image button and file input are disabled when disabled prop is true", () => {
    renderComponent({ disabled: true });
    const addButton = screen.getByRole("button", { name: /add image/i });
    expect(addButton.hasAttribute("disabled")).toBe(true);
    const fileInput = screen.getByTestId("file-input");
    expect(fileInput.hasAttribute("disabled")).toBe(true);
  });
});
