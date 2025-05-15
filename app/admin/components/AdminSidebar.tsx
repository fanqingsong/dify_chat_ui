'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserIcon, UsersIcon, KeyIcon, HomeIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function AdminSidebar() {
    const pathname = usePathname();

    // 导航项
    const navItems = [
        {
            name: '控制台首页',
            href: '/admin',
            icon: HomeIcon,
        },
        {
            name: '用户管理',
            href: '/admin/users',
            icon: UsersIcon,
        },
        {
            name: '角色管理',
            href: '/admin/roles',
            icon: KeyIcon,
        },
    ];

    return (
        <div className="w-64 bg-slate-800 text-white flex flex-col">
            {/* 侧边栏头部 */}
            <div className="p-5 border-b border-slate-700">
                <h1 className="text-lg font-bold">管理员控制台</h1>
            </div>

            {/* 导航菜单 */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-3 py-2 rounded-md ${isActive
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* 侧边栏底部 */}
            <div className="p-4 border-t border-slate-700">
                <Link
                    href="/"
                    className="w-full flex items-center px-3 py-2 text-sm rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                    返回对话
                </Link>
            </div>
        </div>
    );
} 