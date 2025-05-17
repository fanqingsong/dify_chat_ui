import type { AppInfo } from '@/types/app'
import { RESTRICTED_ROLE_NAME } from '@/lib/constants'

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
        name: 'General',
        appId: `${process.env.NEXT_PUBLIC_APP_ID || ''}`,
        apiKey: `${process.env.NEXT_PUBLIC_APP_KEY || ''}`,
        apiUrl: `${process.env.NEXT_PUBLIC_API_URL || ''}`,
        isDefault: true,
    },
    // 第二个应用配置 - 暂时注释掉，保留代码结构
    /*
    {
        id: 'app2',
        name: RESTRICTED_ROLE_NAME,
        appId: `${process.env.NEXT_PUBLIC_APP_ID1 || ''}`,
        apiKey: `${process.env.NEXT_PUBLIC_APP_KEY1 || ''}`,
        apiUrl: `${process.env.NEXT_PUBLIC_API_URL1 || ''}`,
        description: `${RESTRICTED_ROLE_NAME} Agent`,
    },
    */
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

// 获取动态的应用配置参数函数，不再使用固定的导出变量
export const getAppId = () => getCurrentAppConfig().appId;
export const getApiKey = () => getCurrentAppConfig().apiKey;
export const getApiUrl = () => getCurrentAppConfig().apiUrl;

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