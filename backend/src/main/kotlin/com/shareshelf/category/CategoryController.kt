package com.shareshelf.category

import com.shareshelf.category.dto.CategoryResponse
import com.shareshelf.common.ApiResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/categories")
class CategoryController(
    private val categoryRepository: CategoryRepository
) {
    @GetMapping
    fun listCategories(): ResponseEntity<ApiResponse<List<CategoryResponse>>> {
        val categories = categoryRepository.findAll().map { category ->
            CategoryResponse(
                id = category.id!!,
                name = category.name,
                icon = category.icon,
                description = category.description
            )
        }
        return ResponseEntity.ok(ApiResponse.success(categories))
    }
}
