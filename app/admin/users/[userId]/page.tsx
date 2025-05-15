'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { User, Role, UserRole } from '@/types/user';

// 创建适配API响应的类型
interface UserWithRoles extends Omit<User, 'roles'> {
    roles: Array<{
        id: string;
        roleId: string;
        role: Role;
    }>;
}

export default function UserEdit() {
    const router = useRouter();
    const params = useParams();
    const userId = params.userId as string;

    const [user, setUser] = useState<UserWithRoles | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        roleIds: [] as string[],
        isActive: false,
        password: ''
    });

    // 获取用户数据
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

                // 更新表单数据
                setFormData({
                    roleIds: userData.roles?.map((ur: any) => ur.roleId) || [],
                    isActive: userData.isActive || false,
                    password: ''
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : '获取用户数据时出错');
                console.error('获取用户错误:', err);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchRoles = async () => {
            try {
                const response = await fetch('/api/admin/roles');

                if (!response.ok) {
                    throw new Error('获取角色列表失败');
                }

                const roleData = await response.json();
                setRoles(roleData);
            } catch (err) {
                console.error('获取角色错误:', err);
            }
        };

        fetchUser();
        fetchRoles();
    }, [userId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            if (name === 'isActive') {
                setFormData({
                    ...formData,
                    isActive: checked
                });
            } else if (name.startsWith('role_')) {
                const roleId = name.replace('role_', '');
                setFormData(prev => {
                    if (checked) {
                        return {
                            ...prev,
                            roleIds: [...prev.roleIds, roleId]
                        };
                    } else {
                        return {
                            ...prev,
                            roleIds: prev.roleIds.filter(id => id !== roleId)
                        };
                    }
                });
            }
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        // 准备更新数据
        const updateData: { roleIds?: string[]; isActive?: boolean; password?: string } = {};

        // 检查角色是否有变化
        const currentRoleIds = user?.roles?.map(ur => ur.roleId) || [];
        const roleIdsChanged =
            formData.roleIds.length !== currentRoleIds.length ||
            formData.roleIds.some(id => !currentRoleIds.includes(id)) ||
            currentRoleIds.some(id => !formData.roleIds.includes(id));

        if (roleIdsChanged) {
            updateData.roleIds = formData.roleIds;
        }

        if (formData.isActive !== user?.isActive) {
            updateData.isActive = formData.isActive;
        }

        if (formData.password) {
            updateData.password = formData.password;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '更新用户失败');
            }

            // 清空密码字段
            setFormData({
                ...formData,
                password: ''
            });

            setSuccessMessage('用户信息已更新');

            // 更新用户数据
            const updatedUser = await response.json();
            setUser(updatedUser);
        } catch (err) {
            setError(err instanceof Error ? err.message : '保存用户信息时出错');
            console.error('更新用户错误:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-10">
                <div className="spinner"></div>
                <p className="mt-2 text-gray-500">加载用户数据...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">用户不存在或无法加载</p>
                        </div>
                    </div>
                </div>
                <div>
                    <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 flex items-center">
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        返回用户列表
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">编辑用户</h1>
                <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 flex items-center">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    返回用户列表
                </Link>
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

            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-green-700">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white overflow-hidden shadow rounded-lg border">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                            {user.image ? (
                                <img className="h-12 w-12 rounded-full" src={user.image} alt="" />
                            ) : (
                                <UserIcon className="h-6 w-6 text-gray-500" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.isAdmin && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                    管理员
                                </span>
                            )}
                            {user.roles && user.roles.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {user.roles.map((userRole) => (
                                        <span
                                            key={userRole.id}
                                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                                        >
                                            {userRole.role?.name || '未知角色'}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                角色（可多选）
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {roles.map(role => (
                                    <div key={role.id} className={`rounded border p-3 ${!role.isActive ? 'opacity-50' : ''}`}>
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id={`role_${role.id}`}
                                                    name={`role_${role.id}`}
                                                    type="checkbox"
                                                    checked={formData.roleIds.includes(role.id)}
                                                    onChange={handleInputChange}
                                                    disabled={!role.isActive}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor={`role_${role.id}`} className="font-medium text-gray-700">
                                                    {role.name} {!role.isActive && '(禁用)'}
                                                </label>
                                                {role.description && (
                                                    <p className="text-gray-500">{role.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {roles.length === 0 && (
                                <p className="text-gray-500 text-sm mt-1">暂无可用角色</p>
                            )}
                            <p className="text-green-600 text-sm mt-2">
                                可以为一个用户分配多个角色，例如同时具有GEB、ERA和General角色。
                            </p>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                激活用户
                            </label>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                重置密码 (留空表示不修改)
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                placeholder="输入新密码"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSaving ? '保存中...' : '保存更改'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 