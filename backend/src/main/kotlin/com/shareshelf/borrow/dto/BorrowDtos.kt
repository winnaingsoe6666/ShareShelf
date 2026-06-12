package com.shareshelf.borrow.dto

import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import java.time.LocalDateTime

data class CreateBorrowRequest(
    @field:NotNull(message = "Item ID is required")
    val itemId: Long,

    val message: String? = null,

    val startDate: LocalDate? = null,

    val endDate: LocalDate? = null
)

data class BorrowResponse(
    val id: Long,
    val itemId: Long,
    val itemTitle: String,
    val itemImageUrl: String?,
    val borrowerId: Long,
    val borrowerName: String,
    val ownerId: Long,
    val ownerName: String,
    val status: String,
    val startDate: LocalDate?,
    val endDate: LocalDate?,
    val message: String?,
    val createdAt: LocalDateTime
)
