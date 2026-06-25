package com.shareshelf.storage

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockMultipartFile
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest

class FileStorageServiceTest {

    private lateinit var s3Client: S3Client
    private lateinit var service: FileStorageService

    private val bucket = "test-bucket"
    private val publicUrl = "https://cdn.example.com"

    @BeforeEach
    fun setUp() {
        s3Client = mockk(relaxed = true)
        service = FileStorageService(s3Client, bucket, publicUrl)
    }

    @Test
    fun `store uploads file to R2 and returns public URL`() {
        val file = MockMultipartFile(
            "file",
            "test-image.jpg",
            "image/jpeg",
            "test image content".toByteArray()
        )

        val result = service.store(file, "items")

        assertTrue(result.startsWith("$publicUrl/items/"))
        assertTrue(result.endsWith(".jpg"))
        assertTrue(result.contains("-"))

        verify {
            s3Client.putObject(
                any<PutObjectRequest>(),
                any<RequestBody>()
            )
        }
    }

    @Test
    fun `store saves with png extension`() {
        val file = MockMultipartFile(
            "file",
            "photo.png",
            "image/png",
            "png content".toByteArray()
        )

        val result = service.store(file, "items")

        assertTrue(result.endsWith(".png"))
        assertTrue(result.startsWith("$publicUrl/items/"))
    }

    @Test
    fun `store rejects empty file`() {
        val file = MockMultipartFile(
            "file",
            "empty.jpg",
            "image/jpeg",
            ByteArray(0)
        )

        val ex = assertThrows(IllegalArgumentException::class.java) {
            service.store(file, "items")
        }
        assertEquals("File is empty", ex.message)
    }

    @Test
    fun `store rejects unsupported extension exe`() {
        val file = MockMultipartFile(
            "file",
            "malware.exe",
            "application/octet-stream",
            "bad content".toByteArray()
        )

        val ex = assertThrows(IllegalArgumentException::class.java) {
            service.store(file, "items")
        }
        assertTrue(ex.message!!.contains("Unsupported file type"))
        assertTrue(ex.message!!.contains(".exe"))
    }

    @Test
    fun `store rejects unsupported extension html`() {
        val file = MockMultipartFile(
            "file",
            "page.html",
            "text/html",
            "<html></html>".toByteArray()
        )

        val ex = assertThrows(IllegalArgumentException::class.java) {
            service.store(file, "items")
        }
        assertTrue(ex.message!!.contains("Unsupported file type"))
        assertTrue(ex.message!!.contains(".html"))
    }

    @Test
    fun `store accepts jpg jpeg png gif webp extensions`() {
        val extensions = listOf("jpg", "jpeg", "png", "gif", "webp")
        for (ext in extensions) {
            val file = MockMultipartFile(
                "file",
                "image.$ext",
                "image/$ext",
                "content".toByteArray()
            )
            val result = service.store(file, "items")
            assertTrue(result.endsWith(".$ext"), "Failed for extension: $ext")
        }
    }

    @Test
    fun `delete calls s3Client deleteObject`() {
        val url = "$publicUrl/items/some-file.jpg"

        service.delete(url)

        verify {
            s3Client.deleteObject(any<DeleteObjectRequest>())
        }
    }

    @Test
    fun `delete handles non-S3 URL gracefully`() {
        // Should not throw — best-effort deletion
        assertDoesNotThrow {
            service.delete("/uploads/items/nonexistent-file.jpg")
        }
    }
}
