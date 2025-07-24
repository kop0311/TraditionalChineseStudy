import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '小小读书郎 - 儿童中华经典学习平台',
  description: '专为儿童设计的中华经典学习平台，包含三字经、弟子规、道德经等经典文本的学习和练习功能',
  keywords: ['中华经典', '儿童教育', '三字经', '弟子规', '道德经', '汉字练习'],
  authors: [{ name: 'Traditional Chinese Study Team' }],
  robots: 'index, follow',
  openGraph: {
    title: '小小读书郎 - 儿童中华经典学习平台',
    description: '专为儿童设计的中华经典学习平台',
    type: 'website',
    locale: 'zh_CN',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Tailwind CSS is included via globals.css */}

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="origin-when-cross-origin" />

        {/* Performance hints */}
        <meta httpEquiv="X-DNS-Prefetch-Control" content="on" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
      </head>
      <body className={inter.className}>
        <div id="root">
          <Navigation />

          <main className="min-h-screen">
            {children}
          </main>

          <footer className="border-t bg-gray-50">
            <div className="container mx-auto max-w-7xl px-6 py-12">
              <div className="text-center space-y-4">
                <div className="flex justify-center items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                    <span className="text-white font-bold text-sm">学</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">小小读书郎</span>
                </div>
                <p className="text-lg font-medium text-gray-700">
                  传承中华文化，启蒙智慧人生
                </p>
                <p className="text-sm text-gray-500">
                  © 2024 小小读书郎 - Traditional Chinese Study Platform
                </p>
                <div className="flex justify-center space-x-4 text-2xl">
                  <span>🏮</span>
                  <span>🐉</span>
                  <span>🏮</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
        
        {/* Modern UI with Tailwind and shadcn/ui */}
        
        {/* Load Hanzi Writer */}
        <script
          src="https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js"
          async
        />
      </body>
    </html>
  )
}
