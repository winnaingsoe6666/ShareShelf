package com.shareshelf.auth

import com.shareshelf.auth.dto.AuthResponse
import com.shareshelf.auth.dto.LoginRequest
import com.shareshelf.auth.dto.RegisterRequest
import com.shareshelf.auth.entity.RefreshToken
import com.shareshelf.auth.entity.RefreshTokenRepository
import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.common.ApiResponse
import jakarta.persistence.EntityNotFoundException
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val jtiBlacklist: JtiBlacklist,
    private val refreshTokenRepository: RefreshTokenRepository,
    @Value("\${jwt.refresh-expiration-ms}") private val refreshExpirationMs: Long
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
        val refreshToken = createRefreshToken(savedUser.id!!)

        return ApiResponse.created(toAuthResponse(savedUser, token, refreshToken))
    }

    fun login(request: LoginRequest): ApiResponse<AuthResponse> {
        val user = userRepository.findByEmail(request.email)
            ?: return ApiResponse.error("Invalid email or password")

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            return ApiResponse.error("Invalid email or password")
        }

        val token = jwtTokenProvider.generateToken(user.id!!, user.email)
        val refreshToken = createRefreshToken(user.id!!)

        return ApiResponse.success(toAuthResponse(user, token, refreshToken))
    }

    fun logout(token: String) {
        try {
            val jti = jwtTokenProvider.getJtiFromToken(token)
            val expiresAt = jwtTokenProvider.getExpirationFromToken(token)
            jtiBlacklist.blacklist(jti, expiresAt)
        } catch (e: Exception) {
            throw IllegalArgumentException("Invalid token")
        }
    }

    @Transactional
    fun refresh(refreshTokenString: String): ApiResponse<AuthResponse> {
        val storedToken = refreshTokenRepository.findByToken(refreshTokenString)
            ?: return ApiResponse.error("Invalid refresh token")

        if (storedToken.revoked) {
            return ApiResponse.error("Refresh token has been revoked")
        }

        if (storedToken.expiresAt.isBefore(LocalDateTime.now())) {
            return ApiResponse.error("Refresh token has expired")
        }

        // Revoke the old refresh token (single-use rotation)
        storedToken.revoked = true
        refreshTokenRepository.save(storedToken)

        val user = userRepository.findById(storedToken.userId)
            .orElseThrow { EntityNotFoundException("User not found") }

        val newAccessToken = jwtTokenProvider.generateToken(user.id!!, user.email)
        val newRefreshToken = createRefreshToken(user.id!!)

        return ApiResponse.success(toAuthResponse(user, newAccessToken, newRefreshToken))
    }

    fun getCurrentUser(userId: Long): ApiResponse<AuthResponse> {
        val user = userRepository.findById(userId)
            .orElseThrow { EntityNotFoundException("User not found") }

        val token = jwtTokenProvider.generateToken(user.id!!, user.email)
        val refreshToken = createRefreshToken(user.id!!)

        return ApiResponse.success(toAuthResponse(user, token, refreshToken))
    }

    private fun createRefreshToken(userId: Long): String {
        val token = UUID.randomUUID().toString()
        val expiresAt = LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000)

        val refreshToken = RefreshToken(
            token = token,
            userId = userId,
            expiresAt = expiresAt,
            revoked = false
        )

        refreshTokenRepository.save(refreshToken)
        return token
    }

    private fun toAuthResponse(user: User, token: String, refreshToken: String) = AuthResponse(
        token = token,
        refreshToken = refreshToken,
        userId = user.id!!,
        name = user.name,
        email = user.email,
        trustScore = user.trustScore.toDouble(),
        community = user.community,
        avatarUrl = user.avatarUrl
    )
}
