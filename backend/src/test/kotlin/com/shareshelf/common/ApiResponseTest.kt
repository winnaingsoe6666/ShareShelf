package com.shareshelf.common

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class ApiResponseTest {

    private val objectMapper = ObjectMapper().apply {
        // ApiResponse uses @JsonInclude(NON_NULL) — this mapper respects it
        disable(SerializationFeature.FAIL_ON_EMPTY_BEANS)
    }

    @Test
    fun `success should set success=true and include data`() {
        val response = ApiResponse.success("hello")

        assertTrue(response.success)
        assertEquals("hello", response.data)
        assertNull(response.message)
        assertNull(response.errors)
    }

    @Test
    fun `success should allow optional message`() {
        val response = ApiResponse.success("data", message = "Done")

        assertTrue(response.success)
        assertEquals("data", response.data)
        assertEquals("Done", response.message)
    }

    @Test
    fun `created should set success=true with default message`() {
        val response = ApiResponse.created("new-item")

        assertTrue(response.success)
        assertEquals("new-item", response.data)
        assertEquals("Created successfully", response.message)
    }

    @Test
    fun `error should set success=false with message`() {
        val response = ApiResponse.error<String>("Something went wrong")

        assertFalse(response.success)
        assertEquals("Something went wrong", response.message)
        assertNull(response.data)
        assertNull(response.errors)
    }

    @Test
    fun `error should support optional errors list`() {
        val response = ApiResponse.error<String>(
            message = "Validation failed",
            errors = listOf("name is required", "email is invalid")
        )

        assertFalse(response.success)
        assertEquals("Validation failed", response.message)
        assertEquals(2, response.errors!!.size)
        assertTrue(response.errors!!.contains("name is required"))
    }

    @Test
    fun `null fields should be excluded from JSON serialization`() {
        val response = ApiResponse.success("data")

        val json = objectMapper.writeValueAsString(response)

        // message and errors should not appear since they are null
        assertFalse(json.contains("\"message\""))
        assertFalse(json.contains("\"errors\""))
        assertTrue(json.contains("\"success\":true"))
        assertTrue(json.contains("\"data\":\"data\""))
    }

    @Test
    fun `error with null data and errors should exclude them from JSON`() {
        val response = ApiResponse.error<String>("Fail")

        val json = objectMapper.writeValueAsString(response)

        assertFalse(json.contains("\"data\""))
        assertFalse(json.contains("\"errors\""))
        assertTrue(json.contains("\"success\":false"))
        assertTrue(json.contains("\"message\":\"Fail\""))
    }
}
