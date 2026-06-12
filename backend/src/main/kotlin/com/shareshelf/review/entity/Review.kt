package com.shareshelf.review.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "reviews", uniqueConstraints = [UniqueConstraint(columnNames = ["borrow_request_id", "reviewer_id"])])
data class Review(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "borrow_request_id", nullable = false)
    var borrowRequestId: Long = 0,

    @Column(name = "reviewer_id", nullable = false)
    var reviewerId: Long = 0,

    @Column(name = "reviewee_id", nullable = false)
    var revieweeId: Long = 0,

    @Column(nullable = false)
    var rating: Int = 5,

    @Column(columnDefinition = "TEXT")
    var comment: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
) {
    @PrePersist
    fun prePersist() { createdAt = LocalDateTime.now() }
}
