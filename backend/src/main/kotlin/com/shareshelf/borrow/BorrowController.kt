package com.shareshelf.borrow

import com.shareshelf.auth.UserPrincipal
import com.shareshelf.borrow.dto.BorrowResponse
import com.shareshelf.borrow.dto.CreateBorrowRequest
import com.shareshelf.common.ApiResponse
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/borrow")
class BorrowController(
    private val borrowService: BorrowService
) {

    @PostMapping
    fun create(
        @RequestBody @Valid request: CreateBorrowRequest,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<BorrowResponse>> {
        val result = borrowService.create(request, principal.getId())
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(result))
    }

    @GetMapping
    fun list(
        @AuthenticationPrincipal principal: UserPrincipal,
        @PageableDefault(size = 20) pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<BorrowResponse>>> {
        val result = borrowService.findByUser(principal.getId(), pageable)
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @PutMapping("/{id}/approve")
    fun approve(
        @PathVariable id: Long,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<BorrowResponse>> {
        val result = borrowService.approve(id, principal.getId())
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @PutMapping("/{id}/reject")
    fun reject(
        @PathVariable id: Long,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<BorrowResponse>> {
        val result = borrowService.reject(id, principal.getId())
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @PutMapping("/{id}/return")
    fun markReturned(
        @PathVariable id: Long,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<BorrowResponse>> {
        val result = borrowService.markReturned(id, principal.getId())
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @PutMapping("/{id}/cancel")
    fun cancel(
        @PathVariable id: Long,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<BorrowResponse>> {
        val result = borrowService.cancel(id, principal.getId())
        return ResponseEntity.ok(ApiResponse.success(result))
    }
}
