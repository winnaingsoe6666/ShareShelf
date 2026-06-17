package com.shareshelf.dev

import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.borrow.BorrowRepository
import com.shareshelf.borrow.entity.BorrowRequest
import com.shareshelf.borrow.entity.BorrowStatus
import com.shareshelf.category.CategoryRepository
import com.shareshelf.category.Category
import com.shareshelf.item.ItemRepository
import com.shareshelf.item.entity.Item
import com.shareshelf.item.entity.ItemStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.time.LocalDate
import kotlin.random.Random

@RestController
@RequestMapping("/api/dev")
class DataSeederController(
    private val userRepository: UserRepository,
    private val itemRepository: ItemRepository,
    private val borrowRepository: BorrowRepository,
    private val categoryRepository: CategoryRepository,
    private val passwordEncoder: PasswordEncoder
) {

    @GetMapping("/seed")
    @Transactional
    fun seedData(): Map<String, String> {
        val random = Random(42)

        // Generate Categories if empty
        val categories = if (categoryRepository.count() == 0L) {
            val cats = listOf("Electronics", "Books", "Tools", "Sports", "Home").map { Category(name = it) }
            categoryRepository.saveAll(cats)
        } else {
            categoryRepository.findAll()
        }

        val encodedPassword = passwordEncoder.encode("password123")

        // 1. Generate 100 Users
        val users = mutableListOf<User>()
        for (i in 1..100) {
            users.add(
                User(
                    name = "User $i",
                    email = "user_${java.util.UUID.randomUUID().toString().substring(0, 8)}@example.com",
                    passwordHash = encodedPassword,
                    community = "Community ${random.nextInt(1, 10)}",
                    trustScore = BigDecimal.valueOf(random.nextDouble(1.0, 5.0)).setScale(2, java.math.RoundingMode.HALF_UP)
                )
            )
        }
        val savedUsers = userRepository.saveAll(users)

        // 2. Generate 200 Items
        val items = mutableListOf<Item>()
        for (i in 1..200) {
            val owner = savedUsers[random.nextInt(savedUsers.size)]
            val category = categories[random.nextInt(categories.size)]
            items.add(
                Item(
                    ownerId = owner.id!!,
                    categoryId = category.id,
                    title = "Dummy Item $i",
                    description = "This is a generated dummy item $i for testing purposes.",
                    dailyPrice = BigDecimal.valueOf(random.nextDouble(5.0, 50.0)).setScale(2, java.math.RoundingMode.HALF_UP),
                    depositAmount = BigDecimal.valueOf(random.nextDouble(50.0, 200.0)).setScale(2, java.math.RoundingMode.HALF_UP),
                    status = ItemStatus.available
                )
            )
        }
        val savedItems = itemRepository.saveAll(items)

        // 3. Generate random Borrow Requests
        val statuses = listOf(BorrowStatus.pending, BorrowStatus.approved, BorrowStatus.rejected, BorrowStatus.returned, BorrowStatus.cancelled)
        val borrowRequests = mutableListOf<BorrowRequest>()

        for (user in savedUsers) {
            // Random borrow count between 0 and 5 for each user
            val borrowCount = random.nextInt(0, 6)
            for (i in 0 until borrowCount) {
                val item = savedItems[random.nextInt(savedItems.size)]
                if (item.ownerId == user.id) continue // skip borrowing own item

                val status = statuses[random.nextInt(statuses.size)]
                borrowRequests.add(
                    BorrowRequest(
                        itemId = item.id!!,
                        borrowerId = user.id!!,
                        ownerId = item.ownerId,
                        status = status,
                        startDate = LocalDate.now().plusDays(random.nextLong(1, 10)),
                        endDate = LocalDate.now().plusDays(random.nextLong(11, 20)),
                        message = "I would like to borrow this item"
                    )
                )
            }
        }
        borrowRepository.saveAll(borrowRequests)

        return mapOf(
            "status" to "success",
            "message" to "Successfully seeded ${savedUsers.size} users, ${savedItems.size} items, and ${borrowRequests.size} borrow requests!"
        )
    }
}
