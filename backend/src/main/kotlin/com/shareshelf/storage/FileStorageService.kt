package com.shareshelf.storage

import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.UUID

@Service
class FileStorageService(
    @Value("\${app.upload-dir}") private val uploadDir: String
) {
    private val logger = LoggerFactory.getLogger(FileStorageService::class.java)

    private val allowedExtensions = setOf("jpg", "jpeg", "png", "gif", "webp")

    @PostConstruct
    fun init() {
        val rootDir = Paths.get(uploadDir)
        if (!Files.exists(rootDir)) {
            Files.createDirectories(rootDir)
        }
    }

    fun store(file: MultipartFile, subPath: String = "items"): String {
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
        val targetDir = Paths.get(uploadDir, subPath)

        if (!Files.exists(targetDir)) {
            Files.createDirectories(targetDir)
        }

        val targetPath = targetDir.resolve(uniqueFilename)
        file.inputStream.use { inputStream ->
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING)
        }

        logger.info("Stored file: {}", targetPath)

        return "/uploads/$subPath/$uniqueFilename"
    }

    fun delete(urlPath: String) {
        try {
            val relativePath = urlPath.removePrefix("/uploads/")
            val filePath = Paths.get(uploadDir, relativePath).normalize()

            if (Files.exists(filePath)) {
                Files.delete(filePath)
                logger.info("Deleted file: {}", filePath)
            } else {
                logger.warn("File not found for deletion: {}", filePath)
            }
        } catch (e: Exception) {
            logger.warn("Failed to delete file at {}: {}", urlPath, e.message)
        }
    }
}
