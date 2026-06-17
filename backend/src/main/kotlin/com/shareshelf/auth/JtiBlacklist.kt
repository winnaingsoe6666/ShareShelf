package com.shareshelf.auth

import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

@Component
class JtiBlacklist {

    private val logger = LoggerFactory.getLogger(JtiBlacklist::class.java)
    private val blacklist = ConcurrentHashMap<String, Instant>()

    fun blacklist(jti: String, expiresAt: Instant) {
        blacklist[jti] = expiresAt
        logger.debug("JTI blacklisted: {}, expires at: {}", jti, expiresAt)
    }

    fun isBlacklisted(jti: String): Boolean {
        val expiresAt = blacklist[jti] ?: return false

        if (Instant.now().isAfter(expiresAt)) {
            blacklist.remove(jti)
            logger.debug("JTI expired and removed from blacklist: {}", jti)
            return false
        }

        logger.warn("Blacklisted JTI used: {}", jti)
        return true
    }

    @Scheduled(fixedRate = 3600000)
    fun purgeExpiredEntries() {
        val now = Instant.now()
        val iterator = blacklist.entries.iterator()
        var removed = 0

        while (iterator.hasNext()) {
            val entry = iterator.next()
            if (now.isAfter(entry.value)) {
                iterator.remove()
                removed++
            }
        }

        if (removed > 0) {
            logger.info("Purged {} expired JTI entries from blacklist", removed)
        }
    }
}
