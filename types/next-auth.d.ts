import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * 扩展NextAuth的Session类型
     */
    interface Session {
        user: {
            id: string;
            isAdmin: boolean;
            hasGEBRole: boolean;
        } & DefaultSession['user']
    }

    /**
     * 扩展User类型
     */
    interface User {
        isAdmin: boolean;
        hasGEBRole: boolean;
    }
}

declare module "next-auth/jwt" {
    /** 扩展JWT类型 */
    interface JWT {
        id: string;
        isAdmin: boolean;
        hasGEBRole: boolean;
    }
} 