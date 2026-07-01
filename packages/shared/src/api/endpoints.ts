import type { AxiosInstance } from "axios";
import type {
  ApiResponse,
  AuthResponse,
  Category,
  CommunityStats,
  Conversation,
  ConversationDetail,
  CreateBorrowRequestDto,
  CreateItemRequestDto,
  CreateReviewRequestDto,
  Item,
  ItemQueryParams,
  Notification,
  NotificationUnreadCount,
  PaginatedResponse,
  Review,
  UnreadCount,
  UpdateItemRequestDto,
  UpdateProfileRequestDto,
  BorrowRequest,
} from "../types";

// --- Auth ---

export function createAuthApi(api: AxiosInstance) {
  return {
    async register(data: {
      name: string;
      email: string;
      password: string;
      community?: string;
      phone?: string;
    }): Promise<ApiResponse<AuthResponse>> {
      const res = await api.post("/auth/register", data);
      return res.data;
    },

    async login(data: {
      email: string;
      password: string;
    }): Promise<ApiResponse<AuthResponse>> {
      const res = await api.post("/auth/login", data);
      return res.data;
    },

    async logout(): Promise<void> {
      await api.post("/auth/logout");
    },

    async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
      const res = await api.post("/auth/refresh", { refreshToken });
      return res.data;
    },

    async getMe(): Promise<ApiResponse<AuthResponse>> {
      const res = await api.get("/auth/me");
      return res.data;
    },

    async verifyEmail(token: string): Promise<ApiResponse<AuthResponse>> {
      const res = await api.get("/auth/verify-email", { params: { token } });
      return res.data;
    },
  };
}

// --- Items ---

export function createItemsApi(api: AxiosInstance) {
  return {
    async getItems(params?: ItemQueryParams): Promise<PaginatedResponse<Item>> {
      const res = await api.get("/items", { params });
      return res.data.data;
    },

    async getItem(id: number): Promise<Item> {
      const res = await api.get(`/items/${id}`);
      return res.data.data;
    },

    async createItem(data: CreateItemRequestDto): Promise<Item> {
      const res = await api.post("/items", data);
      return res.data.data;
    },

    async updateItem(id: number, data: UpdateItemRequestDto): Promise<Item> {
      const res = await api.put(`/items/${id}`, data);
      return res.data.data;
    },

    async deleteItem(id: number): Promise<void> {
      await api.delete(`/items/${id}`);
    },

    async uploadImage(id: number, formData: FormData): Promise<Item> {
      const res = await api.post(`/items/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    },

    async deleteImage(id: number, imageUrl: string): Promise<Item> {
      const res = await api.delete(`/items/${id}/images`, {
        params: { url: imageUrl },
      });
      return res.data.data;
    },
  };
}

// --- Borrow ---

export function createBorrowApi(api: AxiosInstance) {
  return {
    async getBorrows(page = 0, size = 20): Promise<PaginatedResponse<BorrowRequest>> {
      const res = await api.get("/borrow", { params: { page, size } });
      return res.data.data;
    },

    async createBorrow(data: CreateBorrowRequestDto): Promise<BorrowRequest> {
      const res = await api.post("/borrow", data);
      return res.data.data;
    },

    async approveBorrow(id: number): Promise<BorrowRequest> {
      const res = await api.put(`/borrow/${id}/approve`);
      return res.data.data;
    },

    async rejectBorrow(id: number): Promise<BorrowRequest> {
      const res = await api.put(`/borrow/${id}/reject`);
      return res.data.data;
    },

    async returnBorrow(id: number): Promise<BorrowRequest> {
      const res = await api.put(`/borrow/${id}/return`);
      return res.data.data;
    },

    async cancelBorrow(id: number): Promise<BorrowRequest> {
      const res = await api.put(`/borrow/${id}/cancel`);
      return res.data.data;
    },
  };
}

// --- Reviews ---

export function createReviewApi(api: AxiosInstance) {
  return {
    async createReview(data: CreateReviewRequestDto): Promise<Review> {
      const res = await api.post("/review", data);
      return res.data.data;
    },

    async getUserReviews(userId: number): Promise<Review[]> {
      const res = await api.get(`/review/user/${userId}`);
      return res.data.data;
    },
  };
}

// --- Chat ---

export function createChatApi(api: AxiosInstance) {
  return {
    async getConversations(): Promise<Conversation[]> {
      const res = await api.get("/chat/conversations");
      return res.data.data;
    },

    async getConversation(
      itemId: number,
      otherUserId: number,
      page = 0,
      size = 50
    ): Promise<ConversationDetail> {
      const res = await api.get(`/chat/conversations/${itemId}/${otherUserId}`, {
        params: { page, size },
      });
      return res.data.data;
    },

    async markAsRead(itemId: number, otherUserId: number): Promise<void> {
      await api.post(`/chat/conversations/${itemId}/${otherUserId}/read`);
    },

    async getUnreadCount(): Promise<UnreadCount> {
      const res = await api.get("/chat/unread-count");
      return res.data.data;
    },
  };
}

// --- Notifications ---

export function createNotificationApi(api: AxiosInstance) {
  return {
    async getNotifications(page = 0, size = 20): Promise<PaginatedResponse<Notification>> {
      const res = await api.get("/notifications", { params: { page, size } });
      return res.data.data;
    },

    async getUnreadCount(): Promise<NotificationUnreadCount> {
      const res = await api.get("/notifications/unread-count");
      return res.data.data;
    },

    async markRead(id: number): Promise<Notification> {
      const res = await api.put(`/notifications/${id}/read`);
      return res.data.data;
    },

    async markAllRead(): Promise<void> {
      await api.put("/notifications/read-all");
    },
  };
}

// --- Categories ---

export function createCategoryApi(api: AxiosInstance) {
  return {
    async getCategories(): Promise<Category[]> {
      const res = await api.get("/categories");
      return res.data.data;
    },
  };
}

// --- Community ---

export function createCommunityApi(api: AxiosInstance) {
  return {
    async getCommunityStats(): Promise<CommunityStats> {
      const res = await api.get("/community/stats");
      return res.data.data;
    },
  };
}

// --- User ---

export function createUserApi(api: AxiosInstance) {
  return {
    async updateProfile(data: UpdateProfileRequestDto): Promise<AuthResponse> {
      const res = await api.put("/users/profile", data);
      return res.data.data;
    },

    async uploadAvatar(formData: FormData): Promise<AuthResponse> {
      const res = await api.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    },
  };
}

// --- Aggregate ---

export function createApi(api: AxiosInstance) {
  return {
    auth: createAuthApi(api),
    items: createItemsApi(api),
    borrow: createBorrowApi(api),
    review: createReviewApi(api),
    chat: createChatApi(api),
    notification: createNotificationApi(api),
    category: createCategoryApi(api),
    community: createCommunityApi(api),
    user: createUserApi(api),
  };
}
