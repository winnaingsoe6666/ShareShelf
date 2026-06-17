package com.shareshelf.auth

import com.shareshelf.auth.entity.JtiBlacklistEntry
import com.shareshelf.auth.entity.JtiBlacklistRepository
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.Instant

class JtiBlacklistTest {

    private val repository = mockk<JtiBlacklistRepository>()
    private val jtiBlacklist = JtiBlacklist(repository)

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    @Test
    fun `isBlacklisted should return false for unknown JTI`() {
        every { repository.existsByJti("unknown-jti") } returns false

        assertFalse(jtiBlacklist.isBlacklisted("unknown-jti"))

        verify(exactly = 1) { repository.existsByJti("unknown-jti") }
    }

    @Test
    fun `isBlacklisted should return true for blacklisted JTI`() {
        val jti = "test-jti-123"

        every { repository.existsByJti(jti) } returns true

        assertTrue(jtiBlacklist.isBlacklisted(jti))

        verify(exactly = 1) { repository.existsByJti(jti) }
    }

    @Test
    fun `blacklist should save new entry when JTI not already blacklisted`() {
        val jti = "new-jti"
        val futureExpiry = Instant.now().plusSeconds(3600)

        every { repository.existsByJti(jti) } returns false
        every { repository.save(any<JtiBlacklistEntry>()) } returns JtiBlacklistEntry(jti = jti, expiresAt = futureExpiry)

        jtiBlacklist.blacklist(jti, futureExpiry)

        verify(exactly = 1) { repository.existsByJti(jti) }
        verify(exactly = 1) { repository.save(any<JtiBlacklistEntry>()) }
    }

    @Test
    fun `blacklist should skip when JTI already blacklisted`() {
        val jti = "existing-jti"
        val futureExpiry = Instant.now().plusSeconds(3600)

        every { repository.existsByJti(jti) } returns true

        jtiBlacklist.blacklist(jti, futureExpiry)

        verify(exactly = 1) { repository.existsByJti(jti) }
        verify(exactly = 0) { repository.save(any<JtiBlacklistEntry>()) }
    }

    @Test
    fun `blacklist should accept multiple JTIs`() {
        val futureExpiry = Instant.now().plusSeconds(3600)

        every { repository.existsByJti("jti-1") } returns false
        every { repository.existsByJti("jti-2") } returns false
        every { repository.existsByJti("jti-3") } returns false
        every { repository.save(any<JtiBlacklistEntry>()) } returns JtiBlacklistEntry(jti = "saved", expiresAt = futureExpiry)

        jtiBlacklist.blacklist("jti-1", futureExpiry)
        jtiBlacklist.blacklist("jti-2", futureExpiry)
        jtiBlacklist.blacklist("jti-3", futureExpiry)

        verify(exactly = 3) { repository.save(any<JtiBlacklistEntry>()) }
    }
}
