package com.shareshelf.user

import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.auth.entity.User
import jakarta.persistence.EntityNotFoundException
import com.shareshelf.user.dto.UpdateProfileRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(
    private val userRepository: UserRepository
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

        return userRepository.save(user)
    }
}
