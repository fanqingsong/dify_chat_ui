'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/use-auth'
import Loading from '@/app/components/base/loading'

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const router = useRouter()
    const { isAuthenticated, initialize } = useAuth()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                initialize()
            } catch (error) {
                console.error('Authentication initialization error:', error)
            } finally {
                // 无论如何都结束加载状态，避免无限加载
                setIsLoading(false)
            }
        }

        // 设置超时，确保不会无限加载
        const timeout = setTimeout(() => {
            setIsLoading(false)
        }, 3000)

        checkAuth()

        return () => {
            clearTimeout(timeout)
        }
    }, [initialize])

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth')
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading) {
        return <Loading />
    }

    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}

export default ProtectedRoute 