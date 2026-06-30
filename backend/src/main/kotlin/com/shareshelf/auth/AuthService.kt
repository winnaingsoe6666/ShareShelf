package com.shareshelf.auth

import com.shareshelf.auth.dto.AuthResponse
import com.shareshelf.auth.dto.LoginRequest
import com.shareshelf.auth.dto.RegisterRequest
import com.shareshelf.auth.entity.RefreshToken
import com.shareshelf.auth.entity.RefreshTokenRepository
import com.shareshelf.auth.entity.EmailVerificationToken
import com.shareshelf.auth.entity.EmailVerificationTokenRepository
import com.shareshelf.auth.entity.AuthProvider
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
    private val emailVerificationTokenRepository: EmailVerificationTokenRepository,
    private val emailService: EmailService,
    @Value("\${jwt.refresh-expiration-ms}") private val refreshExpirationMs: Long
) {

    @Transactional
    fun register(request: RegisterRequest): AuthResponse {
        var user = userRepository.findByEmail(request.email)
        
        if (user != null) {
            if (user.isEmailVerified) {
                throw IllegalArgumentException("Email already registered")
            }
            
            // Delete old verification tokens so we can generate a fresh one
            emailVerificationTokenRepository.deleteByUser(user)
            
            // Overwrite existing unverified details with the new ones
            user.name = request.name
            user.passwordHash = passwordEncoder.encode(request.password)
            user.community = request.community
            user.phone = request.phone
        } else {
            user = User(
                name = request.name,
                email = request.email,
                passwordHash = passwordEncoder.encode(request.password),
                community = request.community,
                phone = request.phone,
                isEmailVerified = false
            )
        }

        val savedUser = userRepository.save(user)

        val tokenString = UUID.randomUUID().toString()
        val verificationToken = EmailVerificationToken(
            token = tokenString,
            user = savedUser,
            expiresAt = LocalDateTime.now().plusHours(24)
        )
        emailVerificationTokenRepository.save(verificationToken)
        
        emailService.sendVerificationEmail(savedUser.email, tokenString)

        return toAuthResponse(savedUser, "", "")
    }

    @Transactional
    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            ?: throw BadCredentialsException("Invalid email or password")

        if (!user.isEmailVerified) {
            throw BadCredentialsException("Please verify your email address before logging in.")
        }

        if (user.lockedUntil?.isAfter(LocalDateTime.now()) == true) {
            throw BadCredentialsException("Account is temporarily locked due to too many failed login attempts. Please try again later.")
        }

        if (user.authProvider == AuthProvider.GOOGLE && user.passwordHash.isNullOrEmpty()) {
            throw BadCredentialsException("This account uses Google Sign-In. Please use Google to log in.")
        }

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            user.failedLoginAttempts++
            if (user.failedLoginAttempts >= 5) {
                user.lockedUntil = LocalDateTime.now().plusMinutes(30)
            }
            userRepository.save(user)
            throw BadCredentialsException("Invalid email or password")
        }

        if (user.failedLoginAttempts > 0) {
            user.failedLoginAttempts = 0
            user.lockedUntil = null
            userRepository.save(user)
        }

        val token = jwtTokenProvider.generateToken(
            user.id ?: throw IllegalStateException("User was saved but no ID was generated"),
            user.email
        )
        val refreshToken = createRefreshToken(
            user.id ?: throw IllegalStateException("User was saved but no ID was generated")
        )

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

        storedToken.revoked = true
        refreshTokenRepository.save(storedToken)

        val user = userRepository.findById(storedToken.userId)
            .orElseThrow { EntityNotFoundException("User not found") }

        val newAccessToken = jwtTokenProvider.generateToken(
            user.id ?: throw IllegalStateException("User was saved but no ID was generated"),
            user.email
        )
        val newRefreshToken = createRefreshToken(
            user.id ?: throw IllegalStateException("User was saved but no ID was generated")
        )

        return toAuthResponse(user, newAccessToken, newRefreshToken)
    }

    fun getCurrentUser(userId: Long): AuthResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { EntityNotFoundException("User not found") }

        val token = jwtTokenProvider.generateToken(
            user.id ?: throw IllegalStateException("User was saved but no ID was generated"),
            user.email
        )
        val refreshToken = createRefreshToken(
            user.id ?: throw IllegalStateException("User was saved but no ID was generated")
        )

        return toAuthResponse(user, token, refreshToken)
    }

    @Transactional
    fun verifyEmail(token: String): AuthResponse {
        val verificationToken = emailVerificationTokenRepository.findByToken(token)
            ?: throw IllegalArgumentException("Invalid verification token")

        if (verificationToken.expiresAt.isBefore(LocalDateTime.now())) {
            throw IllegalArgumentException("Verification token has expired")
        }

        val user = verificationToken.user
        user.isEmailVerified = true
        userRepository.save(user)
        
        emailVerificationTokenRepository.delete(verificationToken)

        val newAccessToken = jwtTokenProvider.generateToken(user.id!!, user.email)
        val newRefreshToken = createRefreshToken(user.id!!)

        return toAuthResponse(user, newAccessToken, newRefreshToken)
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

    private fun toAuthResponse(user: User, token: String, refreshToken: String): AuthResponse {
        val profileBonus = calculateProfileBonus(user)
        return AuthResponse(
            token = token,
            refreshToken = refreshToken,
            userId = user.id!!,
            name = user.name,
            email = user.email,
            trustScore = user.trustScore.toDouble(),
            profileBonus = profileBonus,
            community = user.community,
            avatarUrl = user.avatarUrl,
            bio = user.bio,
            isIdVerified = user.isIdVerified,
            addressLine1 = user.addressLine1,
            addressLine2 = user.addressLine2,
            city = user.city,
            state = user.state,
            zipCode = user.zipCode,
            socialLink = user.socialLink
        )
    }

    private fun calculateProfileBonus(user: User): Double {
        var bonus = 0.0
        if (user.isEmailVerified) bonus += 0.2
        if (user.isIdVerified) bonus += 0.3
        val hasCompleteProfile = !user.bio.isNullOrBlank() &&
            !user.avatarUrl.isNullOrBlank() &&
            !user.community.isNullOrBlank() &&
            !user.phone.isNullOrBlank()
        if (hasCompleteProfile) bonus += 0.2
        return bonus
    }
}
