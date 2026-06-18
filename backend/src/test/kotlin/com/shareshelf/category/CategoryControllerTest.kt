package com.shareshelf.category

import com.shareshelf.category.dto.CategoryResponse
import com.shareshelf.common.ApiResponse
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

class CategoryControllerTest {

    private val categoryRepository = mockk<CategoryRepository>()
    private val controller = CategoryController(categoryRepository)

    @Test
    fun `listCategories should return empty list when no categories exist`() {
        every { categoryRepository.findAll() } returns emptyList()

        val response = controller.listCategories()

        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body!!.success)
        assertTrue(response.body!!.data!!.isEmpty())
    }

    @Test
    fun `listCategories should return all categories`() {
        val categories = listOf(
            Category(id = 1L, name = "Tools", icon = "🔧", description = "Hand and power tools"),
            Category(id = 2L, name = "Electronics", icon = "🔌", description = null),
            Category(id = 3L, name = "Gardening", icon = null, description = null)
        )
        every { categoryRepository.findAll() } returns categories

        val response = controller.listCategories()

        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body!!.success)
        val data = response.body!!.data!!
        assertEquals(3, data.size)
        assertEquals("Tools", data[0].name)
        assertEquals(1L, data[0].id)
        assertEquals("🔧", data[0].icon)
        assertEquals("Hand and power tools", data[0].description)
        assertEquals("Electronics", data[1].name)
        assertNull(data[2].icon)
        assertNull(data[2].description)
    }

    @Test
    fun `listCategories should map category fields to CategoryResponse`() {
        val category = Category(id = 5L, name = "Kitchen", icon = "🍳", description = "Kitchen equipment")
        every { categoryRepository.findAll() } returns listOf(category)

        val response = controller.listCategories()
        val result = response.body!!.data!!.single()

        assertEquals(5L, result.id)
        assertEquals("Kitchen", result.name)
        assertEquals("🍳", result.icon)
        assertEquals("Kitchen equipment", result.description)
    }
}
