// Types
export type BorrowStatus = "pending" | "approved" | "rejected" | "returned" | "cancelled";
export type ItemStatus = "available" | "borrowed" | "unavailable";
export type NotificationType = "borrow_requested" | "borrow_approved" | "borrow_rejected" | "borrow_returned" | "borrow_cancelled" | "review_received";

export interface User {
  id: number;
  name: string;
  email: string;
  trustScore: number;
  profileBonus: number;
  community?: string;
  avatarUrl?: string;
  bio?: string;
  isIdVerified: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  socialLink?: string;
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
  profileBonus: number;
  community?: string;
  avatarUrl?: string;
  bio?: string;
  isIdVerified: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  socialLink?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// Chat types

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  itemId: number;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface Conversation {
  itemId: number;
  itemTitle: string;
  itemImageUrl: string | null;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ConversationDetail {
  itemId: number;
  itemTitle: string;
  itemImageUrl: string | null;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  messages: ChatMessage[];
}

export interface UnreadCount {
  conversationsWithUnread: number;
}

// Community types

export interface TopLender {
  userId: number;
  name: string;
  itemCount: number;
  trustScore: number;
}

export interface CommunityStats {
  totalItems: number;
  totalMembers: number;
  activeBorrows: number;
  recentItems: Item[];
  topLenders: TopLender[];
}

// Notification unread count (different from chat UnreadCount)

export interface NotificationUnreadCount {
  count: number;
}

// Request DTOs

export interface CreateBorrowRequestDto {
  itemId: number;
  message?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateReviewRequestDto {
  borrowRequestId: number;
  rating: number;
  comment?: string;
}

export interface CreateItemRequestDto {
  title: string;
  description?: string;
  categoryId?: number;
  dailyPrice?: number;
  depositAmount?: number;
  latitude?: number;
  longitude?: number;
}

export interface UpdateItemRequestDto {
  title?: string;
  description?: string;
  categoryId?: number;
  dailyPrice?: number;
  depositAmount?: number;
  status?: ItemStatus;
  latitude?: number;
  longitude?: number;
}

export interface UpdateProfileRequestDto {
  name?: string;
  bio?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  socialLink?: string;
  community?: string;
}

// Page response (Spring Data)

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Item query params

export interface ItemQueryParams {
  search?: string;
  categoryId?: number;
  status?: string;
  minRating?: number;
  nearLat?: number;
  nearLng?: number;
  nearRadius?: number;
  page?: number;
  size?: number;
}
