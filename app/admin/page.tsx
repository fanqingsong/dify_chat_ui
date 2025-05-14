import { prisma } from '@/lib/prisma';

export const metadata = {
    title: '管理员控制台',
};

export default async function AdminDashboard() {
    // 获取统计数据
    const userCount = await prisma.user.count();
    const pendingUserCount = await prisma.user.count({
        where: { isActive: false }
    });
    const roleCount = await prisma.role.count();

    const stats = [
        { name: '注册用户', value: userCount },
        { name: '待激活用户', value: pendingUserCount },
        { name: '角色', value: roleCount },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">管理员控制台</h1>
                <p className="text-gray-500 mt-1">管理用户和角色</p>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-white overflow-hidden shadow rounded-lg border"
                    >
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
                        </div>
                    </div>
                ))}
            </div>

            {/* 管理提示 */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            欢迎使用管理员控制台。您可以在这里管理用户和角色。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 