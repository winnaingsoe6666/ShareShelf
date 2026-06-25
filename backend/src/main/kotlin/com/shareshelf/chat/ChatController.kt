package com.shareshelf.chat

import com.shareshelf.auth.UserPrincipal
import com.shareshelf.chat.dto.ConversationDetailResponse
import com.shareshelf.chat.dto.ConversationResponse
import com.shareshelf.chat.dto.UnreadCountResponse
import com.shareshelf.common.ApiResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/chat")
class ChatController(
    private val chatService: ChatService
) {

    @GetMapping("/conversations")
    fun getConversations(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<List<ConversationResponse>>> {
        val conversations = chatService.getConversations(principal.getId())
        return ResponseEntity.ok(ApiResponse.success(conversations))
    }

    @GetMapping("/conversations/{itemId}/{otherUserId}")
    fun getConversation(
        @PathVariable itemId: Long,
        @PathVariable otherUserId: Long,
        @RequestParam(required = false) page: Int?,
        @RequestParam(required = false) size: Int?,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<ConversationDetailResponse>> {
        val detail = chatService.getConversation(
            itemId = itemId,
            otherUserId = otherUserId,
            userId = principal.getId(),
            page = page ?: 0,
            size = size?.coerceAtMost(100) ?: 50
        )
        return ResponseEntity.ok(ApiResponse.success(detail))
    }

    @PostMapping("/conversations/{itemId}/{otherUserId}/read")
    fun markAsRead(
        @PathVariable itemId: Long,
        @PathVariable otherUserId: Long,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<Unit>> {
        chatService.markAsRead(
            itemId = itemId,
            senderId = otherUserId,
            receiverId = principal.getId()
        )
        return ResponseEntity.ok(ApiResponse.success(Unit, "Messages marked as read"))
    }

    @GetMapping("/unread-count")
    fun getUnreadCount(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<UnreadCountResponse>> {
        val count = chatService.getUnreadCount(principal.getId())
        return ResponseEntity.ok(ApiResponse.success(count))
    }
}
