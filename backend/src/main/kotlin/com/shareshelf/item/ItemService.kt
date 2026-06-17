package com.shareshelf.item

import com.fasterxml.jackson.databind.ObjectMapper
import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.item.dto.CreateItemRequest
import com.shareshelf.item.dto.ItemResponse
import com.shareshelf.item.dto.UpdateItemRequest
import com.shareshelf.item.entity.Item
import com.shareshelf.item.entity.ItemStatus
import jakarta.persistence.EntityNotFoundException
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ItemService(
    private val itemRepository: ItemRepository,
    private val userRepository: UserRepository,
    private val objectMapper: ObjectMapper
) {

    fun create(request: CreateItemRequest, ownerId: Long): ItemResponse {
        val user = userRepository.findById(ownerId)
            .orElseThrow { EntityNotFoundException("User not found") }

        val item = Item(
            ownerId = ownerId,
            title = request.title,
            description = request.description,
            categoryId = request.categoryId,
            dailyPrice = request.dailyPrice,
            depositAmount = request.depositAmount,
            status = ItemStatus.available
        )

        val saved = itemRepository.save(item)
        return toResponse(saved, user.name, user.trustScore.toDouble())
    }

    fun findAll(
        search: String? = null,
        categoryId: Long? = null,
        status: ItemStatus? = null,
        pageable: Pageable
    ): Page<ItemResponse> {
        val items = if (search != null || categoryId != null || status != null) {
            itemRepository.search(search, categoryId, status, pageable)
        } else {
            itemRepository.findAll(pageable)
        }
        return items.map { item ->
            toResponse(item, item.owner?.name ?: "Unknown", item.owner?.trustScore?.toDouble() ?: 0.0)
        }
    }

    fun findById(id: Long): ItemResponse {
        val item = itemRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Item not found") }
        return toResponse(item, item.owner?.name ?: "Unknown", item.owner?.trustScore?.toDouble() ?: 0.0)
    }

    @Transactional
    fun update(id: Long, request: UpdateItemRequest, userId: Long): ItemResponse {
        val item = itemRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Item not found") }

        if (item.ownerId != userId) {
            throw org.springframework.security.access.AccessDeniedException("Only the owner can edit this item")
        }

        request.title?.let { item.title = it }
        request.description?.let { item.description = it }
        request.categoryId?.let { item.categoryId = it }
        request.dailyPrice?.let { item.dailyPrice = it }
        request.depositAmount?.let { item.depositAmount = it }
        request.status?.let { item.status = it }

        val saved = itemRepository.save(item)
        val user = userRepository.findById(saved.ownerId)
        return toResponse(saved, user.map { it.name }.orElse("Unknown"), user.map { it.trustScore.toDouble() }.orElse(0.0))
    }

    @Transactional
    fun delete(id: Long, userId: Long) {
        val item = itemRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Item not found") }
        if (item.ownerId != userId) {
            throw org.springframework.security.access.AccessDeniedException("Only the owner can delete this item")
        }
        itemRepository.delete(item)
    }

    private fun toResponse(item: Item, ownerName: String, ownerTrustScore: Double) = ItemResponse(
        id = item.id!!,
        ownerId = item.ownerId,
        ownerName = ownerName,
        ownerTrustScore = ownerTrustScore,
        categoryId = item.categoryId,
        categoryName = item.category?.name,
        title = item.title,
        description = item.description,
        dailyPrice = item.dailyPrice,
        depositAmount = item.depositAmount,
        status = item.status,
        imageUrls = parseJsonArray(item.imageUrls),
        createdAt = item.createdAt
    )

    private fun parseJsonArray(json: String): List<String> {
        return try {
            objectMapper.readValue(json, Array<String>::class.java).toList()
        } catch (e: Exception) {
            emptyList()
        }
    }
}
