package com.shareshelf.auth.entity

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "jti_blacklist")
class JtiBlacklistEntry(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true)
    val jti: String,

    @Column(name = "expires_at", nullable = false)
    val expiresAt: Instant,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now()
)
