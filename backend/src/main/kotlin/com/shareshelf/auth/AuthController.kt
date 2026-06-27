package com.shareshelf.auth

import com.shareshelf.auth.dto.AuthResponse
import com.shareshelf.auth.dto.LoginRequest
import com.shareshelf.auth.dto.RefreshRequest
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
    fun register(@RequestBody @Valid request: RegisterRequest): ResponseEntity<ApiResponse<AuthResponse>> {
        val result = authService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(result))
    }

    @PostMapping("/login")
    fun login(@RequestBody @Valid request: LoginRequest): ResponseEntity<ApiResponse<AuthResponse>> {
        val result = authService.login(request)
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @GetMapping("/me")
    fun me(@AuthenticationPrincipal principal: UserPrincipal): ResponseEntity<ApiResponse<AuthResponse>> {
        val result = authService.getCurrentUser(principal.getId())
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @PostMapping("/logout")
    fun logout(@RequestHeader("Authorization") authHeader: String): ResponseEntity<ApiResponse<Unit>> {
        val token = authHeader.removePrefix("Bearer ")
        authService.logout(token)
        return ResponseEntity.ok(ApiResponse.success(Unit, message = "Logged out successfully"))
    }

    @PostMapping("/refresh")
    fun refresh(@RequestBody @Valid request: RefreshRequest): ResponseEntity<ApiResponse<AuthResponse>> {
        val result = authService.refresh(request.refreshToken)
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @GetMapping("/verify-email")
    fun verifyEmail(@RequestParam token: String): ResponseEntity<ApiResponse<AuthResponse>> {
        val result = authService.verifyEmail(token)
        return ResponseEntity.ok(ApiResponse.success(result, message = "Email verified successfully"))
    }
}
