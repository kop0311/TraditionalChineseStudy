import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
          <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="flex h-16 items-center justify-between">
                <a href="/" className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                    <span className="text-white font-bold text-sm">学</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">小小读书郎</span>
                </a>
                <nav className="hidden md:flex items-center space-x-2">
                  <a 
                    href="/classics" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  >
                    📚 经典阅读
                  </a>
                  <a 
                    href="/enhanced-writing" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200"
                  >
                    ✍️ 汉字练习
                  </a>
                  <a 
                    href="/pinyin-practice" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
                  >
                    🎵 拼音练习
                  </a>
                </nav>
                {/* Mobile menu button */}
                <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

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
