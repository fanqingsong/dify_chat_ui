'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { DIFY_APPS, DifyAppConfig, getCurrentAppConfig } from '@/config'
import Toast from '@/app/components/base/toast'

const AppSelector = () => {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const [currentApp, setCurrentApp] = useState<DifyAppConfig | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // 添加调试日志
    console.log('AppSelector渲染', {
        DIFY_APPS,
        appsLength: DIFY_APPS.length,
        currentApp
    })

    // 初始化当前选择的应用
    useEffect(() => {
        setCurrentApp(getCurrentAppConfig())
    }, [])

    // 点击其他地方关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // 切换应用
    const handleAppChange = (app: DifyAppConfig) => {
        if (app.id === currentApp?.id) {
            setIsOpen(false)
            return
        }

        // 保存选择到本地存储
        localStorage.setItem('current_dify_app_id', app.id)
        setCurrentApp(app)
        setIsOpen(false)

        // 显示成功提示
        Toast.notify({
            type: 'success',
            message: t('appSelector.switchSuccess', { appName: app.name }) || `已切换到 ${app.name}`,
        })

        // 刷新页面以应用新的配置
        setTimeout(() => {
            window.location.reload()
        }, 500)
    }

    // 如果只有一个应用，不显示选择器
    if (DIFY_APPS.length <= 1 || !currentApp) {
        console.log('AppSelector不显示的原因:', {
            appsLength: DIFY_APPS.length,
            hasCurrentApp: !!currentApp,
            DIFY_APPS
        })
        return null
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
                <span>{currentApp.name}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    {DIFY_APPS.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => handleAppChange(app)}
                            className={`block w-full text-left px-4 py-2 text-sm ${app.id === currentApp.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span>{app.name}</span>
                                {app.id === currentApp.id && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                )}
                            </div>
                            {app.description && <p className="text-xs text-gray-500 mt-1">{app.description}</p>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AppSelector