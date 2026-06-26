package com.shareshelf.user

import com.shareshelf.auth.UserPrincipal
import com.shareshelf.auth.dto.AuthResponse
import com.shareshelf.common.ApiResponse
import com.shareshelf.user.dto.UpdateProfileRequest
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

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
        
        // Convert to AuthResponse (similar to what AuthService does)
        val response = AuthResponse(
            token = "", // Not needed for profile update response, or frontend can ignore it
            refreshToken = "",
            userId = updatedUser.id!!,
            name = updatedUser.name,
            email = updatedUser.email,
            trustScore = updatedUser.trustScore.toDouble(),
            community = updatedUser.community,
            avatarUrl = updatedUser.avatarUrl,
            bio = updatedUser.bio,
            isIdVerified = updatedUser.isIdVerified,
            addressLine1 = updatedUser.addressLine1,
            addressLine2 = updatedUser.addressLine2,
            city = updatedUser.city,
            state = updatedUser.state,
            zipCode = updatedUser.zipCode,
            socialLink = updatedUser.socialLink
        )
        
        return ResponseEntity.ok(ApiResponse.success(response, message = "Profile updated successfully"))
    }
}
