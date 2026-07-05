package com.shareshelf.user

import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.auth.entity.User
import com.shareshelf.storage.FileStorageService
import jakarta.persistence.EntityNotFoundException
import com.shareshelf.user.dto.UpdateProfileRequest
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class UserService(
    private val userRepository: UserRepository,
    private val fileStorageService: FileStorageService
) {
    private val logger = LoggerFactory.getLogger(UserService::class.java)

    @Transactional
    fun updateProfile(userId: Long, request: UpdateProfileRequest): User {
        val user = userRepository.findById(userId)
            .orElseThrow { EntityNotFoundException("User not found") }

        // Use explicit assignment to allow clearing fields (null = clear)
        user.name = request.name ?: user.name
        user.bio = request.bio
        user.phone = request.phone
        user.addressLine1 = request.addressLine1
        user.addressLine2 = request.addressLine2
        user.city = request.city
        user.state = request.state
        user.zipCode = request.zipCode
        user.socialLink = request.socialLink
        user.community = request.community

        val saved = userRepository.save(user)
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
            } catch (e: Exception) {
                logger.warn("Failed to delete old avatar: {}", e.message)
            }
        }

        val imageUrl = fileStorageService.store(file, "avatars")
        user.avatarUrl = imageUrl
        val saved = userRepository.save(user)
        return saved
    }
}
