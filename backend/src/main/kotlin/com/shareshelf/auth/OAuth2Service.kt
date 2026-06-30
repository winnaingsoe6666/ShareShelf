package com.shareshelf.auth

import com.shareshelf.auth.dto.AuthResponse
import com.shareshelf.auth.entity.AuthProvider
import com.shareshelf.auth.entity.RefreshToken
import com.shareshelf.auth.entity.RefreshTokenRepository
import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
class OAuth2Service(
    private val userRepository: UserRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    private val refreshTokenRepository: RefreshTokenRepository,
    @Value("\${jwt.refresh-expiration-ms}") private val refreshExpirationMs: Long
) {

    @Transactional
    fun processOAuthUser(oAuth2User: OAuth2User): User {
        val googleId = oAuth2User.getAttribute<String>("sub") ?: throw IllegalArgumentException("Google sub claim missing")
        val email = oAuth2User.getAttribute<String>("email") ?: throw IllegalArgumentException("Google email claim missing")
        val name = oAuth2User.getAttribute<String>("name") ?: ""
        val picture = oAuth2User.getAttribute<String>("picture")

        // 1. Find existing user by Google ID
        userRepository.findByGoogleId(googleId)?.let { return it }

        // 2. Find existing user by email — link Google account
        userRepository.findByEmail(email)?.let { existingUser ->
            existingUser.googleId = googleId
            existingUser.authProvider = AuthProvider.GOOGLE
            if (existingUser.avatarUrl == null && picture != null) {
                existingUser.avatarUrl = picture
            }
            existingUser.isEmailVerified = true
            return userRepository.save(existingUser)
        }

        // 3. Create new user
        val newUser = User(
            name = name.ifBlank { email.substringBefore("@") },
            email = email,
            passwordHash = "",
            googleId = googleId,
            authProvider = AuthProvider.GOOGLE,
            avatarUrl = picture,
            isEmailVerified = true
        )
        return userRepository.save(newUser)
    }

    fun generateOAuthResponse(user: User): AuthResponse {
        val token = jwtTokenProvider.generateToken(user.id!!, user.email)
        val refreshToken = createRefreshToken(user.id!!)
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
}
