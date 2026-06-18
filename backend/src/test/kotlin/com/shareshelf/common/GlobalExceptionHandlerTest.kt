package com.shareshelf.common

import io.mockk.every
import io.mockk.mockk
import jakarta.persistence.EntityNotFoundException
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.core.env.Environment
import org.springframework.core.env.Profiles
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.AuthenticationException
import org.springframework.validation.BeanPropertyBindingResult
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException

class GlobalExceptionHandlerTest {

    private val env = mockk<Environment>()
    private val handler = GlobalExceptionHandler(env)

    private val mockRequest = mockk<HttpServletRequest> {
        every { method } returns "GET"
        every { requestURI } returns "/api/items"
    }

    @Test
    fun `handleNotFound should return 404`() {
        val response = handler.handleNotFound(EntityNotFoundException("Item not found"))

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        assertFalse(response.body!!.success)
        assertEquals("Item not found", response.body!!.message)
    }

    @Test
    fun `handleNotFound should use fallback message when exception message is null`() {
        val response = handler.handleNotFound(EntityNotFoundException())

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        assertEquals("Resource not found", response.body!!.message)
    }

    @Test
    fun `handleBadArgument should return 400`() {
        val response = handler.handleBadArgument(IllegalArgumentException("Email is required"))

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertFalse(response.body!!.success)
        assertEquals("Email is required", response.body!!.message)
    }

    @Test
    fun `handleBadArgument should use fallback when message is null`() {
        val response = handler.handleBadArgument(IllegalArgumentException())

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Invalid request", response.body!!.message)
    }

    @Test
    fun `handleIllegalState should return 409`() {
        val response = handler.handleIllegalState(IllegalStateException("Item not available"))

        assertEquals(HttpStatus.CONFLICT, response.statusCode)
        assertFalse(response.body!!.success)
        assertEquals("Item not available", response.body!!.message)
    }

    @Test
    fun `handleIllegalState should use fallback when message is null`() {
        val response = handler.handleIllegalState(IllegalStateException())

        assertEquals(HttpStatus.CONFLICT, response.statusCode)
        assertEquals("Operation not allowed", response.body!!.message)
    }

    @Test
    fun `handleAccessDenied should return 403`() {
        val response = handler.handleAccessDenied(AccessDeniedException("Not your item"))

        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
        assertFalse(response.body!!.success)
        assertEquals("Access denied", response.body!!.message)
    }

    @Test
    fun `handleBadCredentials should return 401`() {
        val response = handler.handleBadCredentials(BadCredentialsException("Bad credentials"))

        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
        assertFalse(response.body!!.success)
        assertEquals("Bad credentials", response.body!!.message)
    }

    @Test
    fun `handleBadCredentials should return 401 with given message`() {
        val response = handler.handleBadCredentials(BadCredentialsException("Wrong password"))

        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
        assertEquals("Wrong password", response.body!!.message)
    }

    @Test
    fun `handleAuthentication should return 401`() {
        val response = handler.handleAuthentication(object : AuthenticationException("Token expired") {})

        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
        assertFalse(response.body!!.success)
        assertEquals("Token expired", response.body!!.message)
    }

    @Test
    fun `handleValidation should return 400 with field errors`() {
        val bindingResult = BeanPropertyBindingResult(Any(), "request")
        bindingResult.addError(FieldError("request", "name", "Name is required"))
        bindingResult.addError(FieldError("request", "email", "Invalid email format"))
        val methodParameter = mockk<org.springframework.core.MethodParameter>()
        val ex = MethodArgumentNotValidException(methodParameter, bindingResult)

        val response = handler.handleValidation(ex)

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertFalse(response.body!!.success)
        assertEquals("Validation failed", response.body!!.message)
        assertEquals(2, response.body!!.errors!!.size)
        assertTrue(response.body!!.errors!!.any { it.contains("name") })
        assertTrue(response.body!!.errors!!.any { it.contains("email") })
    }

    @Test
    fun `handleGeneral should return 500 with detailed message in dev profile`() {
        every { env.acceptsProfiles(Profiles.of("dev", "default")) } returns true

        val response = handler.handleGeneral(RuntimeException("Database down"), mockRequest)

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.statusCode)
        assertFalse(response.body!!.success)
        assertTrue(response.body!!.message!!.contains("Database down"))
    }

    @Test
    fun `handleGeneral should return 500 with generic message in non-dev profile`() {
        every { env.acceptsProfiles(Profiles.of("dev", "default")) } returns false

        val response = handler.handleGeneral(RuntimeException("Database down"), mockRequest)

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.statusCode)
        assertFalse(response.body!!.success)
        assertEquals("Internal server error", response.body!!.message)
    }
}
