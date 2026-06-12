package com.shareshelf.auth

import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(email: String): UserDetails {
        val user = userRepository.findByEmail(email)
            ?: throw UsernameNotFoundException("User not found with email: $email")
        return UserPrincipal(user)
    }

    fun loadUserById(id: Long): UserDetails {
        val user = userRepository.findById(id)
            .orElseThrow { UsernameNotFoundException("User not found with id: $id") }
        return UserPrincipal(user)
    }
}

class UserPrincipal(private val user: User) : UserDetails {
    fun getId() = user.id!!
    fun getEmail() = user.email
    fun getName() = user.name

    override fun getAuthorities() = emptyList<org.springframework.security.core.GrantedAuthority>()
    override fun getPassword() = user.passwordHash
    override fun getUsername() = user.email
    override fun isAccountNonExpired() = true
    override fun isAccountNonLocked() = true
    override fun isCredentialsNonExpired() = true
    override fun isEnabled() = user.enabled
}
