package com.shareshelf.item.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "items")
data class Item(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "owner_id", nullable = false)
    var ownerId: Long = 0,

    @Column(name = "category_id")
    var categoryId: Long? = null,

    @Column(nullable = false, length = 200)
    var title: String = "",

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(name = "daily_price")
    var dailyPrice: BigDecimal? = null,

    @Column(name = "deposit_amount")
    var depositAmount: BigDecimal? = null,

    @Column(nullable = false, length = 20)
    var status: String = "available",

    @Column(name = "image_urls", columnDefinition = "jsonb")
    var imageUrls: String = "[]",

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

    fun ownerId() = ownerId
}
