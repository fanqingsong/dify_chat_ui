import type { FC } from 'react'
import React from 'react'
import { AuthPage } from '@/app/components/auth'

const Auth: FC = () => {
    return (
        <AuthPage />
    )
}

export default React.memo(Auth) 