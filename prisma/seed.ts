import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { RESTRICTED_ROLE_NAME } from '../lib/constants';

const prisma = new PrismaClient();

async function main() {
    // 创建默认角色
    const roles = [
        {
            name: RESTRICTED_ROLE_NAME,
            description: `${RESTRICTED_ROLE_NAME} Role with special access`
        },
        {
            name: 'ERA',
            description: 'ERA Role with medium access'
        },
        {
            name: 'General',
            description: 'General user with standard access'
        }
    ];

    console.log(`开始创建默认角色...`);

    // 创建角色（如果不存在）
    for (const role of roles) {
        const existingRole = await prisma.role.findUnique({
            where: { name: role.name }
        });

        if (!existingRole) {
            await prisma.role.create({
                data: role
            });
            console.log(`创建角色: ${role.name}`);
        } else {
            console.log(`角色已存在: ${role.name}`);
        }
    }

    // 创建默认管理员账号（如果不存在）
    const adminEmail = 'admin@example.com';
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (!existingAdmin) {
        const hashedPassword = await hash('admin123', 10);
        await prisma.user.create({
            data: {
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                isAdmin: true,
                isActive: true
            }
        });
        console.log('创建默认管理员账号成功');
    } else {
        console.log('管理员账号已存在');
    }

    console.log('数据初始化完成');
}

main()
    .catch((e) => {
        console.error('Seed 错误:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 