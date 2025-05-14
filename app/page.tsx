'use client'

import type { FC } from 'react'
import React from 'react'
import type { IMainProps } from '@/app/components'
import Main from '@/app/components'
import { ProtectedRoute } from '@/app/components/auth'

const App: FC<IMainProps> = ({
  params,
}: any) => {
  return (
    <ProtectedRoute>
      <Main params={params} />
    </ProtectedRoute>
  )
}

export default React.memo(App)
