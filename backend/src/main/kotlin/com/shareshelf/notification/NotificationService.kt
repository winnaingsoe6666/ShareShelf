package com.shareshelf.notification

import com.shareshelf.notification.dto.NotificationResponse
import com.shareshelf.notification.entity.Notification
import com.shareshelf.notification.entity.NotificationType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository
) {

    @Transactional
    fun create(
        userId: Long,
        type: NotificationType,
        message: String,
        relatedItemId: Long? = null,
        relatedBorrowId: Long? = null
    ): NotificationResponse {
        val notification = Notification(
            userId = userId,
            type = type,
            message = message,
            relatedItemId = relatedItemId,
            relatedBorrowId = relatedBorrowId
        )
        val saved = notificationRepository.save(notification)
        return toResponse(saved)
    }

    fun findByUser(userId: Long, pageable: Pageable): Page<NotificationResponse> {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map { toResponse(it) }
    }

    fun getUnreadCount(userId: Long): Long {
        return notificationRepository.countByUserIdAndIsReadFalse(userId)
    }

    @Transactional
    fun markRead(notificationId: Long, userId: Long): NotificationResponse {
        val notification = notificationRepository.findById(notificationId)
            .orElseThrow { jakarta.persistence.EntityNotFoundException("Notification not found") }

        if (notification.userId != userId) {
            throw AccessDeniedException("Cannot mark another user's notification as read")
        }

        notification.isRead = true
        val saved = notificationRepository.save(notification)
        return toResponse(saved)
    }

    @Transactional
    fun markAllRead(userId: Long) {
        val unreadNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(
            userId, Pageable.unpaged()
        ).content.filter { !it.isRead }

        unreadNotifications.forEach { it.isRead = true }
        notificationRepository.saveAll(unreadNotifications)
    }

    private fun toResponse(notification: Notification): NotificationResponse {
        return NotificationResponse(
            id = notification.id!!,
            type = notification.type,
            message = notification.message,
            relatedItemId = notification.relatedItemId,
            relatedBorrowId = notification.relatedBorrowId,
            isRead = notification.isRead,
            createdAt = notification.createdAt
        )
    }
}
