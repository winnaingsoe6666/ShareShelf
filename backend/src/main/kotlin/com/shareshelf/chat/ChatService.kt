package com.shareshelf.chat

import com.fasterxml.jackson.databind.ObjectMapper
import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.borrow.BorrowRepository
import com.shareshelf.chat.dto.*
import com.shareshelf.chat.entity.ChatMessage
import com.shareshelf.item.ItemRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ChatService(
    private val chatRepository: ChatRepository,
    private val borrowRepository: BorrowRepository,
    private val userRepository: UserRepository,
    private val itemRepository: ItemRepository,
    private val objectMapper: ObjectMapper
) {

    fun getConversations(userId: Long): List<ConversationResponse> {
        val latestMessages = chatRepository.findConversationsByUserId(userId)

        return latestMessages.map { msg ->
            val otherUserId = if (msg.senderId == userId) msg.receiverId else msg.senderId
            val otherUser = userRepository.findById(otherUserId).orElse(null)
            val item = itemRepository.findById(msg.itemId).orElse(null)

            val unreadCount = chatRepository.countUnreadByItemAndReceiver(
                itemId = msg.itemId,
                receiverId = userId,
                senderId = otherUserId
            )

            ConversationResponse(
                itemId = msg.itemId,
                itemTitle = item?.title ?: "Unknown Item",
                itemImageUrl = item?.let { parseJsonArray(it.imageUrls).firstOrNull() },
                otherUserId = otherUserId,
                otherUserName = otherUser?.name ?: "Unknown User",
                lastMessage = msg.message,
                lastMessageAt = msg.createdAt,
                unreadCount = unreadCount
            )
        }
    }

    fun getConversation(
        itemId: Long,
        otherUserId: Long,
        userId: Long,
        page: Int = 0,
        size: Int = 50
    ): ConversationDetailResponse {
        val messages = chatRepository.findConversation(
            itemId = itemId,
            user1Id = userId,
            user2Id = otherUserId,
            pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())
        )

        val otherUser = userRepository.findById(otherUserId).orElse(null)
        val item = itemRepository.findById(itemId).orElse(null)

        return ConversationDetailResponse(
            itemId = itemId,
            itemTitle = item?.title ?: "Unknown Item",
            itemImageUrl = item?.let { parseJsonArray(it.imageUrls).firstOrNull() },
            otherUserId = otherUserId,
            otherUserName = otherUser?.name ?: "Unknown User",
            messages = messages.map { toMessageResponse(it) }
        )
    }

    @Transactional
    fun sendMessage(senderId: Long, request: SendMessageRequest): MessageResponse {
        if (senderId == request.receiverId) {
            throw IllegalArgumentException("Cannot send message to yourself")
        }

        val item = itemRepository.findById(request.itemId)
            .orElseThrow { EntityNotFoundException("Item not found") }

        userRepository.findById(request.receiverId)
            .orElseThrow { EntityNotFoundException("Receiver not found") }

        val isOwner = item.ownerId == senderId
        val hasBorrowRequest = borrowRepository.findByItemIdAndBorrowerId(request.itemId, senderId).isNotEmpty()

        if (!isOwner && !hasBorrowRequest) {
            throw AccessDeniedException("You must have a borrow request for this item to send messages")
        }

        val chatMessage = ChatMessage(
            senderId = senderId,
            receiverId = request.receiverId,
            itemId = request.itemId,
            message = request.message
        )

        val saved = chatRepository.save(chatMessage)
        return toMessageResponse(saved)
    }

    @Transactional
    fun markAsRead(itemId: Long, senderId: Long, receiverId: Long) {
        chatRepository.markAsRead(itemId, senderId, receiverId)
    }

    fun getUnreadCount(userId: Long): UnreadCountResponse {
        val count = chatRepository.countUnreadConversationsByReceiverId(userId)
        return UnreadCountResponse(conversationsWithUnread = count)
    }

    private fun toMessageResponse(msg: ChatMessage): MessageResponse {
        return MessageResponse(
            id = msg.id!!,
            senderId = msg.senderId,
            receiverId = msg.receiverId,
            itemId = msg.itemId,
            message = msg.message,
            readAt = msg.readAt,
            createdAt = msg.createdAt
        )
    }

    private fun parseJsonArray(json: String): List<String> {
        return try {
            objectMapper.readValue(json, Array<String>::class.java).toList()
        } catch (e: Exception) {
            emptyList()
        }
    }
}
