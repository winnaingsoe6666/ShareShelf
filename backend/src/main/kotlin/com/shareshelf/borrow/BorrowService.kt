package com.shareshelf.borrow

import com.fasterxml.jackson.core.`type`.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.borrow.dto.BorrowResponse
import com.shareshelf.borrow.dto.CreateBorrowRequest
import com.shareshelf.borrow.entity.BorrowRequest
import com.shareshelf.borrow.entity.BorrowStatus
import com.shareshelf.item.ItemRepository
import com.shareshelf.item.entity.ItemStatus
import com.shareshelf.notification.NotificationService
import com.shareshelf.notification.entity.NotificationType
import jakarta.persistence.EntityNotFoundException
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BorrowService(
    private val borrowRepository: BorrowRepository,
    private val itemRepository: ItemRepository,
    private val userRepository: UserRepository,
    private val notificationService: NotificationService,
    private val objectMapper: ObjectMapper
) {

    @Transactional
    fun create(request: CreateBorrowRequest, borrowerId: Long): BorrowResponse {
        val item = itemRepository.findById(request.itemId)
            .orElseThrow { EntityNotFoundException("Item not found") }

        if (item.status != ItemStatus.available) {
            throw IllegalStateException("Item is not available for borrowing")
        }

        if (item.ownerId == borrowerId) {
            throw IllegalArgumentException("You cannot borrow your own item")
        }

        val borrow = BorrowRequest(
            itemId = request.itemId,
            borrowerId = borrowerId,
            ownerId = item.ownerId,
            message = request.message,
            startDate = request.startDate,
            endDate = request.endDate
        )

        val saved = borrowRepository.save(borrow)

        // Notify owner that someone wants to borrow their item
        val borrower = userRepository.findById(borrowerId)
        val borrowerName = borrower.map { it.name }.orElse("Someone")
        notificationService.create(
            userId = item.ownerId,
            type = NotificationType.borrow_requested,
            message = "$borrowerName wants to borrow $item.title",
            relatedItemId = item.id,
            relatedBorrowId = saved.id
        )

        return toResponse(saved, item.title, parseFirstImage(item.imageUrls))
    }

    fun findByUser(userId: Long, pageable: Pageable): Page<BorrowResponse> {
        val borrows = borrowRepository.findByUserId(userId, pageable)
        return borrows.map { borrow ->
            val item = itemRepository.findById(borrow.itemId)
            val borrower = userRepository.findById(borrow.borrowerId)
            val owner = userRepository.findById(borrow.ownerId)
            BorrowResponse(
                id = borrow.id!!,
                itemId = borrow.itemId,
                itemTitle = item.map { it.title }.orElse("Unknown"),
                itemImageUrl = item.map { parseFirstImage(it.imageUrls) }.orElse(null),
                borrowerId = borrow.borrowerId,
                borrowerName = borrower.map { it.name }.orElse("Unknown"),
                ownerId = borrow.ownerId,
                ownerName = owner.map { it.name }.orElse("Unknown"),
                status = borrow.status,
                startDate = borrow.startDate,
                endDate = borrow.endDate,
                message = borrow.message,
                createdAt = borrow.createdAt
            )
        }
    }

    @Transactional
    fun approve(id: Long, userId: Long): BorrowResponse {
        val borrow = borrowRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Borrow request not found") }

        if (borrow.ownerId != userId) {
            throw org.springframework.security.access.AccessDeniedException("Only the owner can approve requests")
        }
        if (borrow.status != BorrowStatus.pending) {
            throw IllegalStateException("Only pending requests can be approved")
        }

        // Mark item as borrowed only when owner approves
        val item = itemRepository.findById(borrow.itemId)
            .orElseThrow { EntityNotFoundException("Item not found") }
        item.status = ItemStatus.borrowed
        itemRepository.save(item)

        borrow.status = BorrowStatus.approved
        val saved = borrowRepository.save(borrow)

        // Notify borrower that their request was approved
        val owner = userRepository.findById(userId)
        val ownerName = owner.map { it.name }.orElse("The owner")
        notificationService.create(
            userId = borrow.borrowerId,
            type = NotificationType.borrow_approved,
            message = "$ownerName approved your request for ${item.title}",
            relatedItemId = item.id,
            relatedBorrowId = saved.id
        )

        return toResponse(saved)
    }

    @Transactional
    fun reject(id: Long, userId: Long): BorrowResponse {
        val borrow = borrowRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Borrow request not found") }

        if (borrow.ownerId != userId) {
            throw org.springframework.security.access.AccessDeniedException("Only the owner can reject requests")
        }
        if (borrow.status != BorrowStatus.pending) {
            throw IllegalStateException("Only pending requests can be rejected")
        }

        borrow.status = BorrowStatus.rejected
        val saved = borrowRepository.save(borrow)

        // Make item available again (safety net in case item was borrowed by another request)
        val item = itemRepository.findById(borrow.itemId)
        val itemTitle = item.map { it.title }.orElse("an item")
        item.ifPresent {
            it.status = ItemStatus.available
            itemRepository.save(it)
        }

        // Notify borrower that their request was rejected
        val owner = userRepository.findById(userId)
        val ownerName = owner.map { it.name }.orElse("The owner")
        notificationService.create(
            userId = borrow.borrowerId,
            type = NotificationType.borrow_rejected,
            message = "$ownerName declined your request for $itemTitle",
            relatedItemId = borrow.itemId,
            relatedBorrowId = saved.id
        )

        return toResponse(saved)
    }

    @Transactional
    fun markReturned(id: Long, userId: Long): BorrowResponse {
        val borrow = borrowRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Borrow request not found") }

        if (borrow.ownerId != userId) {
            throw org.springframework.security.access.AccessDeniedException("Only the owner can mark items as returned")
        }
        if (borrow.status != BorrowStatus.approved) {
            throw IllegalStateException("Only approved borrows can be marked as returned")
        }

        borrow.status = BorrowStatus.returned
        val saved = borrowRepository.save(borrow)

        // Make item available again after return
        val item = itemRepository.findById(borrow.itemId)
        val itemTitle = item.map { it.title }.orElse("an item")
        item.ifPresent {
            it.status = ItemStatus.available
            itemRepository.save(it)
        }

        // Notify borrower that the item was marked as returned
        val owner = userRepository.findById(userId)
        val ownerName = owner.map { it.name }.orElse("The owner")
        notificationService.create(
            userId = borrow.borrowerId,
            type = NotificationType.borrow_returned,
            message = "$ownerName marked $itemTitle as returned",
            relatedItemId = borrow.itemId,
            relatedBorrowId = saved.id
        )

        return toResponse(saved)
    }

    private fun toResponse(
        borrow: BorrowRequest,
        itemTitle: String? = null,
        itemImageUrl: String? = null
    ): BorrowResponse {
        val borrower = userRepository.findById(borrow.borrowerId)
        val owner = userRepository.findById(borrow.ownerId)
        val item = itemRepository.findById(borrow.itemId)

        return BorrowResponse(
            id = borrow.id!!,
            itemId = borrow.itemId,
            itemTitle = itemTitle ?: item.map { it.title }.orElse("Unknown"),
            itemImageUrl = itemImageUrl ?: item.map { parseFirstImage(it.imageUrls) }.orElse(null),
            borrowerId = borrow.borrowerId,
            borrowerName = borrower.map { it.name }.orElse("Unknown"),
            ownerId = borrow.ownerId,
            ownerName = owner.map { it.name }.orElse("Unknown"),
            status = borrow.status,
            startDate = borrow.startDate,
            endDate = borrow.endDate,
            message = borrow.message,
            createdAt = borrow.createdAt
        )
    }

    private fun parseFirstImage(json: String): String? {
        return try {
            val list: List<String> = objectMapper.readValue(json, object : TypeReference<List<String>>() {})
            list.firstOrNull()
        } catch (e: Exception) {
            null
        }
    }
}
