package com.shareshelf.review

import com.shareshelf.auth.UserPrincipal
import com.shareshelf.common.ApiResponse
import com.shareshelf.review.dto.CreateReviewRequest
import com.shareshelf.review.dto.ReviewResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/review")
class ReviewController(
    private val reviewService: ReviewService
) {

    @PostMapping
    fun create(
        @RequestBody @Valid request: CreateReviewRequest,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<ReviewResponse>> {
        val result = reviewService.create(request, principal.getId())
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(result))
    }

    @GetMapping("/user/{userId}")
    fun listByUser(
        @PathVariable userId: Long
    ): ResponseEntity<ApiResponse<List<ReviewResponse>>> {
        val result = reviewService.findByUser(userId)
        return ResponseEntity.ok(ApiResponse.success(result))
    }
}
