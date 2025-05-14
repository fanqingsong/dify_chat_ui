import './globals.css'
import './styles/markdown.scss'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/providers/auth-provider'
import { I18nProvider } from '@/providers/i18n-provider'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
