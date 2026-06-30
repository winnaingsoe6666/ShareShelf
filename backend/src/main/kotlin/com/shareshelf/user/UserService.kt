package com.shareshelf.user

import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.auth.entity.User
import com.shareshelf.review.ReviewService
import com.shareshelf.storage.FileStorageService
import jakarta.persistence.EntityNotFoundException
import com.shareshelf.user.dto.UpdateProfileRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class UserService(
    private val userRepository: UserRepository,
    private val fileStorageService: FileStorageService,
    private val reviewService: ReviewService
) {
    @Transactional
    fun updateProfile(userId: Long, request: UpdateProfileRequest): User {
        val user = userRepository.findById(userId)
            .orElseThrow { EntityNotFoundException("User not found") }

        request.name?.let { user.name = it }
        request.bio?.let { user.bio = it }
        request.addressLine1?.let { user.addressLine1 = it }
        request.addressLine2?.let { user.addressLine2 = it }
        request.city?.let { user.city = it }
        request.state?.let { user.state = it }
        request.zipCode?.let { user.zipCode = it }
        request.socialLink?.let { user.socialLink = it }
        request.community?.let { user.community = it }

        val saved = userRepository.save(user)
        reviewService.updateTrustScore(userId)
        return saved
    }

    @Transactional
    fun uploadAvatar(userId: Long, file: MultipartFile): User {
        val user = userRepository.findById(userId)
            .orElseThrow { EntityNotFoundException("User not found") }

        // Delete old avatar if it exists
        user.avatarUrl?.let { oldUrl ->
            try {
                fileStorageService.delete(oldUrl)
            } catch (_: Exception) { /* ignore cleanup failures */ }
        }

        val imageUrl = fileStorageService.store(file, "avatars")
        user.avatarUrl = imageUrl
        val saved = userRepository.save(user)
        reviewService.updateTrustScore(userId)
        return saved
    }
}
