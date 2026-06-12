package com.shareshelf.item.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.LocalDateTime

data class CreateItemRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 200, message = "Title must be at most 200 characters")
    val title: String,

    val description: String? = null,

    val categoryId: Long? = null,

    val dailyPrice: BigDecimal? = null,

    val depositAmount: BigDecimal? = null
)

data class UpdateItemRequest(
    val title: String? = null,
    val description: String? = null,
    val categoryId: Long? = null,
    val dailyPrice: BigDecimal? = null,
    val depositAmount: BigDecimal? = null,
    val status: String? = null
)

data class ItemResponse(
    val id: Long,
    val ownerId: Long,
    val ownerName: String,
    val ownerTrustScore: Double,
    val categoryId: Long?,
    val categoryName: String?,
    val title: String,
    val description: String?,
    val dailyPrice: BigDecimal?,
    val depositAmount: BigDecimal?,
    val status: String,
    val imageUrls: List<String>,
    val createdAt: LocalDateTime
)
