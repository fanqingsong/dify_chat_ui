import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import { RESTRICTED_ROLE_NAME } from '@/lib/constants';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // 查找用户
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                        include: {
                            roles: {
                                include: {
                                    role: true
                                }
                            }
                        }
                    });

                    if (!user || !user.password) {
                        console.log('用户不存在:', credentials.email);
                        return null;
                    }

                    // 验证密码
                    const isPasswordValid = await compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        console.log('密码不匹配:', credentials.email);
                        return null;
                    }

                    // 检查用户是否激活 (管理员可以绕过此检查)
                    if (!user.isActive && !user.isAdmin) {
                        console.log('用户未激活:', credentials.email);
                        throw new Error('您的账户尚未激活，请联系管理员');
                    }

                    // 检查用户是否拥有受限角色 (管理员可以绕过此检查)
                    const hasRestrictedRole = user.roles.some(ur => ur.role.name === RESTRICTED_ROLE_NAME);

                    if (!hasRestrictedRole && !user.isAdmin) {
                        console.log(`用户没有${RESTRICTED_ROLE_NAME}角色权限:`, credentials.email);
                        throw new Error('您没有访问此应用的权限');
                    }

                    console.log('用户登录成功:', credentials.email);

                    // 返回用户数据
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        isAdmin: user.isAdmin,
                        hasGEBRole: hasRestrictedRole
                    };
                } catch (error) {
                    console.error('授权过程中出错:', error);
                    throw error; // 抛出错误以便在前端显示
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.isAdmin = token.isAdmin as boolean;
                session.user.hasGEBRole = token.hasGEBRole as boolean;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.isAdmin = user.isAdmin as boolean;
                token.hasGEBRole = user.hasGEBRole as boolean;
            }
            return token;
        }
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60 // 30 天
    },
    pages: {
        signIn: '/auth',
        error: '/auth'
    },
    secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-change-me',
    debug: process.env.NODE_ENV === 'development'
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 