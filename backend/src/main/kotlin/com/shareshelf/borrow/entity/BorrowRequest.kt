package com.shareshelf.borrow.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "borrow_requests")
data class BorrowRequest(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "item_id", nullable = false)
    var itemId: Long = 0,

    @Column(name = "borrower_id", nullable = false)
    var borrowerId: Long = 0,

    @Column(name = "owner_id", nullable = false)
    var ownerId: Long = 0,

    @Column(nullable = false, length = 20)
    var status: String = "pending",

    @Column(name = "start_date")
    var startDate: LocalDate? = null,

    @Column(name = "end_date")
    var endDate: LocalDate? = null,

    @Column(columnDefinition = "TEXT")
    var message: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @PreUpdate
    fun preUpdate() { updatedAt = LocalDateTime.now() }

    @PrePersist
    fun prePersist() {
        createdAt = LocalDateTime.now()
        updatedAt = LocalDateTime.now()
    }
}
