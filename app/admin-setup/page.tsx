'use client'

import { useState } from 'react'

export default function AdminSetup() {
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [adminKey, setAdminKey] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        try {
            const response = await fetch('/api/auth/admin-setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    adminSecretKey: adminKey,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || '设置管理员账户失败')
            }

            setMessage({
                type: 'success',
                text: data.message || '管理员账户设置成功'
            })

            // 清空表单
            setEmail('')
            setPassword('')
            setAdminKey('')
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : '设置管理员账户时发生错误'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="flex flex-col w-full max-w-md px-8 py-10 bg-white rounded-xl shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">
                    管理员账户设置
                </h2>
                <p className="mb-6 text-sm text-gray-500 text-center">
                    创建或升级用户为管理员账户
                </p>

                {message && (
                    <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            邮箱
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="请输入邮箱"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            密码
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder={email ? "如果用户已存在可留空" : "请输入密码"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required={!email}
                        />
                    </div>
                    <div>
                        <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700">
                            管理员密钥
                        </label>
                        <input
                            id="adminKey"
                            type="password"
                            placeholder="请输入管理员密钥"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '处理中...' : '设置管理员'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 