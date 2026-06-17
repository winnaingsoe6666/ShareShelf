package com.shareshelf.auth

import com.shareshelf.auth.entity.JtiBlacklistEntry
import com.shareshelf.auth.entity.JtiBlacklistRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Component
class JtiBlacklist(
    private val repository: JtiBlacklistRepository
) {

    private val logger = LoggerFactory.getLogger(JtiBlacklist::class.java)

    @Transactional
    fun blacklist(jti: String, expiresAt: Instant) {
        if (!repository.existsByJti(jti)) {
            repository.save(JtiBlacklistEntry(jti = jti, expiresAt = expiresAt))
            logger.debug("JTI blacklisted: {}, expires at: {}", jti, expiresAt)
        }
    }

    fun isBlacklisted(jti: String): Boolean {
        val blacklisted = repository.existsByJti(jti)
        if (blacklisted) {
            logger.warn("Blacklisted JTI used: {}", jti)
        }
        return blacklisted
    }

    @Scheduled(fixedRate = 60000) // every minute
    @Transactional
    fun cleanExpired() {
        repository.deleteByExpiresAtBefore(Instant.now())
    }
}
