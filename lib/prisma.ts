import { PrismaClient } from '@prisma/client'

declare global {
    var prisma: PrismaClient | undefined
}

// 避免开发环境中创建多个实例
export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma