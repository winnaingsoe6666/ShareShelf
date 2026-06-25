import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatWindow from "@/components/chat/ChatWindow";

// Mock scrollIntoView for jsdom (not available in test environment)
Element.prototype.scrollIntoView = vi.fn();

vi.mock("@/lib/chat", () => ({
  getConversation: vi.fn(),
  markAsRead: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getUser: vi.fn(),
}));

vi.mock("@/components/chat/ChatMessage", () => ({
  default: ({ message, isOwn }: { message: { message: string }; isOwn: boolean }) => (
    <div data-testid="chat-message" data-is-own={isOwn}>
      {message.message}
    </div>
  ),
}));

import { getConversation, markAsRead } from "@/lib/chat";
import { getUser } from "@/lib/auth";

const mockGetConversation = getConversation as ReturnType<typeof vi.fn>;
const mockMarkAsRead = markAsRead as ReturnType<typeof vi.fn>;
const mockGetUser = getUser as ReturnType<typeof vi.fn>;

const defaultProps = {
  itemId: 10,
  otherUserId: 2,
  otherUserName: "Borrower",
  itemTitle: "Power Drill",
  itemImageUrl: null,
  sendMessage: vi.fn(),
};

describe("ChatWindow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockReturnValue({ id: 1, name: "Owner", email: "owner@test.com" });
    mockGetConversation.mockResolvedValue({
      itemId: 10,
      itemTitle: "Power Drill",
      otherUserId: 2,
      otherUserName: "Borrower",
      messages: [
        { id: 1, senderId: 2, receiverId: 1, itemId: 10, message: "Hi there", readAt: null, createdAt: "2026-01-01T10:00:00" },
        { id: 2, senderId: 1, receiverId: 2, itemId: 10, message: "Hello!", readAt: null, createdAt: "2026-01-01T10:01:00" },
      ],
    });
    mockMarkAsRead.mockResolvedValue(undefined);
  });

  it("renders item title in header", async () => {
    render(<ChatWindow {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Power Drill")).toBeInTheDocument();
    });
  });

  it("renders other user name in header", async () => {
    render(<ChatWindow {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Borrower")).toBeInTheDocument();
    });
  });

  it("renders messages after loading", async () => {
    render(<ChatWindow {...defaultProps} />);

    await waitFor(() => {
      const messages = screen.getAllByTestId("chat-message");
      expect(messages).toHaveLength(2);
      expect(messages[0]).toHaveTextContent("Hi there");
      expect(messages[1]).toHaveTextContent("Hello!");
    });
  });

  it("calls markAsRead on mount", async () => {
    render(<ChatWindow {...defaultProps} />);

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith(10, 2);
    });
  });

  it("calls getConversation with correct params on mount", async () => {
    render(<ChatWindow {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetConversation).toHaveBeenCalledWith(10, 2, 0, 50);
    });
  });

  it("renders textarea with maxLength 2000", async () => {
    render(<ChatWindow {...defaultProps} />);

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText("Type a message...");
      expect(textarea).toHaveAttribute("maxlength", "2000");
    });
  });

  it("calls sendMessage when send button is clicked with text", async () => {
    const sendMessage = vi.fn();
    render(<ChatWindow {...defaultProps} sendMessage={sendMessage} />);

    await waitFor(() => {
      expect(screen.getAllByTestId("chat-message")).toHaveLength(2);
    });

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "New message" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    expect(sendMessage).toHaveBeenCalledWith({
      itemId: 10,
      receiverId: 2,
      message: "New message",
    });
  });

  it("does not call sendMessage when text is empty", async () => {
    const sendMessage = vi.fn();
    render(<ChatWindow {...defaultProps} sendMessage={sendMessage} />);

    await waitFor(() => {
      expect(screen.getAllByTestId("chat-message")).toHaveLength(2);
    });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("clears input after sending", async () => {
    const sendMessage = vi.fn();
    render(<ChatWindow {...defaultProps} sendMessage={sendMessage} />);

    await waitFor(() => {
      expect(screen.getAllByTestId("chat-message")).toHaveLength(2);
    });

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "Test message" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    expect(textarea).toHaveValue("");
  });

  it("renders back button when onBack is provided", async () => {
    const onBack = vi.fn();
    render(<ChatWindow {...defaultProps} onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "" })).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    mockGetConversation.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ChatWindow {...defaultProps} />);

    expect(screen.getByText("Loading messages...")).toBeInTheDocument();
  });

  it("sends message on Enter key press", async () => {
    const sendMessage = vi.fn();
    render(<ChatWindow {...defaultProps} sendMessage={sendMessage} />);

    await waitFor(() => {
      expect(screen.getAllByTestId("chat-message")).toHaveLength(2);
    });

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "Enter message" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(sendMessage).toHaveBeenCalledWith({
      itemId: 10,
      receiverId: 2,
      message: "Enter message",
    });
  });

  it("does not send on Shift+Enter", async () => {
    const sendMessage = vi.fn();
    render(<ChatWindow {...defaultProps} sendMessage={sendMessage} />);

    await waitFor(() => {
      expect(screen.getAllByTestId("chat-message")).toHaveLength(2);
    });

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "Line break" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(sendMessage).not.toHaveBeenCalled();
  });
});
