package com.shareshelf.auth

import com.shareshelf.auth.dto.AuthResponse
import com.shareshelf.auth.dto.RefreshRequest
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

class AuthControllerTest {

    private val authService = mockk<AuthService>()
    private val authController = AuthController(authService)

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    @Test
    fun `logout should return 200 with success message`() {
        val authHeader = "Bearer valid.jwt.token"
        val token = "valid.jwt.token"

        every { authService.logout(token) } just Runs

        val response = authController.logout(authHeader)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body!!.success)
        assertEquals("Logged out successfully", response.body!!.message)

        verify(exactly = 1) { authService.logout(token) }
    }

    @Test
    fun `logout should propagate service exception`() {
        val authHeader = "Bearer invalid.token"
        val token = "invalid.token"

        every { authService.logout(token) } throws IllegalArgumentException("Invalid token")

        assertThrows(IllegalArgumentException::class.java) {
            authController.logout(authHeader)
        }
    }

    @Test
    fun `refresh should return 200 with new tokens on success`() {
        val refreshToken = "valid-refresh-token"
        val request = RefreshRequest(refreshToken)
        val authResponse = AuthResponse(
            token = "new.access.token",
            refreshToken = "new.refresh.token",
            userId = 1L,
            name = "Test",
            email = "test@example.com",
            trustScore = 5.0,
            community = null,
            avatarUrl = null
        )

        every { authService.refresh(refreshToken) } returns authResponse

        val response = authController.refresh(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        val body = response.body!!
        assertTrue(body.success)
        assertNotNull(body.data)

        verify(exactly = 1) { authService.refresh(refreshToken) }
    }

    @Test
    fun `refresh should propagate service exception`() {
        val refreshToken = "invalid-refresh-token"
        val request = RefreshRequest(refreshToken)

        every { authService.refresh(refreshToken) } throws org.springframework.security.authentication.BadCredentialsException("Invalid refresh token")

        assertThrows(org.springframework.security.authentication.BadCredentialsException::class.java) {
            authController.refresh(request)
        }
    }
}
