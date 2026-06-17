package com.shareshelf.auth

import com.shareshelf.auth.entity.RefreshToken
import com.shareshelf.auth.entity.RefreshTokenRepository
import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Instant
import java.time.LocalDateTime
import java.util.*

class AuthServiceTest {

    private val userRepository = mockk<UserRepository>()
    private val passwordEncoder = mockk<PasswordEncoder>()
    private val jwtTokenProvider = mockk<JwtTokenProvider>()
    private val jtiBlacklist = mockk<JtiBlacklist>(relaxed = true)
    private val refreshTokenRepository = mockk<RefreshTokenRepository>()

    private val authService = AuthService(
        userRepository = userRepository,
        passwordEncoder = passwordEncoder,
        jwtTokenProvider = jwtTokenProvider,
        jtiBlacklist = jtiBlacklist,
        refreshTokenRepository = refreshTokenRepository,
        refreshExpirationMs = 604800000 // 7 days
    )

    private val testUser = User(
        id = 1L,
        name = "Test User",
        email = "test@example.com",
        passwordHash = "hashed_password",
        trustScore = java.math.BigDecimal("4.5")
    )

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    // --- Logout Tests ---

    @Test
    fun `logout should blacklist the JTI`() {
        val token = "valid.jwt.token"
        val jti = "jti-123"
        val expiresAt = Instant.now().plusSeconds(3600)

        every { jwtTokenProvider.getJtiFromToken(token) } returns jti
        every { jwtTokenProvider.getExpirationFromToken(token) } returns expiresAt
        every { jtiBlacklist.blacklist(jti, expiresAt) } just Runs

        authService.logout(token)

        verify(exactly = 1) { jwtTokenProvider.getJtiFromToken(token) }
        verify(exactly = 1) { jwtTokenProvider.getExpirationFromToken(token) }
        verify(exactly = 1) { jtiBlacklist.blacklist(jti, expiresAt) }
    }

    @Test
    fun `logout should throw on invalid token`() {
        val token = "invalid.token"

        every { jwtTokenProvider.getJtiFromToken(token) } throws RuntimeException("Invalid token")

        assertThrows(IllegalArgumentException::class.java) {
            authService.logout(token)
        }
    }

    // --- Refresh Token Tests ---

    @Test
    fun `refresh should return new tokens for valid refresh token`() {
        val refreshTokenString = UUID.randomUUID().toString()
        val storedToken = RefreshToken(
            id = 1L,
            token = refreshTokenString,
            userId = 1L,
            expiresAt = LocalDateTime.now().plusDays(7),
            revoked = false
        )
        val newAccessToken = "new.access.token"

        every { refreshTokenRepository.findByToken(refreshTokenString) } returns storedToken
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { jwtTokenProvider.generateToken(1L, "test@example.com") } returns newAccessToken
        every { refreshTokenRepository.save(any()) } returns storedToken

        val response = authService.refresh(refreshTokenString)

        assertTrue(response.success)
        assertNotNull(response.data)
        assertEquals(newAccessToken, response.data!!.token)
        assertTrue(storedToken.revoked)

        verify(exactly = 1) { refreshTokenRepository.findByToken(refreshTokenString) }
        verify(exactly = 1) { userRepository.findById(1L) }
        verify(exactly = 1) { jwtTokenProvider.generateToken(1L, "test@example.com") }
    }

    @Test
    fun `refresh should fail for revoked refresh token`() {
        val refreshTokenString = UUID.randomUUID().toString()
        val storedToken = RefreshToken(
            id = 1L,
            token = refreshTokenString,
            userId = 1L,
            expiresAt = LocalDateTime.now().plusDays(7),
            revoked = true
        )

        every { refreshTokenRepository.findByToken(refreshTokenString) } returns storedToken

        val response = authService.refresh(refreshTokenString)

        assertFalse(response.success)
        assertEquals("Refresh token has been revoked", response.message)
    }

    @Test
    fun `refresh should fail for expired refresh token`() {
        val refreshTokenString = UUID.randomUUID().toString()
        val storedToken = RefreshToken(
            id = 1L,
            token = refreshTokenString,
            userId = 1L,
            expiresAt = LocalDateTime.now().minusDays(1),
            revoked = false
        )

        every { refreshTokenRepository.findByToken(refreshTokenString) } returns storedToken

        val response = authService.refresh(refreshTokenString)

        assertFalse(response.success)
        assertEquals("Refresh token has expired", response.message)
    }

    @Test
    fun `refresh should fail for unknown refresh token`() {
        val refreshTokenString = "unknown-token"

        every { refreshTokenRepository.findByToken(refreshTokenString) } returns null

        val response = authService.refresh(refreshTokenString)

        assertFalse(response.success)
        assertEquals("Invalid refresh token", response.message)
    }
}
