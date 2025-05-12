'use client'

import { FC, useEffect, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
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

  const handleLogout = async () => {
    try {
      await auth.logout()
      Toast.notify({
        type: 'success',
        message: t('auth.logoutSuccess'),
      })
    } catch (error) {
      Toast.notify({
        type: 'error',
        message: t('auth.logoutFailed'),
      })
    }
  }

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
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100"
        >
          {t('auth.logout') || '退出登录'}
        </button>
      </div>
    </div>
  )
}

export default Header
