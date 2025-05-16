import { type NextRequest } from 'next/server'
import { ChatClient } from 'dify-client'
import { v4 } from 'uuid'
import { API_KEY, API_URL, APP_ID, getCurrentAppConfig } from '@/config'

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