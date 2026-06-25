package com.shareshelf.auth

import com.shareshelf.auth.dto.AuthResponse
import com.shareshelf.auth.entity.AuthProvider
import com.shareshelf.auth.entity.RefreshToken
import com.shareshelf.auth.entity.RefreshTokenRepository
import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import org.springframework.security.oauth2.core.user.OAuth2User
import java.math.BigDecimal
import java.time.LocalDateTime

class OAuth2ServiceTest {

    private lateinit var userRepository: UserRepository
    private lateinit var jwtTokenProvider: JwtTokenProvider
    private lateinit var refreshTokenRepository: RefreshTokenRepository
    private lateinit var oAuth2Service: OAuth2Service

    private val refreshExpirationMs = 604800000L // 7 days

    @BeforeEach
    fun setUp() {
        userRepository = mockk()
        jwtTokenProvider = mockk()
        refreshTokenRepository = mockk()
        oAuth2Service = OAuth2Service(
            userRepository = userRepository,
            jwtTokenProvider = jwtTokenProvider,
            refreshTokenRepository = refreshTokenRepository,
            refreshExpirationMs = refreshExpirationMs
        )
    }

    private fun createOAuth2User(
        sub: String = "google123",
        email: String = "alice@gmail.com",
        name: String = "Alice",
        picture: String = "https://lh3.googleusercontent.com/photo.jpg"
    ): OAuth2User {
        val attributes = mapOf(
            "sub" to sub,
            "email" to email,
            "name" to name,
            "picture" to picture
        )
        return DefaultOAuth2User(
            listOf(),
            attributes,
            "sub"
        )
    }

    private fun createExistingUser(
        id: Long = 1L,
        email: String = "alice@gmail.com",
        name: String = "Alice",
        googleId: String? = null,
        authProvider: AuthProvider = AuthProvider.LOCAL,
        avatarUrl: String? = null
    ): User {
        return User(
            id = id,
            name = name,
            email = email,
            passwordHash = if (authProvider == AuthProvider.LOCAL) "hashed" else "",
            googleId = googleId,
            authProvider = authProvider,
            avatarUrl = avatarUrl,
            trustScore = BigDecimal.ZERO
        )
    }

    @Test
    fun `processOAuthUser returns existing user found by googleId`() {
        val oAuth2User = createOAuth2User()
        val existingUser = createExistingUser(
            googleId = "google123",
            authProvider = AuthProvider.GOOGLE
        )

        every { userRepository.findByGoogleId("google123") } returns existingUser

        val result = oAuth2Service.processOAuthUser(oAuth2User)

        assertEquals(existingUser, result)
        verify(exactly = 0) { userRepository.findByEmail(any()) }
        verify(exactly = 0) { userRepository.save(any()) }
    }

    @Test
    fun `processOAuthUser links Google ID to existing LOCAL user by email`() {
        val oAuth2User = createOAuth2User()
        val existingUser = createExistingUser(
            id = 2L,
            email = "alice@gmail.com",
            authProvider = AuthProvider.LOCAL,
            avatarUrl = null
        )
        val savedUser = existingUser.copy(
            googleId = "google123",
            authProvider = AuthProvider.GOOGLE,
            avatarUrl = "https://lh3.googleusercontent.com/photo.jpg"
        )

        every { userRepository.findByGoogleId("google123") } returns null
        every { userRepository.findByEmail("alice@gmail.com") } returns existingUser
        every { userRepository.save(any()) } returns savedUser

        val result = oAuth2Service.processOAuthUser(oAuth2User)

        assertEquals("google123", result.googleId)
        assertEquals(AuthProvider.GOOGLE, result.authProvider)
        verify { userRepository.save(any()) }
    }

    @Test
    fun `processOAuthUser imports avatar when LOCAL user has no avatar`() {
        val oAuth2User = createOAuth2User(picture = "https://lh3.googleusercontent.com/photo.jpg")
        val existingUser = createExistingUser(
            avatarUrl = null
        )
        val savedUser = existingUser.copy(
            googleId = "google123",
            authProvider = AuthProvider.GOOGLE,
            avatarUrl = "https://lh3.googleusercontent.com/photo.jpg"
        )

        every { userRepository.findByGoogleId("google123") } returns null
        every { userRepository.findByEmail("alice@gmail.com") } returns existingUser
        every { userRepository.save(any()) } returns savedUser

        val result = oAuth2Service.processOAuthUser(oAuth2User)

        assertEquals("https://lh3.googleusercontent.com/photo.jpg", result.avatarUrl)
    }

