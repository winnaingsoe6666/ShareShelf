package com.shareshelf.item

import com.shareshelf.auth.UserPrincipal
import com.shareshelf.common.ApiResponse
import com.shareshelf.item.dto.CreateItemRequest
import com.shareshelf.item.dto.ItemResponse
import com.shareshelf.item.dto.UpdateItemRequest
import com.shareshelf.item.entity.ItemStatus
import com.shareshelf.storage.FileStorageService
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/items")
class ItemController(
    private val itemService: ItemService,
    private val fileStorageService: FileStorageService
) {

    @GetMapping
    fun listItems(
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) categoryId: Long?,
        @RequestParam(required = false) status: ItemStatus?,
        @RequestParam(required = false) minRating: Double?,
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC) pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<ItemResponse>>> {
        val items = itemService.findAll(search, categoryId, status, minRating, pageable)
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

    @PostMapping("/{id}/images", consumes = ["multipart/form-data"])
    fun uploadImage(
        @PathVariable id: Long,
        @RequestParam("file") file: MultipartFile,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<ItemResponse>> {
        if (file.isEmpty) {
            throw IllegalArgumentException("File is empty")
        }

        val imageUrl = fileStorageService.store(file, "items")
        val updatedItem = itemService.addImage(id, imageUrl, principal.getId())
        return ResponseEntity.ok(ApiResponse.success(updatedItem, message = "Image uploaded"))
    }

    @DeleteMapping("/{id}/images")
    fun deleteImage(
        @PathVariable id: Long,
        @RequestParam("url") imageUrl: String,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<ItemResponse>> {
        fileStorageService.delete(imageUrl)
        val updatedItem = itemService.removeImage(id, imageUrl, principal.getId())
        return ResponseEntity.ok(ApiResponse.success(updatedItem, message = "Image deleted"))
    }
}
