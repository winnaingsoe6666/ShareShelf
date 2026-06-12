package com.shareshelf.auth

import com.shareshelf.auth.dto.AuthResponse
import com.shareshelf.auth.dto.LoginRequest
import com.shareshelf.auth.dto.RegisterRequest
import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.common.ApiResponse
import jakarta.persistence.EntityNotFoundException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    fun register(request: RegisterRequest): ApiResponse<AuthResponse> {
        if (userRepository.existsByEmail(request.email)) {
            return ApiResponse.error("Email already registered")
        }

        val user = User(
            name = request.name,
            email = request.email,
            passwordHash = passwordEncoder.encode(request.password),
            community = request.community,
            phone = request.phone
        )

        val savedUser = userRepository.save(user)
        val token = jwtTokenProvider.generateToken(savedUser.id!!, savedUser.email)

        return ApiResponse.created(toAuthResponse(savedUser, token))
    }

    fun login(request: LoginRequest): ApiResponse<AuthResponse> {
        val user = userRepository.findByEmail(request.email)
            ?: return ApiResponse.error("Invalid email or password")

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            return ApiResponse.error("Invalid email or password")
        }

        val token = jwtTokenProvider.generateToken(user.id!!, user.email)
        return ApiResponse.success(toAuthResponse(user, token))
    }

    fun getCurrentUser(userId: Long): ApiResponse<AuthResponse> {
        val user = userRepository.findById(userId)
            .orElseThrow { EntityNotFoundException("User not found") }

        val token = jwtTokenProvider.generateToken(user.id!!, user.email)
        return ApiResponse.success(toAuthResponse(user, token))
    }

    private fun toAuthResponse(user: User, token: String) = AuthResponse(
        token = token,
        userId = user.id!!,
        name = user.name,
        email = user.email,
        trustScore = user.trustScore,
        community = user.community,
        avatarUrl = user.avatarUrl
    )
}