    @Test
    fun `processOAuthUser does not overwrite existing avatar when linking`() {
        val oAuth2User = createOAuth2User(picture = "https://lh3.googleusercontent.com/new.jpg")
        val existingUser = createExistingUser(
            avatarUrl = "https://existing.com/old.jpg"
        )
        val savedUser = existingUser.copy(
            googleId = "google123",
            authProvider = AuthProvider.GOOGLE
        )

        every { userRepository.findByGoogleId("google123") } returns null
        every { userRepository.findByEmail("alice@gmail.com") } returns existingUser
        every { userRepository.save(any()) } returns savedUser

        val result = oAuth2Service.processOAuthUser(oAuth2User)

        assertEquals("https://existing.com/old.jpg", result.avatarUrl)
    }

    @Test
    fun `processOAuthUser creates new user when no googleId or email match`() {
        val oAuth2User = createOAuth2User(
            sub = "newgoogle456",
            email = "bob@gmail.com",
            name = "Bob",
            picture = "https://lh3.googleusercontent.com/bob.jpg"
        )
        val newUser = User(
            id = 3L,
            name = "Bob",
            email = "bob@gmail.com",
            passwordHash = "",
            googleId = "newgoogle456",
            authProvider = AuthProvider.GOOGLE,
            avatarUrl = "https://lh3.googleusercontent.com/bob.jpg",
            trustScore = BigDecimal.ZERO
        )

        every { userRepository.findByGoogleId("newgoogle456") } returns null
        every { userRepository.findByEmail("bob@gmail.com") } returns null
        every { userRepository.save(any()) } returns newUser

        val result = oAuth2Service.processOAuthUser(oAuth2User)

        assertEquals("newgoogle456", result.googleId)
        assertEquals(AuthProvider.GOOGLE, result.authProvider)
        assertEquals("", result.passwordHash)
        assertEquals("Bob", result.name)
        assertEquals("bob@gmail.com", result.email)
        assertEquals("https://lh3.googleusercontent.com/bob.jpg", result.avatarUrl)
    }

    @Test
    fun `processOAuthUser uses email prefix as name when name is blank`() {
        val oAuth2User = createOAuth2User(
            sub = "google789",
            email = "charlie@gmail.com",
            name = "",
            picture = "https://lh3.googleusercontent.com/charlie.jpg"
        )
        val newUser = User(
            id = 4L,
            name = "charlie",
            email = "charlie@gmail.com",
            passwordHash = "",
            googleId = "google789",
            authProvider = AuthProvider.GOOGLE,
            avatarUrl = "https://lh3.googleusercontent.com/charlie.jpg",
            trustScore = BigDecimal.ZERO
        )

        every { userRepository.findByGoogleId("google789") } returns null
        every { userRepository.findByEmail("charlie@gmail.com") } returns null
        every { userRepository.save(any()) } returns newUser

        val result = oAuth2Service.processOAuthUser(oAuth2User)

        assertEquals("charlie", result.name)
    }

    @Test
    fun `generateOAuthResponse returns valid AuthResponse`() {
        val user = createExistingUser(
            id = 1L,
            name = "Alice",
            email = "alice@gmail.com",
            googleId = "google123",
            authProvider = AuthProvider.GOOGLE
        )
        val token = "jwt-token"
        val rawRefreshToken = "raw-refresh-token"
        val hashedRefreshToken = "hashed-refresh-token"
        val refreshTokenSlot = slot<RefreshToken>()

        every { jwtTokenProvider.generateToken(1L, "alice@gmail.com") } returns token
        every { refreshTokenRepository.save(capture(refreshTokenSlot)) } answers { refreshTokenSlot.captured }

        val result = oAuth2Service.generateOAuthResponse(user)

        assertEquals(token, result.token)
        assertNotNull(result.refreshToken)
        assertEquals(1L, result.userId)
        assertEquals("Alice", result.name)
        assertEquals("alice@gmail.com", result.email)
        assertEquals(0.0, result.trustScore)
    }

    @Test
    fun `generateOAuthResponse creates refresh token with correct userId`() {
        val user = createExistingUser(id = 5L)
        val refreshTokenSlot = slot<RefreshToken>()

        every { jwtTokenProvider.generateToken(5L, "alice@gmail.com") } returns "token"
        every { refreshTokenRepository.save(capture(refreshTokenSlot)) } answers { refreshTokenSlot.captured }

        oAuth2Service.generateOAuthResponse(user)

        assertEquals(5L, refreshTokenSlot.captured.userId)
        assertTrue(refreshTokenSlot.captured.expiresAt.isAfter(LocalDateTime.now()))
    }
}
