'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useAuth from '@/hooks/use-auth'
import Toast from '@/app/components/base/toast'

interface LoginProps {
    onSwitchToRegister: () => void
}

const Login = ({ onSwitchToRegister }: LoginProps) => {
    const { t } = useTranslation()
    const auth = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            Toast.notify({
                type: 'error',
                message: t('auth.Validation.AllFieldsRequired'),
            })
            return
        }

        setIsLoading(true)

        try {
            await auth.login({ email, password })
            Toast.notify({
                type: 'success',
                message: t('auth.LoginSuccess'),
            })
        } catch (error: any) {
            Toast.notify({
                type: 'error',
                message: error.message || t('auth.LoginFailed'),
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col w-full max-w-md px-8 py-10 bg-white rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        {t('auth.Email')}
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
                        {t('auth.Password')}
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
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('auth.LoggingIn') : t('auth.LoginButton')}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    {t('auth.NoAccount')}{' '}
                    <button
                        onClick={onSwitchToRegister}
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        {t('auth.SignUp')}
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Login 