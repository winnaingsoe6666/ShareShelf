package com.shareshelf.notification.dto

import com.shareshelf.notification.entity.NotificationType
import java.time.LocalDateTime

data class NotificationResponse(
    val id: Long,
    val type: NotificationType,
    val message: String,
    val relatedItemId: Long?,
    val relatedBorrowId: Long?,
    val isRead: Boolean,
    val createdAt: LocalDateTime
)

data class UnreadCountResponse(
    val count: Long
)
