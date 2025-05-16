'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon, PencilIcon } from '@heroicons/react/24/outline';
import type { User, Role, UserRole } from '@/types/user';

// 创建适配API响应的类型
interface UserWithRoles extends Omit<User, 'roles'> {
    roles: Array<{
        id: string;
        roleId: string;
        role: Role;
    }>;
}

export default function UserManagement() {
    const router = useRouter();
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 获取用户列表
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/admin/users');

                if (!response.ok) {
                    throw new Error('获取用户列表失败');
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : '获取用户数据时出错');
                console.error('获取用户错误:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // 获取角色列表（用于编辑用户时选择角色）
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch('/api/admin/roles');

                if (!response.ok) {
                    throw new Error('获取角色列表失败');
                }

                const data = await response.json();
                setRoles(data);
            } catch (err) {
                console.error('获取角色错误:', err);
            }
        };

        fetchRoles();
    }, []);

    // 跳转到用户编辑页面
    const handleEditUser = (userId: string) => {
        router.push(`/admin/users/${userId}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">用户管理</h1>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-10">
                    <div className="spinner"></div>
                    <p className="mt-2 text-gray-500">加载用户数据...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    用户信息
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    状态
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    角色
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    注册时间
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {user.image ? (
                                                    <img className="h-10 w-10 rounded-full" src={user.image} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <UserIcon className="h-6 w-6 text-gray-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {user.isActive ? '已激活' : '未激活'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-1">
                                            {user.isAdmin && (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    管理员
                                                </span>
                                            )}
                                            {user.roles && user.roles.length > 0 ? (
                                                user.roles.map(userRole => (
                                                    <span
                                                        key={userRole.id}
                                                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                                                    >
                                                        {userRole.role?.name || '未知角色'}
                                                    </span>
                                                ))
                                            ) : (
                                                !user.isAdmin && <span className="text-gray-400">无角色</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleString() : '未知'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditUser(user.id)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
} 