package com.shareshelf.review.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime

data class CreateReviewRequest(
    @field:NotNull(message = "Borrow request ID is required")
    val borrowRequestId: Long,

    @field:NotNull(message = "Rating is required")
    @field:Min(1, message = "Rating must be at least 1")
    @field:Max(5, message = "Rating must be at most 5")
    val rating: Int,

    val comment: String? = null
)

data class ReviewResponse(
    val id: Long,
    val borrowRequestId: Long,
    val reviewerId: Long,
    val reviewerName: String,
    val revieweeId: Long,
    val revieweeName: String,
    val rating: Int,
    val comment: String?,
    val createdAt: LocalDateTime
)
