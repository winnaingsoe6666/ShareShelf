package com.shareshelf.storage

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.util.UUID

@Service
class FileStorageService(
    private val s3Client: S3Client?,
    @Value("\${app.r2.bucket}") private val bucket: String,
    @Value("\${app.r2.public-url}") private val publicUrl: String
) {
    private val logger = LoggerFactory.getLogger(FileStorageService::class.java)

    private val allowedExtensions = setOf("jpg", "jpeg", "png", "gif", "webp")

    fun store(file: MultipartFile, subPath: String = "items"): String {
        if (s3Client == null) {
            throw IllegalStateException("Image upload not configured. Set R2 environment variables to enable.")
        }
        if (file.isEmpty) {
            throw IllegalArgumentException("File is empty")
        }

        val originalFilename = file.originalFilename ?: "unknown"
        val extension = originalFilename.substringAfterLast('.', "").lowercase()

        if (extension.isEmpty() || extension !in allowedExtensions) {
            throw IllegalArgumentException(
                "Unsupported file type: .$extension. Allowed: ${allowedExtensions.joinToString(", ")}"
            )
        }

        val uniqueFilename = "${UUID.randomUUID()}.$extension"
        val s3Key = "$subPath/$uniqueFilename"

        val request = PutObjectRequest.builder()
            .bucket(bucket)
            .key(s3Key)
            .contentType(file.contentType)
            .build()

        s3Client.putObject(request, RequestBody.fromInputStream(file.inputStream, file.size))

        logger.info("Stored file in R2: {}", s3Key)

        return "$publicUrl/$s3Key"
    }

    fun delete(urlPath: String) {
        if (s3Client == null) {
            logger.warn("R2 not configured, skipping delete for: {}", urlPath)
            return
        }
        try {
            val s3Key = urlPath.removePrefix("$publicUrl/")
            val request = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(s3Key)
                .build()

            s3Client.deleteObject(request)
            logger.info("Deleted file from R2: {}", s3Key)
        } catch (e: Exception) {
            logger.warn("Failed to delete file from R2 at {}: {}", urlPath, e.message)
        }
    }
}
