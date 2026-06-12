package com.shareshelf.item

import com.shareshelf.auth.UserPrincipal
import com.shareshelf.common.ApiResponse
import com.shareshelf.item.dto.CreateItemRequest
import com.shareshelf.item.dto.ItemResponse
import com.shareshelf.item.dto.UpdateItemRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/items")
class ItemController(
    private val itemService: ItemService
) {

    @GetMapping
    fun listItems(
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) categoryId: Long?,
        @RequestParam(required = false) status: String?
    ): ResponseEntity<ApiResponse<List<ItemResponse>>> {
        val items = itemService.findAll(search, categoryId, status)
        return ResponseEntity.ok(ApiResponse.success(items))
    }

    @GetMapping("/{id}")
    fun getItem(@PathVariable id: Long): ResponseEntity<ApiResponse<ItemResponse>> {
        val item = itemService.findById(id)
        return ResponseEntity.ok(ApiResponse.success(item))
    }

    @PostMapping
    fun createItem(
        @RequestBody @Valid request: CreateItemRequest,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<ItemResponse>> {
        val item = itemService.create(request, principal.getId())
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(item))
    }

    @PutMapping("/{id}")
    fun updateItem(
        @PathVariable id: Long,
        @RequestBody @Valid request: UpdateItemRequest,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<ItemResponse>> {
        val item = itemService.update(id, request, principal.getId())
        return ResponseEntity.ok(ApiResponse.success(item))
    }

    @DeleteMapping("/{id}")
    fun deleteItem(
        @PathVariable id: Long,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<Unit>> {
        itemService.delete(id, principal.getId())
        return ResponseEntity.ok(ApiResponse.success(Unit, message = "Item deleted"))
    }
}
