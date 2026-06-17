package com.shareshelf.common

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class HealthController {

    @GetMapping("/api/health")
    fun health(): ResponseEntity<ApiResponse<Map<String, String>>> {
        return ResponseEntity.ok(ApiResponse.success(mapOf("status" to "UP")))
    }
}
