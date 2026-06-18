package com.shareshelf.auth

import com.shareshelf.auth.entity.User
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.BigDecimal

class CustomUserDetailsServiceTest {

    @Test
    fun `UserPrincipal getId should return id when user has an id`() {
        val user = User(
            id = 42L,
            name = "Test",
            email = "test@example.com",
            passwordHash = "hash",
            trustScore = BigDecimal("4.0")
        )
        val principal = UserPrincipal(user)
        assertEquals(42L, principal.getId())
    }

    @Test
    fun `UserPrincipal getId should throw IllegalStateException when user id is null`() {
        val user = User(
            id = null,
            name = "Unsaved",
            email = "unsaved@example.com",
            passwordHash = "hash",
            trustScore = BigDecimal("1.0")
        )
        val principal = UserPrincipal(user)

        val exception = assertThrows(IllegalStateException::class.java) {
            principal.getId()
        }
        assertTrue(exception.message!!.contains("no ID") || exception.message!!.contains("No ID"))
    }
}
