package com.shareshelf.auth.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
data class User(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, length = 100)
    var name: String = "",

    @Column(nullable = false, unique = true)
    val email: String = "",

    @Column(name = "password_hash")
    var passwordHash: String = "",

    @Column(name = "google_id", unique = true)
    var googleId: String? = null,

    @Column(name = "auth_provider", nullable = false)
    @Enumerated(EnumType.STRING)
    var authProvider: AuthProvider = AuthProvider.LOCAL,

    @Column(length = 100)
    var community: String? = null,

    @Column(length = 20)
    val phone: String? = null,

    @Column(name = "avatar_url", length = 500)
    var avatarUrl: String? = null,

    @Column(name = "trust_score", nullable = false)
    var trustScore: java.math.BigDecimal = java.math.BigDecimal.ZERO,

    @Column(nullable = false)
    var enabled: Boolean = true,

    @Column(name = "failed_login_attempts", nullable = false)
    var failedLoginAttempts: Int = 0,

    @Column(name = "locked_until")
    var lockedUntil: LocalDateTime? = null,

    @Column(columnDefinition = "TEXT")
    var bio: String? = null,

    @Column(name = "is_id_verified", nullable = false)
    var isIdVerified: Boolean = false,

    @Column(name = "address_line1")
    var addressLine1: String? = null,

    @Column(name = "address_line2")
    var addressLine2: String? = null,

    @Column(length = 100)
    var city: String? = null,

    @Column(length = 50)
    var state: String? = null,

    @Column(name = "zip_code", length = 20)
    var zipCode: String? = null,

    @Column(name = "social_link")
    var socialLink: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @PreUpdate
    fun preUpdate() {
        updatedAt = LocalDateTime.now()
    }

    @PrePersist
    fun prePersist() {
        createdAt = LocalDateTime.now()
        updatedAt = LocalDateTime.now()
    }
}
