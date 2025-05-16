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
    // 示例应用配置 - 需要替换为真实的配置
    {
        id: 'app2',
        name: '第二个应用',
        appId: 'your-second-app-id',
        apiKey: 'your-second-app-key',
        apiUrl: 'https://api.dify.ai/v1',
        description: '示例应用 - 需要替换为真实的应用配置',
    },
    // 可以继续添加更多应用
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