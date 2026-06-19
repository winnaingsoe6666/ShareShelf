package com.shareshelf.storage

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.springframework.mock.web.MockMultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths

class FileStorageServiceTest {

    @TempDir
    lateinit var tempDir: Path

    private fun createService(uploadDir: String): FileStorageService {
        return FileStorageService(uploadDir)
    }

    @Test
    fun `store saves file with UUID name and returns correct URL`() {
        val service = createService(tempDir.toString())
        service.init()

        val file = MockMultipartFile(
            "file",
            "test-image.jpg",
            "image/jpeg",
            "test image content".toByteArray()
        )

        val result = service.store(file, "items")

        assertTrue(result.startsWith("/uploads/items/"))
        assertTrue(result.endsWith(".jpg"))
        assertTrue(result.contains("-"))

        val relativePath = result.removePrefix("/uploads/")
        val savedPath = tempDir.resolve(relativePath)
        assertTrue(Files.exists(savedPath))
        assertEquals("test image content", Files.readString(savedPath))

        service.delete(result)
        assertFalse(Files.exists(savedPath))
    }

    @Test
    fun `store saves with png extension`() {
        val service = createService(tempDir.toString())
        service.init()

        val file = MockMultipartFile(
            "file",
            "photo.png",
            "image/png",
            "png content".toByteArray()
        )

        val result = service.store(file, "items")

        assertTrue(result.endsWith(".png"))
        val relativePath = result.removePrefix("/uploads/")
        assertTrue(Files.exists(tempDir.resolve(relativePath)))
    }

    @Test
    fun `store creates subdirectory if not exists`() {
        val service = createService(tempDir.toString())
        service.init()

        val subDir = tempDir.resolve("items")
        assertFalse(Files.exists(subDir))

        val file = MockMultipartFile(
            "file",
            "photo.jpg",
            "image/jpeg",
            "content".toByteArray()
        )

        service.store(file, "items")
        assertTrue(Files.exists(subDir))
    }

    @Test
    fun `store rejects empty file`() {
        val service = createService(tempDir.toString())
        service.init()

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
        val service = createService(tempDir.toString())
        service.init()

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
        val service = createService(tempDir.toString())
        service.init()

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
        val service = createService(tempDir.toString())
        service.init()

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
    fun `delete removes file`() {
        val service = createService(tempDir.toString())
        service.init()

        val file = MockMultipartFile(
            "file",
            "to-delete.jpg",
            "image/jpeg",
            "will be deleted".toByteArray()
        )

        val url = service.store(file, "items")
        val relativePath = url.removePrefix("/uploads/")
        val savedPath = tempDir.resolve(relativePath)
        assertTrue(Files.exists(savedPath))

        service.delete(url)
        assertFalse(Files.exists(savedPath))
    }

    @Test
    fun `delete handles non-existent file gracefully`() {
        val service = createService(tempDir.toString())
        service.init()

        // Should not throw — best-effort deletion
        assertDoesNotThrow {
            service.delete("/uploads/items/nonexistent-file.jpg")
        }
    }

    @Test
    fun `init creates upload directory if not exists`() {
        val uploadDir = tempDir.resolve("custom-uploads")
        assertFalse(Files.exists(uploadDir))

        val service = createService(uploadDir.toString())
        service.init()

        assertTrue(Files.exists(uploadDir))
        assertTrue(Files.isDirectory(uploadDir))
    }
}
