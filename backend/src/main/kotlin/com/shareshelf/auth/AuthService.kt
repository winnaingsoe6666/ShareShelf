package com.shareshelf.auth

import com.shareshelf.auth.dto.AuthResponse
import com.shareshelf.auth.dto.LoginRequest
import com.shareshelf.auth.dto.RegisterRequest
import com.shareshelf.auth.entity.RefreshToken
import com.shareshelf.auth.entity.RefreshTokenRepository
import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.BadCredentialsException
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

    fun register(request: RegisterRequest): AuthResponse {
        if (userRepository.existsByEmail(request.email)) {
            throw IllegalArgumentException("Email already registered")
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

        return toAuthResponse(savedUser, token, refreshToken)
    }

    @Transactional
    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            ?: throw BadCredentialsException("Invalid email or password")

        // Check if account is temporarily locked
        if (user.lockedUntil?.isAfter(LocalDateTime.now()) == true) {
            throw BadCredentialsException("Account is temporarily locked due to too many failed login attempts. Please try again later.")
        }

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            // Track failed login attempts
            user.failedLoginAttempts++
            if (user.failedLoginAttempts >= 5) {
                user.lockedUntil = LocalDateTime.now().plusMinutes(30)
            }
            userRepository.save(user)
            throw BadCredentialsException("Invalid email or password")
        }

        // Reset failed attempts and lock status on successful login
        if (user.failedLoginAttempts > 0) {
            user.failedLoginAttempts = 0
            user.lockedUntil = null
            userRepository.save(user)
        }

        val token = jwtTokenProvider.generateToken(user.id!!, user.email)
        val refreshToken = createRefreshToken(user.id!!)

        return toAuthResponse(user, token, refreshToken)
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
    fun refresh(refreshTokenString: String): AuthResponse {
        val hashedToken = hashToken(refreshTokenString)
        val storedToken = refreshTokenRepository.findByToken(hashedToken)
            ?: throw BadCredentialsException("Invalid refresh token")

        if (storedToken.revoked) {
            throw BadCredentialsException("Refresh token has been revoked")
        }

        if (storedToken.expiresAt.isBefore(LocalDateTime.now())) {
            throw BadCredentialsException("Refresh token has expired")
        }

        // Revoke the old refresh token (single-use rotation)
        storedToken.revoked = true
        refreshTokenRepository.save(storedToken)

        val user = userRepository.findById(storedToken.userId)
            .orElseThrow { EntityNotFoundException("User not found") }

        val newAccessToken = jwtTokenProvider.generateToken(user.id!!, user.email)
        val newRefreshToken = createRefreshToken(user.id!!)

        return toAuthResponse(user, newAccessToken, newRefreshToken)
    }

    fun getCurrentUser(userId: Long): AuthResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { EntityNotFoundException("User not found") }

        val token = jwtTokenProvider.generateToken(user.id!!, user.email)
        val refreshToken = createRefreshToken(user.id!!)

        return toAuthResponse(user, token, refreshToken)
    }

    private fun createRefreshToken(userId: Long): String {
        val rawToken = UUID.randomUUID().toString()
        val hashedToken = hashToken(rawToken)
        val expiresAt = LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000)

        val refreshToken = RefreshToken(
            token = hashedToken,
            userId = userId,
            expiresAt = expiresAt,
            revoked = false
        )

        refreshTokenRepository.save(refreshToken)
        return rawToken
    }

    private fun hashToken(token: String): String {
        return java.security.MessageDigest.getInstance("SHA-256")
            .digest(token.toByteArray())
            .joinToString("") { "%02x".format(it) }
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
