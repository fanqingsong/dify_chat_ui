# 需要修改的文件

## 1. config/index.ts
```typescript
import type { AppInfo } from '@/types/app'

// APP 配置接口
export interface DifyAppConfig {
  id: string
  name: string
  appId: string
  apiKey: string
  apiUrl: string
  description?: string
  icon?: string
  isDefault?: boolean
}

// 多个 Dify APP 配置
export const DIFY_APPS: DifyAppConfig[] = [
  {
    id: 'default',
    name: 'Default App',
    appId: `${process.env.NEXT_PUBLIC_APP_ID || ''}`,
    apiKey: `${process.env.NEXT_PUBLIC_APP_KEY || ''}`,
    apiUrl: `${process.env.NEXT_PUBLIC_API_URL || ''}`,
    isDefault: true,
  },
  // 可以添加更多应用
  // {
  //   id: 'app2',
  //   name: 'Second App',
  //   appId: 'your-second-app-id',
  //   apiKey: 'your-second-app-key',
  //   apiUrl: 'your-second-app-url',
  // },
]

// 获取当前使用的 APP 配置
export const getCurrentAppConfig = (): DifyAppConfig => {
  // 从本地存储获取当前选择的 APP ID
  const currentAppId = typeof window !== 'undefined' 
    ? localStorage.getItem('current_dify_app_id') 
    : null;
  
  // 如果有存储的 APP ID 并且该 APP 存在，则返回该 APP 的配置
  if (currentAppId) {
    const appConfig = DIFY_APPS.find(app => app.id === currentAppId);
    if (appConfig) {
      return appConfig;
    }
  }
  
  // 否则返回默认 APP 配置
  return DIFY_APPS.find(app => app.isDefault) || DIFY_APPS[0];
}

// 兼容旧代码的导出
export const APP_ID = getCurrentAppConfig().appId
export const API_KEY = getCurrentAppConfig().apiKey
export const API_URL = getCurrentAppConfig().apiUrl

export const APP_INFO: AppInfo = {
  title: 'Chat APP',
  description: '',
  copyright: '',
  privacy_policy: '',
  default_language: 'en',
}

export const isShowPrompt = false
export const promptTemplate = 'I want you to act as a javascript console.'

export const API_PREFIX = '/api'

export const LOCALE_COOKIE_NAME = 'locale'

export const DEFAULT_VALUE_MAX_LEN = 48
```

## 2. app/components/app-selector.tsx
```typescript
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
              className={`block w-full text-left px-4 py-2 text-sm ${
                app.id === currentApp.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
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
```

## 3. app/api/utils/common.ts
```typescript
import { type NextRequest } from 'next/server'
import { ChatClient } from 'dify-client'
import { v4 } from 'uuid'
import { getCurrentAppConfig } from '@/config'

// Create a function to get the user prefix based on the current app configuration
const getUserPrefix = () => {
    const config = getCurrentAppConfig();
    return `user_${config.appId}:`;
}

export const getInfo = (request: NextRequest) => {
    const sessionId = request.cookies.get('session_id')?.value || v4()
    const userPrefix = getUserPrefix();
    const user = userPrefix + sessionId
    return {
        sessionId,
        user,
    }
}

export const setSession = (sessionId: string) => {
    return { 'Set-Cookie': `session_id=${sessionId}` }
}

// Create client dynamically based on the current app configuration
export const getClient = () => {
    const config = getCurrentAppConfig();
    return new ChatClient(config.apiKey, config.apiUrl || undefined);
}

// 每次获取最新的客户端实例
export const client = (() => {
  const config = getCurrentAppConfig();
  return new ChatClient(config.apiKey, config.apiUrl || undefined);
})();
```

## 4. i18n/lang/common.zh.ts (部分修改)
在文件中的 api 部分后添加:
```typescript
  appSelector: {
    switchSuccess: '已切换到 {{appName}}',
  },
```

## 5. i18n/lang/common.en.ts (部分修改)
在文件中的 api 部分后添加:
```typescript
  appSelector: {
    switchSuccess: 'Switched to {{appName}}',
  },
```

## 6. service/base.ts (部分修改)
在 baseFetch 函数中添加:
```typescript
  // 获取当前应用配置
  const currentAppConfig = getCurrentAppConfig()
  
  // ...其他代码...
  
  // 添加 Dify API 密钥到请求头
  if (currentAppConfig.apiKey) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'api-key': currentAppConfig.apiKey
    }
  }
``` 