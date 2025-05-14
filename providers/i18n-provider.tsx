'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getLocaleOnClient } from '@/i18n/client'
import '@/i18n/i18next-config'

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    useEffect(() => {
        // 设置默认语言
        const locale = getLocaleOnClient()
        document.documentElement.lang = locale
    }, [pathname])

    return <>{children}</>
} 