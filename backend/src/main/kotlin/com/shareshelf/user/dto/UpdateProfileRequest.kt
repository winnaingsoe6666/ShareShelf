package com.shareshelf.user.dto

import jakarta.validation.constraints.Size

data class UpdateProfileRequest(
    @field:Size(max = 100, message = "Name must be between 1 and 100 characters")
    val name: String?,
    
    @field:Size(max = 1000, message = "Bio must be at most 1000 characters")
    val bio: String?,
    
    @field:Size(max = 255)
    val addressLine1: String?,
    
    @field:Size(max = 255)
    val addressLine2: String?,
    
    @field:Size(max = 100)
    val city: String?,
    
    @field:Size(max = 50)
    val state: String?,
    
    @field:Size(max = 20)
    val zipCode: String?,
    
    @field:Size(max = 255)
    val socialLink: String?,
    
    @field:Size(max = 100)
    val community: String?
)
