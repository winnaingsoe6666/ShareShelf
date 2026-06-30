import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ConversationList from "@/components/chat/ConversationList";

vi.mock("@/lib/chat", () => ({
  getConversations: vi.fn(),
}));

import { getConversations } from "@/lib/chat";

const mockGetConversations = getConversations as ReturnType<typeof vi.fn>;

const mockConversations = [
  {
    itemId: 1,
    itemTitle: "Power Drill",
    itemImageUrl: null,
    otherUserId: 2,
    otherUserName: "Alice",
    otherUserAvatarUrl: null,
    lastMessage: "Is this available?",
    lastMessageAt: new Date().toISOString(),
    unreadCount: 3,
  },
  {
    itemId: 2,
    itemTitle: "Hammer",
    itemImageUrl: "/uploads/hammer.jpg",
    otherUserId: 3,
    otherUserName: "Bob",
    otherUserAvatarUrl: null,
    lastMessage: "Thanks!",
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
  },
];

describe("ConversationList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetConversations.mockResolvedValue(mockConversations);
  });

  it("renders conversation items", async () => {
    render(<ConversationList onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Power Drill")).toBeInTheDocument();
      expect(screen.getByText("Hammer")).toBeInTheDocument();
    });
  });

  it("renders other user names", async () => {
    render(<ConversationList onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  it("renders last messages", async () => {
    render(<ConversationList onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Is this available?")).toBeInTheDocument();
      expect(screen.getByText("Thanks!")).toBeInTheDocument();
    });
  });

  it("shows unread badge when unreadCount > 0", async () => {
    render(<ConversationList onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("does not show unread badge when unreadCount is 0", async () => {
    render(<ConversationList onSelect={vi.fn()} />);

    await waitFor(() => {
      // The badge "3" should exist for the first conversation
      expect(screen.getByText("3")).toBeInTheDocument();
      // No "0" badge should exist
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });

  it("shows empty state when no conversations", async () => {
    mockGetConversations.mockResolvedValue([]);

    render(<ConversationList onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    });
  });

  it("calls onSelect when row is clicked", async () => {
    const onSelect = vi.fn();
    render(<ConversationList onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByText("Power Drill")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Power Drill").closest("button")!);

    expect(onSelect).toHaveBeenCalledWith(1, 2, "Alice", "Power Drill", null, null);
  });

  it("calls onSelect with itemImageUrl when available", async () => {
    const onSelect = vi.fn();
    render(<ConversationList onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByText("Hammer")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Hammer").closest("button")!);

    expect(onSelect).toHaveBeenCalledWith(2, 3, "Bob", "Hammer", "/uploads/hammer.jpg", null);
  });

  it("shows loading state initially", () => {
    mockGetConversations.mockReturnValue(new Promise(() => {})); // never resolves

    render(<ConversationList onSelect={vi.fn()} />);

    expect(screen.getByText("Loading conversations...")).toBeInTheDocument();
  });

  it("highlights selected conversation", async () => {
    render(
      <ConversationList
        onSelect={vi.fn()}
        selectedItemId={1}
        selectedUserId={2}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Power Drill")).toBeInTheDocument();
    });

    const selectedButton = screen.getByText("Power Drill").closest("button")!;
    expect(selectedButton.className).toContain("bg-stone-100");
  });

  it("shows 99+ for unread count over 99", async () => {
    mockGetConversations.mockResolvedValue([
      {
        ...mockConversations[0],
        unreadCount: 150,
      },
    ]);

    render(<ConversationList onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("99+")).toBeInTheDocument();
    });
  });
});
