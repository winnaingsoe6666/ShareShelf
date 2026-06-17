package com.shareshelf.category.dto

data class CategoryResponse(
    val id: Long,
    val name: String,
    val icon: String?,
    val description: String?
)
