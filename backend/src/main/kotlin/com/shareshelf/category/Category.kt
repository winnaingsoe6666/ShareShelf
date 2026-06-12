package com.shareshelf.category

import jakarta.persistence.*

@Entity
@Table(name = "categories")
data class Category(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true, length = 100)
    val name: String = "",

    @Column(length = 50)
    val icon: String? = null,

    @Column(length = 500)
    val description: String? = null
)
