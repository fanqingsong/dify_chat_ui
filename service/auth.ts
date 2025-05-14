// Import adapter functions from nextauth-adapter
import { login, register, logout, getCurrentUser } from './nextauth-adapter'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/user'

// Export the adapter functions directly
export { login, register, logout, getCurrentUser } 