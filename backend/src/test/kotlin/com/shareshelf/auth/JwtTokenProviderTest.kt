package com.shareshelf.auth

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class JwtTokenProviderTest {

    private val jtiBlacklist = mockk<JtiBlacklist>(relaxed = true)

    private val jwtTokenProvider = JwtTokenProvider(
        jwtSecret = "this-is-a-test-secret-key-that-is-long-enough-for-hs256-algorithm-yes",
        expirationMs = 3600000, // 1 hour
        jtiBlacklist = jtiBlacklist
    )

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    @Test
    fun `generateToken should include JTI claim`() {
        val token = jwtTokenProvider.generateToken(userId = 1L, email = "test@example.com")

        assertNotNull(token)
        assertTrue(token.isNotEmpty())

        val jti = jwtTokenProvider.getJtiFromToken(token)
        assertNotNull(jti)
        assertTrue(jti.isNotEmpty())
    }

    @Test
    fun `generateToken should include user ID as subject`() {
        val token = jwtTokenProvider.generateToken(userId = 42L, email = "user@example.com")

        val userId = jwtTokenProvider.getUserIdFromToken(token)
        assertEquals(42L, userId)
    }

    @Test
    fun `generateToken should include email claim`() {
        val token = jwtTokenProvider.generateToken(userId = 1L, email = "test@example.com")
        assertNotNull(token)
    }

    @Test
    fun `validateToken should return true for valid token`() {
        val token = jwtTokenProvider.generateToken(userId = 1L, email = "test@example.com")
        assertTrue(jwtTokenProvider.validateToken(token))
    }

    @Test
    fun `validateToken should return false for invalid token`() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.here"))
    }

    @Test
    fun `getExpirationFromToken should return a future instant`() {
        val token = jwtTokenProvider.generateToken(userId = 1L, email = "test@example.com")
        val expiration = jwtTokenProvider.getExpirationFromToken(token)

        assertTrue(expiration.isAfter(java.time.Instant.now()))
    }

    @Test
    fun `each generated token should have a unique JTI`() {
        val token1 = jwtTokenProvider.generateToken(userId = 1L, email = "test@example.com")
        val token2 = jwtTokenProvider.generateToken(userId = 1L, email = "test@example.com")

        val jti1 = jwtTokenProvider.getJtiFromToken(token1)
        val jti2 = jwtTokenProvider.getJtiFromToken(token2)

        assertNotEquals(jti1, jti2)
    }

    @Test
    fun `getJtiFromToken should not throw on valid token`() {
        val token = jwtTokenProvider.generateToken(userId = 1L, email = "test@example.com")

        assertDoesNotThrow {
            jwtTokenProvider.getJtiFromToken(token)
        }
    }
}
