import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    /**
     * 扩展 Session 类型
     */
    interface Session {
        user: {
            id: string
        } & DefaultSession['user']
    }
} 