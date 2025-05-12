import Cookies from 'js-cookie'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

// 存储认证信息到cookie
export const setAuthInfo = (token: string, user: any) => {
    Cookies.set(TOKEN_KEY, token, { expires: 7 }) // 7天过期
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// 从cookie获取token
export const getToken = (): string | null => {
    return Cookies.get(TOKEN_KEY) || null
}

// 从localStorage获取用户信息
export const getUser = (): any | null => {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null
    try {
        return JSON.parse(userStr)
    } catch (e) {
        return null
    }
}

// 清除认证信息
export const clearAuthInfo = () => {
    Cookies.remove(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

// 检查是否已认证
export const isAuthenticated = (): boolean => {
    return !!getToken()
} 