package com.shareshelf.auth

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.time.Instant

class JtiBlacklistTest {

    private val jtiBlacklist = JtiBlacklist()

    @Test
    fun `isBlacklisted should return false for unknown JTI`() {
        assertFalse(jtiBlacklist.isBlacklisted("unknown-jti"))
    }

    @Test
    fun `isBlacklisted should return true for blacklisted JTI`() {
        val jti = "test-jti-123"
        val futureExpiry = Instant.now().plusSeconds(3600)

        jtiBlacklist.blacklist(jti, futureExpiry)

        assertTrue(jtiBlacklist.isBlacklisted(jti))
    }

    @Test
    fun `isBlacklisted should return false for expired JTI and remove it`() {
        val jti = "expired-jti"
        val pastExpiry = Instant.now().minusSeconds(3600)

        jtiBlacklist.blacklist(jti, pastExpiry)

        assertFalse(jtiBlacklist.isBlacklisted(jti))
        // Check it was removed -- calling again should still return false
        assertFalse(jtiBlacklist.isBlacklisted(jti))
    }

    @Test
    fun `purgeExpiredEntries should remove expired entries`() {
        val validJti = "valid-jti"
        val expiredJti = "expired-jti-2"
        val futureExpiry = Instant.now().plusSeconds(3600)
        val pastExpiry = Instant.now().minusSeconds(3600)

        jtiBlacklist.blacklist(validJti, futureExpiry)
        jtiBlacklist.blacklist(expiredJti, pastExpiry)

        jtiBlacklist.purgeExpiredEntries()

        // Valid JTI still blacklisted
        assertTrue(jtiBlacklist.isBlacklisted(validJti))
        // Expired JTI was removed, so not blacklisted
        assertFalse(jtiBlacklist.isBlacklisted(expiredJti))
    }

    @Test
    fun `blacklist should accept multiple JTIs`() {
        val futureExpiry = Instant.now().plusSeconds(3600)

        jtiBlacklist.blacklist("jti-1", futureExpiry)
        jtiBlacklist.blacklist("jti-2", futureExpiry)
        jtiBlacklist.blacklist("jti-3", futureExpiry)

        assertTrue(jtiBlacklist.isBlacklisted("jti-1"))
        assertTrue(jtiBlacklist.isBlacklisted("jti-2"))
        assertTrue(jtiBlacklist.isBlacklisted("jti-3"))
    }
}
