package com.shareshelf.notification

import com.shareshelf.auth.UserPrincipal
import com.shareshelf.common.ApiResponse
import com.shareshelf.notification.dto.NotificationResponse
import com.shareshelf.notification.dto.UnreadCountResponse
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/notifications")
class NotificationController(
    private val notificationService: NotificationService
) {

    @GetMapping
    fun list(
        @AuthenticationPrincipal principal: UserPrincipal,
        @PageableDefault(size = 20) pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<NotificationResponse>>> {
        val result = notificationService.findByUser(principal.getId(), pageable)
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @GetMapping("/unread-count")
    fun unreadCount(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<UnreadCountResponse>> {
        val count = notificationService.getUnreadCount(principal.getId())
        return ResponseEntity.ok(ApiResponse.success(UnreadCountResponse(count)))
    }

    @PutMapping("/{id}/read")
    fun markRead(
        @PathVariable id: Long,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<NotificationResponse>> {
        val result = notificationService.markRead(id, principal.getId())
        return ResponseEntity.ok(ApiResponse.success(result))
    }

    @PutMapping("/read-all")
    fun markAllRead(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<Unit>> {
        notificationService.markAllRead(principal.getId())
        return ResponseEntity.ok(ApiResponse.success(Unit, message = "All notifications marked as read"))
    }
}
