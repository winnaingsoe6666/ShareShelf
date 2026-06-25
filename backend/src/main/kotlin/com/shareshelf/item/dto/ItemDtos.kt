package com.shareshelf.item.dto

import com.shareshelf.item.entity.ItemStatus
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
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

    val depositAmount: BigDecimal? = null,

    @field:Min(-90) @field:Max(90)
    val latitude: Double? = null,

    @field:Min(-180) @field:Max(180)
    val longitude: Double? = null
)

data class UpdateItemRequest(
    val title: String? = null,
    val description: String? = null,
    val categoryId: Long? = null,
    val dailyPrice: BigDecimal? = null,
    val depositAmount: BigDecimal? = null,
    val status: ItemStatus? = null,
    val latitude: Double? = null,
    val longitude: Double? = null
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
    val status: ItemStatus,
    val imageUrls: List<String>,
    val createdAt: LocalDateTime,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val distance: Double? = null
)
