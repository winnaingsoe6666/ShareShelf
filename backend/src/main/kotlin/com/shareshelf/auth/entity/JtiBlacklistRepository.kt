package com.shareshelf.auth.entity

import org.springframework.data.jpa.repository.JpaRepository
import java.time.Instant

interface JtiBlacklistRepository : JpaRepository<JtiBlacklistEntry, Long> {
    fun existsByJti(jti: String): Boolean
    fun deleteByExpiresAtBefore(instant: Instant)
}
