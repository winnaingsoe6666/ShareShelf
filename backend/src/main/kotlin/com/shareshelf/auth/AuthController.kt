package com.shareshelf.auth

import com.shareshelf.auth.dto.LoginRequest
import com.shareshelf.auth.dto.RegisterRequest
import com.shareshelf.common.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/register")
    fun register(@RequestBody @Valid request: RegisterRequest): ResponseEntity<ApiResponse<*>> {
        val response = authService.register(request)
        return if (response.success) {
            ResponseEntity.status(HttpStatus.CREATED).body(response)
        } else {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
        }
    }

    @PostMapping("/login")
    fun login(@RequestBody @Valid request: LoginRequest): ResponseEntity<ApiResponse<*>> {
        val response = authService.login(request)
        return if (response.success) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response)
        }
    }

    @GetMapping("/me")
    fun me(@AuthenticationPrincipal principal: UserPrincipal): ResponseEntity<ApiResponse<*>> {
        val response = authService.getCurrentUser(principal.getId())
        return ResponseEntity.ok(response)
    }
}
