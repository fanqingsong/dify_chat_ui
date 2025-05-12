'use client'

import type { FC } from 'react'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/utils/auth'

import type { IMainProps } from '@/app/components'
import Main from '@/app/components'
import { ProtectedRoute } from '@/app/components/auth'

const App: FC<IMainProps> = ({
  params,
}: any) => {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth')
    }
  }, [router])

  return (
    <ProtectedRoute>
      <Main params={params} />
    </ProtectedRoute>
  )
}

export default React.memo(App)
