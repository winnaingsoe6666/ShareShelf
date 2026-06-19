package com.shareshelf.notification.entity

import jakarta.persistence.*
import java.time.LocalDateTime

enum class NotificationType {
    borrow_requested,
    borrow_approved,
    borrow_rejected,
    borrow_returned,
    review_received
}

@Entity
@Table(name = "notifications")
data class Notification(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "user_id", nullable = false)
    var userId: Long = 0,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var type: NotificationType = NotificationType.borrow_requested,

    @Column(nullable = false, columnDefinition = "TEXT")
    var message: String = "",

    @Column(name = "related_item_id")
    var relatedItemId: Long? = null,

    @Column(name = "related_borrow_id")
    var relatedBorrowId: Long? = null,

    @Column(name = "is_read", nullable = false)
    var isRead: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
) {
    @PrePersist
    fun prePersist() {
        createdAt = LocalDateTime.now()
    }
}
