'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Role } from '@/types/user';
import Toast from '@/app/components/base/toast';

interface User {
    id: string;
    name: string | null;
    email: string | null;
    isAdmin: boolean;
    isActive: boolean;
    roles: Array<{
        id: string;
        roleId: string;
        role: Role;
    }>;
}

export default function UserEditPage({ params }: { params: { userId: string } }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [password, setPassword] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const userId = params.userId;

    // 获取用户信息
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/admin/users/${userId}`);

                if (!response.ok) {
                    throw new Error('获取用户信息失败');
                }

                const userData = await response.json();
                setUser(userData);
                setIsActive(userData.isActive || false);
                setSelectedRoles(userData.roles?.map((r: any) => r.roleId) || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : '加载用户数据出错');
                console.error('获取用户错误:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    // 获取所有角色
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

    // 处理角色选择
    const handleRoleChange = (roleId: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    // 保存用户信息
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        setIsSaving(true);

        try {
            const updateData = {
                isActive,
                password: password || undefined,
                roleIds: selectedRoles
            };

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || '保存用户信息失败');
            }

            Toast.notify({
                type: 'success',
                message: '用户信息已更新'
            });

            router.push('/admin/users');
        } catch (err) {
            setError(err instanceof Error ? err.message : '保存用户数据出错');
            Toast.notify({
                type: 'error',
                message: err instanceof Error ? err.message : '保存用户信息失败'
            });
        } finally {
            setIsSaving(false);
        }
    };

    // 返回用户列表
    const handleCancel = () => {
        router.push('/admin/users');
    };

    // 检查是否为管理员
    if (!session?.user?.isAdmin) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">无权访问</h1>
                <p className="text-gray-600 mt-2">您没有管理员权限，无法访问此页面。</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">编辑用户</h1>
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
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-500">加载用户数据...</p>
                </div>
            ) : user ? (
                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
                    {/* 用户基本信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">用户名</label>
                            <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                                {user.name || '未设置'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">电子邮箱</label>
                            <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                                {user.email}
                            </div>
                        </div>
                    </div>

                    {/* 密码重置 */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            重置密码 (留空表示不修改)
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                        />
                    </div>

                    {/* 角色选择列表 */}
                    {session?.user?.isAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                用户角色
                            </label>
                            <div className="bg-gray-50 p-3 rounded-md border border-gray-300">
                                {roles.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {roles.map(role => (
                                            <div key={role.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`role-${role.id}`}
                                                    checked={selectedRoles.includes(role.id)}
                                                    onChange={() => handleRoleChange(role.id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor={`role-${role.id}`} className="ml-2 block text-sm text-gray-900">
                                                    {role.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">暂无可用角色</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 激活状态 */}
                    {session?.user?.isAdmin && (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                账户已激活
                            </label>
                        </div>
                    )}

                    {/* 按钮操作 */}
                    <div className="flex justify-end space-x-3 pt-5">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {isSaving ? '保存中...' : '保存'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">未找到用户</p>
                </div>
            )}
        </div>
    );
} 