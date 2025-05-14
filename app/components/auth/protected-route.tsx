'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Loading from '@/app/components/base/loading'

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Set loading to false once session status is determined
        if (status !== 'loading') {
            setIsLoading(false)
        }
    }, [status])

    useEffect(() => {
        // Redirect to login if not authenticated and not loading
        if (!isLoading && !session) {
            router.push('/auth')
        }
    }, [isLoading, session, router])

    if (isLoading) {
        return <Loading />
    }

    if (!session) {
        return null
    }

    return <>{children}</>
}

export default ProtectedRoute 