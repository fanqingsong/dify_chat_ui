'use client'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useAuth from '@/hooks/use-auth'

const AppUnavailable: FC = () => {
  const { t } = useTranslation()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className='flex flex-col justify-center items-center w-full h-full'>
      <div className='w-[480px] text-center'>
        <div className='flex justify-center mb-3'>
          <span className='text-xl text-gray-800 font-semibold'>{t('common.appUnavailable')}</span>
        </div>
        <div className='text-sm text-gray-500 mb-5'>
          {t('error.appUnavailableDescription') || '抱歉，应用程序当前不可用，可能是因为配置问题。'}
        </div>
        <button
          onClick={handleLogout}
          className="w-32 py-2 mx-auto border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('auth.logout')}
        </button>
      </div>
    </div>
  )
}

export default React.memo(AppUnavailable)
