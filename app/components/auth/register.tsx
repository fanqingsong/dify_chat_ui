'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useAuth from '@/hooks/use-auth'
import Toast from '@/app/components/base/toast'

interface RegisterProps {
    onSwitchToLogin: () => void
}

const Register = ({ onSwitchToLogin }: RegisterProps) => {
    const { t } = useTranslation()
    const auth = useAuth()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!username || !email || !password || !confirmPassword) {
            Toast.notify({
                type: 'error',
                message: t('auth.validation.allFieldsRequired'),
            })
            return
        }

        if (password !== confirmPassword) {
            Toast.notify({
                type: 'error',
                message: t('auth.validation.passwordsDoNotMatch'),
            })
            return
        }

        setIsLoading(true)

        try {
            await auth.register({ username, email, password })
            Toast.notify({
                type: 'success',
                message: t('auth.registerSuccess'),
            })
        } catch (error: any) {
            Toast.notify({
                type: 'error',
                message: error.message || t('auth.registerFailed'),
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col w-full max-w-md px-8 py-10 bg-white rounded-xl shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">
                {t('auth.register')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        {t('auth.username')}
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        {t('auth.email')}
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        {t('auth.password')}
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        {t('auth.confirmPassword')}
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('auth.registering') : t('auth.registerButton')}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    {t('auth.haveAccount')}{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        {t('auth.signIn')}
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Register 