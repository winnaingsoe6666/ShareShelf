package com.shareshelf.auth

import io.mockk.*
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails

class JwtAuthenticationFilterTest {

    private val jwtTokenProvider = mockk<JwtTokenProvider>()
    private val userDetailsService = mockk<CustomUserDetailsService>()
    private val jtiBlacklist = mockk<JtiBlacklist>()

    private val filter = JwtAuthenticationFilter(
        jwtTokenProvider = jwtTokenProvider,
        userDetailsService = userDetailsService,
        jtiBlacklist = jtiBlacklist
    )

    @BeforeEach
    fun setUp() {
        clearAllMocks()
        SecurityContextHolder.clearContext()
    }

    @AfterEach
    fun tearDown() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `should authenticate valid non-blacklisted token`() {
        val token = "valid.jwt.token"
        val jti = "jti-123"
        val userDetails = mockk<UserDetails>(relaxed = true)

        val request = MockHttpServletRequest()
        request.addHeader("Authorization", "Bearer $token")
        val response = MockHttpServletResponse()
        val filterChain = mockk<FilterChain>(relaxed = true)

        every { jwtTokenProvider.validateToken(token) } returns true
        every { jwtTokenProvider.getJtiFromToken(token) } returns jti
        every { jtiBlacklist.isBlacklisted(jti) } returns false
        every { jwtTokenProvider.getUserIdFromToken(token) } returns 1L
        every { userDetailsService.loadUserById(1L) } returns userDetails

        filter.doFilter(request, response, filterChain)

        val authentication = SecurityContextHolder.getContext().authentication
        assertNotNull(authentication)
        assertEquals(userDetails, authentication.principal)

        verify(exactly = 1) { filterChain.doFilter(request, response) }
    }

    @Test
    fun `should reject blacklisted token with 401`() {
        val token = "blacklisted.jwt.token"
        val jti = "blacklisted-jti"

        val request = MockHttpServletRequest()
        request.addHeader("Authorization", "Bearer $token")
        val response = MockHttpServletResponse()
        val filterChain = mockk<FilterChain>(relaxed = true)

        every { jwtTokenProvider.validateToken(token) } returns true
        every { jwtTokenProvider.getJtiFromToken(token) } returns jti
        every { jtiBlacklist.isBlacklisted(jti) } returns true

        filter.doFilter(request, response, filterChain)

        // Security context should NOT be set
        assertNull(SecurityContextHolder.getContext().authentication)

        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.status)
        // filter chain should NOT be called since we returned early
        verify(exactly = 0) { filterChain.doFilter(request, response) }
    }

    @Test
    fun `should skip filter when no Authorization header present`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()
        val filterChain = mockk<FilterChain>(relaxed = true)

        filter.doFilter(request, response, filterChain)

        assertNull(SecurityContextHolder.getContext().authentication)
        verify(exactly = 1) { filterChain.doFilter(request, response) }
    }

    @Test
    fun `should skip filter for invalid token`() {
        val token = "invalid.token"

        val request = MockHttpServletRequest()
        request.addHeader("Authorization", "Bearer $token")
        val response = MockHttpServletResponse()
        val filterChain = mockk<FilterChain>(relaxed = true)

        every { jwtTokenProvider.validateToken(token) } returns false

        filter.doFilter(request, response, filterChain)

        assertNull(SecurityContextHolder.getContext().authentication)
        verify(exactly = 1) { filterChain.doFilter(request, response) }
    }
}
