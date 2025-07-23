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
        {/* Bootstrap CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="Referrer-Policy" content="origin-when-cross-origin" />

        {/* Performance hints */}
        <meta httpEquiv="X-DNS-Prefetch-Control" content="on" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
      </head>
      <body className={inter.className} style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-primary)' }}>
        <div id="root">
          <header className="navbar navbar-expand-lg" style={{
            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
            boxShadow: 'var(--shadow-md)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div className="container">
              <a className="navbar-brand chinese-text" href="/" style={{
                color: 'var(--primary-contrast)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: '700',
                textDecoration: 'none'
              }}>
                <span className="text-gradient" style={{ color: 'var(--primary-contrast)' }}>小小读书郎</span>
              </a>
              <nav className="navbar-nav ms-auto d-flex flex-row gap-3">
                <a className="nav-link chinese-text" href="/classics" style={{
                  color: 'var(--primary-contrast)',
                  transition: 'var(--transition-fast)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  📚 经典阅读
                </a>
                <a className="nav-link chinese-text" href="/enhanced-writing" style={{
                  color: 'var(--primary-contrast)',
                  transition: 'var(--transition-fast)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  ✍️ 汉字练习
                </a>
                <a className="nav-link chinese-text" href="/pinyin-practice" style={{
                  color: 'var(--primary-contrast)',
                  transition: 'var(--transition-fast)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  🎵 拼音练习
                </a>
                <a className="nav-link" href="/magic-ui" style={{
                  color: 'var(--accent-color)',
                  transition: 'var(--transition-fast)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--accent-color)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  🎨 Magic UI
                </a>
              </nav>
            </div>
          </header>

          <main className="container-fluid" style={{ minHeight: '80vh' }}>
            {children}
          </main>

          <footer className="text-center py-4 mt-5" style={{
            background: 'var(--surface-secondary)',
            borderTop: '1px solid var(--border-light)',
            color: 'var(--text-secondary)'
          }}>
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <p className="chinese-text mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                    传承中华文化，启蒙智慧人生
                  </p>
                  <p className="mb-0" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                    © 2024 小小读书郎 - Traditional Chinese Study Platform
                  </p>
                  <div className="mt-3">
                    <span style={{ color: 'var(--primary-color)' }}>🏮</span>
                    <span className="mx-2" style={{ color: 'var(--secondary-color)' }}>🐉</span>
                    <span style={{ color: 'var(--accent-color)' }}>🏮</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
        
        {/* Load Bootstrap JS */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          async
        />
        
        {/* Load Hanzi Writer */}
        <script
          src="https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js"
          async
        />
      </body>
    </html>
  )
}
