// 这个文件现在仅作为 service/base.ts 的依赖保留
// 实际认证由 NextAuth.js 处理

import Cookies from 'js-cookie'

const TOKEN_KEY = 'next-auth.session-token'
const USER_KEY = 'next-auth.user'

// 从 cookie 获取 token - 为了兼容旧代码
export const getToken = (): string | null => {
    // NextAuth.js 使用 next-auth.session-token cookie
    return Cookies.get(TOKEN_KEY) || null
}

// 从 localStorage 获取用户信息 - 为了兼容旧代码
export const getUser = (): any | null => {
    try {
        // 尝试从 sessionStorage 获取 NextAuth 用户信息
        const session = sessionStorage.getItem('nextauth.session')
        if (session) {
            const sessionData = JSON.parse(session)
            return sessionData.user || null
        }

        // 兼容旧方式
        const userStr = localStorage.getItem(USER_KEY)
        if (userStr) {
            return JSON.parse(userStr)
        }

        return null
    } catch (e) {
        console.error('Error parsing user data:', e)
        return null
    }
}

// 设置认证信息 - 为了兼容旧代码
// 注意：实际登录应该使用 NextAuth 的 signIn 方法
export const setAuthInfo = (token: string, user: any) => {
    // 这是危险的，不应该直接操作 NextAuth cookie
    // 仅作为兼容旧代码保留
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// 清除认证信息 - 为了兼容旧代码
// 注意：实际登出应该使用 NextAuth 的 signOut 方法
export const clearAuthInfo = () => {
    // 这是危险的，不应该直接操作 NextAuth cookie
    // 仅作为兼容旧代码保留
    localStorage.removeItem(USER_KEY)
}

// 检查是否已认证 - 为了兼容旧代码
// 注意：实际认证检查应该使用 NextAuth 的 useSession 钩子
export const isAuthenticated = (): boolean => {
    return !!getToken()
} 