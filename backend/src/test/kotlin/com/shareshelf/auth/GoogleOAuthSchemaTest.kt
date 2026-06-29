package com.shareshelf.auth

import com.shareshelf.auth.entity.AuthProvider
import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder

class GoogleOAuthSchemaTest {

    private val userRepository = mockk<UserRepository>()
    private val passwordEncoder = mockk<PasswordEncoder>()
    private val jwtTokenProvider = mockk<JwtTokenProvider>()
    private val jtiBlacklist = mockk<JtiBlacklist>(relaxed = true)
    private val refreshTokenRepository = mockk<com.shareshelf.auth.entity.RefreshTokenRepository>()
    private val emailVerificationTokenRepository = mockk<com.shareshelf.auth.entity.EmailVerificationTokenRepository>(relaxed = true)
    private val emailService = mockk<EmailService>(relaxed = true)

    private val authService = AuthService(
        userRepository = userRepository,
        passwordEncoder = passwordEncoder,
        jwtTokenProvider = jwtTokenProvider,
        jtiBlacklist = jtiBlacklist,
        refreshTokenRepository = refreshTokenRepository,
        emailVerificationTokenRepository = emailVerificationTokenRepository,
        emailService = emailService,
        refreshExpirationMs = 604800000
    )

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    // --- AuthProvider enum tests ---

    @Test
    fun `AuthProvider enum has LOCAL and GOOGLE values`() {
        assertEquals(2, AuthProvider.values().size)
        assertNotNull(AuthProvider.LOCAL)
        assertNotNull(AuthProvider.GOOGLE)
    }

    // --- User entity googleId and authProvider field tests ---

    @Test
    fun `User entity has googleId field defaulting to null`() {
        val user = User(
            name = "Test",
            email = "test@example.com",
            passwordHash = "hash"
        )
        assertNull(user.googleId)
    }

    @Test
    fun `User entity has authProvider field defaulting to LOCAL`() {
        val user = User(
            name = "Test",
            email = "test@example.com",
            passwordHash = "hash"
        )
        assertEquals(AuthProvider.LOCAL, user.authProvider)
    }

    @Test
    fun `User entity can be created with GOOGLE authProvider and no password`() {
        val user = User(
            name = "Google User",
            email = "google@example.com",
            passwordHash = "",
            googleId = "google-123",
            authProvider = AuthProvider.GOOGLE
        )
        assertEquals("google-123", user.googleId)
        assertEquals(AuthProvider.GOOGLE, user.authProvider)
        assertTrue(user.passwordHash.isEmpty())
    }

    // --- AuthService login guard tests ---

    @Test
    fun `login should throw BadCredentialsException for Google-only user`() {
        val googleUser = User(
            id = 2L,
            name = "Google User",
            email = "google@example.com",
            passwordHash = "",
            googleId = "google-123",
            authProvider = AuthProvider.GOOGLE,
            isEmailVerified = true
        )

        every { userRepository.findByEmail("google@example.com") } returns googleUser

        val exception = assertThrows(BadCredentialsException::class.java) {
            authService.login(com.shareshelf.auth.dto.LoginRequest(
                email = "google@example.com",
                password = "anypassword"
            ))
        }

        assertEquals("This account uses Google Sign-In. Please use Google to log in.", exception.message)
    }

    @Test
    fun `login should allow LOCAL user with valid password`() {
        val localUser = User(
            id = 1L,
            name = "Local User",
            email = "local@example.com",
            passwordHash = "hashed_password",
            authProvider = AuthProvider.LOCAL,
            isEmailVerified = true
        )

        every { userRepository.findByEmail("local@example.com") } returns localUser
        every { passwordEncoder.matches("password", "hashed_password") } returns true
        every { userRepository.save(any()) } returns localUser
        every { jwtTokenProvider.generateToken(1L, "local@example.com") } returns "token"

        // Mock refresh token creation
        every { refreshTokenRepository.save(any()) } returns mockk(relaxed = true)

        val response = authService.login(com.shareshelf.auth.dto.LoginRequest(
            email = "local@example.com",
            password = "password"
        ))

        assertNotNull(response)
        assertEquals("token", response.token)
    }
}
