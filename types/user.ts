export type User = {
    id: string
    username: string
    email: string
    avatar?: string
}

export type LoginRequest = {
    email: string
    password: string
}

export type RegisterRequest = {
    username: string
    email: string
    password: string
}

export type AuthResponse = {
    user: User
    token: string
}

export type AuthState = {
    user: User | null
    token: string | null
    isAuthenticated: boolean
} 