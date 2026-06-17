package com.shareshelf.auth

import com.shareshelf.auth.entity.RefreshToken
import com.shareshelf.auth.entity.RefreshTokenRepository
import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Instant
import java.time.LocalDateTime

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
        val refreshTokenString = "valid-refresh-token"
        val storedToken = RefreshToken(
            id = 1L,
            token = "hashed-token",
            userId = 1L,
            expiresAt = LocalDateTime.now().plusDays(7),
            revoked = false
        )
        val newAccessToken = "new.access.token"
        val newRefreshToken = "new.refresh.token"

        every { refreshTokenRepository.findByToken(any()) } returns storedToken
        every { refreshTokenRepository.save(any()) } returns storedToken
        every { userRepository.findById(1L) } returns java.util.Optional.of(testUser)
        every { jwtTokenProvider.generateToken(1L, "test@example.com") } returns newAccessToken

        val response = authService.refresh(refreshTokenString)

        assertNotNull(response)
        assertEquals(newAccessToken, response.token)
        assertTrue(storedToken.revoked)

        verify(exactly = 1) { refreshTokenRepository.findByToken(any()) }
        verify(exactly = 1) { userRepository.findById(1L) }
        verify(exactly = 1) { jwtTokenProvider.generateToken(1L, "test@example.com") }
    }

    @Test
    fun `refresh should throw for revoked refresh token`() {
        val refreshTokenString = "revoked-token"
        val storedToken = RefreshToken(
            id = 1L,
            token = "hashed-token",
            userId = 1L,
            expiresAt = LocalDateTime.now().plusDays(7),
            revoked = true
        )

        every { refreshTokenRepository.findByToken(any()) } returns storedToken

        assertThrows(BadCredentialsException::class.java) {
            authService.refresh(refreshTokenString)
        }
    }

    @Test
    fun `refresh should throw for expired refresh token`() {
        val refreshTokenString = "expired-token"
        val storedToken = RefreshToken(
            id = 1L,
            token = "hashed-token",
            userId = 1L,
            expiresAt = LocalDateTime.now().minusDays(1),
            revoked = false
        )

        every { refreshTokenRepository.findByToken(any()) } returns storedToken

        assertThrows(BadCredentialsException::class.java) {
            authService.refresh(refreshTokenString)
        }
    }

    @Test
    fun `refresh should throw for unknown refresh token`() {
        val refreshTokenString = "unknown-token"

        every { refreshTokenRepository.findByToken(any()) } returns null

        assertThrows(BadCredentialsException::class.java) {
            authService.refresh(refreshTokenString)
        }
    }
}
