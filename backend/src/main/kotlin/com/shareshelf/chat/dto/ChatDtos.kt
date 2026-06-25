package com.shareshelf.chat.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class SendMessageRequest(
    val itemId: Long,
    val receiverId: Long,

    @field:NotBlank(message = "Message is required")
    @field:Size(max = 2000, message = "Message must be at most 2000 characters")
    val message: String
)

data class MessageResponse(
    val id: Long,
    val senderId: Long,
    val receiverId: Long,
    val itemId: Long,
    val message: String,
    val readAt: LocalDateTime?,
    val createdAt: LocalDateTime
)

data class ConversationResponse(
    val itemId: Long,
    val itemTitle: String,
    val itemImageUrl: String?,
    val otherUserId: Long,
    val otherUserName: String,
    val lastMessage: String,
    val lastMessageAt: LocalDateTime,
    val unreadCount: Long
)

data class ConversationDetailResponse(
    val itemId: Long,
    val itemTitle: String,
    val itemImageUrl: String?,
    val otherUserId: Long,
    val otherUserName: String,
    val messages: List<MessageResponse>
)

data class UnreadCountResponse(
    val conversationsWithUnread: Long
)
