package com.shareshelf.community

import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.borrow.BorrowRepository
import com.shareshelf.borrow.entity.BorrowStatus
import com.shareshelf.category.CategoryRepository
import com.shareshelf.common.ApiResponse
import com.shareshelf.community.dto.CommunityStatsResponse
import com.shareshelf.community.dto.TopLenderResponse
import com.shareshelf.item.ItemRepository
import com.shareshelf.item.ItemService
import com.shareshelf.item.entity.ItemStatus
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal

@RestController
@RequestMapping("/api/community")
class CommunityController(
    private val itemRepository: ItemRepository,
    private val userRepository: UserRepository,
    private val borrowRepository: BorrowRepository,
    private val itemService: ItemService
) {

    @GetMapping("/stats")
    fun getStats(): ResponseEntity<ApiResponse<CommunityStatsResponse>> {
        val totalItems = itemRepository.count()
        val totalMembers = userRepository.count()
        val activeBorrows = borrowRepository.countByStatus(BorrowStatus.approved)

        val recentItems = itemRepository.findTop5ByStatusOrderByCreatedAtDesc(ItemStatus.available)
            .map { item ->
                itemService.findById(item.id!!)
            }

        val topLenders = itemRepository.findTopLenders(PageRequest.of(0, 5))
            .map { row ->
                TopLenderResponse(
                    userId = (row[0] as Number).toLong(),
                    itemCount = (row[1] as Number).toLong(),
                    name = row[2] as String,
                    trustScore = row[3] as BigDecimal
                )
            }

        val stats = CommunityStatsResponse(
            totalItems = totalItems,
            totalMembers = totalMembers,
            activeBorrows = activeBorrows,
            recentItems = recentItems,
            topLenders = topLenders
        )

        return ResponseEntity.ok(ApiResponse.success(stats))
    }
}
