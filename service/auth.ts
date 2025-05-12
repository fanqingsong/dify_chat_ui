import { post } from './base'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/user'

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    return post('auth/login', { body: credentials }) as Promise<AuthResponse>
}

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    return post('auth/register', { body: userData }) as Promise<AuthResponse>
}

export const logout = async (): Promise<void> => {
    await post('auth/logout', {})
    return
}

export const getCurrentUser = async (): Promise<AuthResponse> => {
    return post('auth/me', {}) as Promise<AuthResponse>
} 