// Types
export type BorrowStatus = "pending" | "approved" | "rejected" | "returned" | "cancelled";
export type ItemStatus = "available" | "borrowed" | "unavailable";
export type NotificationType = "borrow_requested" | "borrow_approved" | "borrow_rejected" | "borrow_returned" | "review_received";

export interface User {
  id: number;
  name: string;
  email: string;
  trustScore: number;
  community?: string;
  avatarUrl?: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  description?: string;
}

export interface Item {
  id: number;
  ownerId: number;
  ownerName: string;
  ownerTrustScore: number;
  categoryId?: number;
  categoryName?: string;
  title: string;
  description?: string;
  dailyPrice?: number;
  depositAmount?: number;
  status: ItemStatus;
  imageUrls: string[];
  createdAt: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export interface BorrowRequest {
  id: number;
  itemId: number;
  itemTitle: string;
  itemImageUrl?: string;
  borrowerId: number;
  borrowerName: string;
  ownerId: number;
  ownerName: string;
  status: BorrowStatus;
  startDate?: string;
  endDate?: string;
  message?: string;
  createdAt: string;
}

export interface Review {
  id: number;
  borrowRequestId: number;
  reviewerId: number;
  reviewerName: string;
  revieweeId: number;
  revieweeName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  relatedItemId?: number;
  relatedBorrowId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: number;
  name: string;
  email: string;
  trustScore: number;
  community?: string;
  avatarUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}
