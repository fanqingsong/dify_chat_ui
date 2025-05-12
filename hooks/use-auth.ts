import { create } from 'zustand'
import { clearAuthInfo, getToken, getUser, setAuthInfo } from '@/utils/auth'
import { login as loginApi, register as registerApi, logout as logoutApi } from '@/service/auth'
import type { User, AuthState, LoginRequest, RegisterRequest } from '@/types/user'

interface AuthStore extends AuthState {
    login: (credentials: LoginRequest) => Promise<void>
    register: (userData: RegisterRequest) => Promise<void>
    logout: () => Promise<void>
    initialize: () => void
}

// 创建认证状态管理
const useAuth = create<AuthStore>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    // 初始化认证状态
    initialize: () => {
        const token = getToken()
        const user = getUser()

        if (token && user) {
            set({ user, token, isAuthenticated: true })
        }
    },

    // 登录
    login: async (credentials) => {
        try {
            const { user, token } = await loginApi(credentials)
            setAuthInfo(token, user)
            set({ user, token, isAuthenticated: true })
        } catch (error) {
            throw error
        }
    },

    // 注册
    register: async (userData) => {
        try {
            const { user, token } = await registerApi(userData)
            setAuthInfo(token, user)
            set({ user, token, isAuthenticated: true })
        } catch (error) {
            throw error
        }
    },

    // 退出登录
    logout: async () => {
        try {
            await logoutApi()
            clearAuthInfo()
            set({ user: null, token: null, isAuthenticated: false })
        } catch (error) {
            console.error('Logout failed:', error)
            // 即使API调用失败，也清除本地认证信息
            clearAuthInfo()
            set({ user: null, token: null, isAuthenticated: false })
        }
    }
}))

export default useAuth 