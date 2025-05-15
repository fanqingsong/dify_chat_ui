'use client';

import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Role } from '@/types/user';

export default function RoleManagement() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 表单状态
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });

    // 获取角色列表
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/roles');

            if (!response.ok) {
                throw new Error('获取角色列表失败');
            }

            const data = await response.json();
            setRoles(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '获取角色数据时出错');
            console.error('获取角色错误:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // 处理表单输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: (e.target as HTMLInputElement).checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // 打开创建模态框
    const openCreateModal = () => {
        setEditingRole(null);
        setFormData({
            name: '',
            description: '',
            isActive: true
        });
        setIsModalOpen(true);
    };

    // 打开编辑模态框
    const openEditModal = (role: Role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            isActive: role.isActive
        });
        setIsModalOpen(true);
    };

    // 关闭模态框
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
    };

    // 提交表单
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let response;

            if (editingRole) {
                // 更新现有角色
                response = await fetch(`/api/admin/roles/${editingRole.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
            } else {
                // 创建新角色
                response = await fetch('/api/admin/roles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '操作失败');
            }

            // 刷新角色列表
            await fetchRoles();
            closeModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : '保存角色时出错');
            console.error('保存角色错误:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">角色管理</h1>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    添加角色
                </button>
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
                    <p className="mt-2 text-gray-500">加载角色数据...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    角色名称
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    描述
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    状态
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {role.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {role.description || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {role.isActive ? '启用' : '禁用'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openEditModal(role)}
                                            className="text-indigo-600 hover:text-indigo-900"
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

            {/* 角色编辑/创建模态框 */}
            {isModalOpen && (
                <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-30"></div>
                    <div className="relative bg-white rounded-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">
                                {editingRole ? '编辑角色' : '创建新角色'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    角色名称
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    描述
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="mb-4 flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    启用角色
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 