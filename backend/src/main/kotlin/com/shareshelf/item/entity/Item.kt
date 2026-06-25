package com.shareshelf.item.entity

import com.shareshelf.auth.entity.User
import com.shareshelf.category.Category
import jakarta.persistence.*
import org.locationtech.jts.geom.Point
import java.math.BigDecimal
import java.time.LocalDateTime

enum class ItemStatus { available, borrowed, unavailable }

@Entity
@Table(name = "items")
data class Item(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "owner_id", nullable = false)
    var ownerId: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", insertable = false, updatable = false)
    var owner: User? = null,

    @Column(name = "category_id")
    var categoryId: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    var category: Category? = null,

    @Column(nullable = false, length = 200)
    var title: String = "",

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(name = "daily_price")
    var dailyPrice: BigDecimal? = null,

    @Column(name = "deposit_amount")
    var depositAmount: BigDecimal? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: ItemStatus = ItemStatus.available,

    @Column(columnDefinition = "geometry(Point, 4326)")
    var location: Point? = null,

    @Version
    var version: Long? = null,

    @Column(name = "image_urls", columnDefinition = "jsonb")
    @org.hibernate.annotations.ColumnTransformer(write = "?::jsonb")
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
}
