package com.shareshelf.user

import com.shareshelf.auth.UserPrincipal
import com.shareshelf.auth.dto.AuthResponse
import com.shareshelf.common.ApiResponse
import com.shareshelf.user.dto.UpdateProfileRequest
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService
) {

    @PutMapping("/profile")
    fun updateProfile(
        @AuthenticationPrincipal principal: UserPrincipal,
        @RequestBody @Valid request: UpdateProfileRequest
    ): ResponseEntity<ApiResponse<AuthResponse>> {
        val updatedUser = userService.updateProfile(principal.getId(), request)

        val response = toAuthResponse(updatedUser)
        return ResponseEntity.ok(ApiResponse.success(response, message = "Profile updated successfully"))
    }

    @PostMapping("/avatar", consumes = ["multipart/form-data"])
    fun uploadAvatar(
        @AuthenticationPrincipal principal: UserPrincipal,
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<ApiResponse<AuthResponse>> {
        if (file.isEmpty) {
            throw IllegalArgumentException("File is empty")
        }
        val updatedUser = userService.uploadAvatar(principal.getId(), file)
        val response = toAuthResponse(updatedUser)
        return ResponseEntity.ok(ApiResponse.success(response, message = "Avatar uploaded"))
    }

    private fun toAuthResponse(user: com.shareshelf.auth.entity.User): AuthResponse {
        return AuthResponse(
            token = "",
            refreshToken = "",
            userId = user.id!!,
            name = user.name,
            email = user.email,
            trustScore = user.trustScore.toDouble(),
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
}
