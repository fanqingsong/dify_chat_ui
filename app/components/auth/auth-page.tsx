'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Login from './login'
import Register from './register'
import useAuth from '@/hooks/use-auth'

const AuthPage = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
    const router = useRouter()
    const { isAuthenticated, initialize } = useAuth()

    useEffect(() => {
        initialize()
    }, [initialize])

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/')
        }
    }, [isAuthenticated, router])

    const handleSwitchToRegister = () => {
        setActiveTab('register')
    }

    const handleSwitchToLogin = () => {
        setActiveTab('login')
    }

    return (
        <div className="flex min-h-screen flex-col justify-center items-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-bold text-gray-900 mb-8">
                    Dify Chat UI
                </h1>

                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`flex-1 py-2 px-1 text-center font-medium text-sm border-b-2 ${activeTab === 'login'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={handleSwitchToLogin}
                        >
                            登录
                        </button>
                        <button
                            className={`flex-1 py-2 px-1 text-center font-medium text-sm border-b-2 ${activeTab === 'register'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={handleSwitchToRegister}
                        >
                            注册
                        </button>
                    </div>

                    {activeTab === 'login' ? (
                        <Login onSwitchToRegister={handleSwitchToRegister} />
                    ) : (
                        <Register onSwitchToLogin={handleSwitchToLogin} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default AuthPage 