'use client'

import { FC, useEffect, useState, useRef } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSession } from 'next-auth/react'
import useAuth from '@/hooks/use-auth'
import Toast from '@/app/components/base/toast'
import AppIcon from '@/app/components/base/app-icon'

export type IHeaderProps = {
  title?: string | React.ReactNode
  icon?: React.ReactNode
  onShowSideBar?: () => void
  isMobile?: boolean
  onCreateNewChat?: () => void
}

const Header = ({
  title = 'Chat APP',
  icon,
  onShowSideBar,
  isMobile = false,
  onCreateNewChat,
}: IHeaderProps) => {
  const { t } = useTranslation()
  const auth = useAuth()
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [userData, setUserData] = useState<{ name: string, email: string }>({ name: '', email: '' })

  // 先从会话获取用户信息，优先级高
  useEffect(() => {
    if (session?.user) {
      setUserData({
        name: session.user.name || '',
        email: session.user.email || ''
      })
    }
  }, [session])

  // 如果会话中没有用户信息，尝试从localStorage获取
  useEffect(() => {
    // 初始化认证状态
    auth.initialize()

    // 从localStorage获取用户信息
    const getUserFromLocalStorage = () => {
      try {
        const userStr = localStorage.getItem('next-auth.user')
        if (userStr) {
          const user = JSON.parse(userStr)
          if (user && (user.name || user.email)) {
            setUserData({
              name: user.name || '',
              email: user.email || ''
            })
            return true
          }
        }
        return false
      } catch (e) {
        console.error('Error parsing user data:', e)
        return false
      }
    }

    // 从会话存储获取用户信息
    const getUserFromSessionStorage = () => {
      try {
        const sessionStr = sessionStorage.getItem('nextauth.session')
        if (sessionStr) {
          const sessionData = JSON.parse(sessionStr)
          if (sessionData?.user) {
            setUserData({
              name: sessionData.user.name || '',
              email: sessionData.user.email || ''
            })
            return true
          }
        }
        return false
      } catch (e) {
        console.error('Error parsing session data:', e)
        return false
      }
    }

    // 如果auth.user存在，使用它更新用户数据
    if (auth.user && (auth.user.name || auth.user.email)) {
      setUserData({
        name: auth.user.name || '',
        email: auth.user.email || ''
      })
    }
    // 否则尝试从localStorage或sessionStorage获取
    else if (!getUserFromSessionStorage()) {
      getUserFromLocalStorage()
    }
  }, [auth])

  // 点击其他地方关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await auth.logout()
      Toast.notify({
        type: 'success',
        message: t('auth.LogoutSuccess'),
      })
      setShowUserMenu(false)
    } catch (error) {
      Toast.notify({
        type: 'error',
        message: t('auth.LogoutFailed'),
      })
    }
  }

  // 创建用户头像显示的文字
  const getInitials = () => {
    if (userData.name) {
      return userData.name.charAt(0).toUpperCase();
    }

    if (userData.email) {
      return userData.email.charAt(0).toUpperCase();
    }

    return 'U'; // 默认显示U (User的首字母)
  }

  // 调试信息，帮助定位问题
  console.log('Header userData:', userData)
  console.log('Session user:', session?.user)
  console.log('Auth user:', auth.user)

  return (
    <div className="flex items-center justify-between px-6 h-14 border-b border-gray-100 shrink-0">
      <div className="flex items-center space-x-2">
        {isMobile && (
          <div onClick={onShowSideBar} className="flex items-center justify-center w-6 h-6 cursor-pointer">
            <svg width="14.4" height="10.4" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.7 2.10071H1.3C0.582812 2.10071 0 1.64303 0 1.07625V1.02446C0 0.457678 0.582812 0 1.3 0H16.7C17.4172 0 18 0.457678 18 1.02446V1.07625C18 1.64303 17.4172 2.10071 16.7 2.10071ZM16.7 7.55357H1.3C0.582812 7.55357 0 7.09589 0 6.52911V6.47732C0 5.91054 0.582812 5.45286 1.3 5.45286H16.7C17.4172 5.45286 18 5.91054 18 6.47732V6.52911C18 7.09589 17.4172 7.55357 16.7 7.55357ZM16.7 13H1.3C0.582812 13 0 12.5423 0 11.9755V11.9237C0 11.357 0.582812 10.8993 1.3 10.8993H16.7C17.4172 10.8993 18 11.357 18 11.9237V11.9755C18 12.5423 17.4172 13 16.7 13Z" fill="#131313" />
            </svg>
          </div>
        )}
        {icon || <AppIcon size="small" />}
        <div className="text-base font-semibold text-gray-900">{title}</div>
      </div>

      <div className="flex items-center space-x-2">
        {isMobile && onCreateNewChat && (
          <button
            onClick={onCreateNewChat}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100 mr-2"
          >
            {t('app.chat.newChat') || '新对话'}
          </button>
        )}

        {/* 用户头像和下拉菜单 */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
          >
            {getInitials()}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="font-medium text-sm text-gray-800">{userData.name || userData.email}</div>
                {userData.name && userData.email && userData.name !== userData.email && (
                  <div className="text-xs text-gray-500 truncate">{userData.email}</div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {t('auth.Logout') || '退出登录'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header
