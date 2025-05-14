import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import AdminSidebar from './components/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 获取会话
    const session = await getServerSession(authOptions);

    // 检查用户是否是管理员
    if (!session?.user?.isAdmin) {
        redirect('/auth'); // 非管理员重定向到登录页
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* 侧边栏 */}
            <AdminSidebar />

            {/* 主内容区 */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto">
                <div className="container px-6 mx-auto py-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
} 