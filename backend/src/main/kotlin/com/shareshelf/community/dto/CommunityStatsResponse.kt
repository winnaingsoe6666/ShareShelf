package com.shareshelf.community.dto

import com.shareshelf.item.dto.ItemResponse
import java.math.BigDecimal

data class CommunityStatsResponse(
    val totalItems: Long,
    val totalMembers: Long,
    val activeBorrows: Long,
    val recentItems: List<ItemResponse>,
    val topLenders: List<TopLenderResponse>
)

data class TopLenderResponse(
    val userId: Long,
    val name: String,
    val itemCount: Long,
    val trustScore: BigDecimal
)
