package com.shareshelf.common

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null,
    val errors: List<String>? = null
) {
    companion object {
        fun <T> success(data: T, message: String? = null): ApiResponse<T> =
            ApiResponse(success = true, message = message, data = data)

        fun <T> created(data: T): ApiResponse<T> =
            ApiResponse(success = true, message = "Created successfully", data = data)

        fun <T> error(message: String, errors: List<String>? = null): ApiResponse<T> =
            ApiResponse(success = false, message = message, errors = errors)
    }
}
