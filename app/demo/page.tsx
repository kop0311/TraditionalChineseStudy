'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<string>('enhanced-writing')

  const demos = [
    {
      id: 'enhanced-writing',
      title: '增强版汉字书写练习',
      description: 'Magic UI 增强的交互式汉字书写练习组件',
      url: '/enhanced-writing',
      features: ['Framer Motion 动画', 'SVG 笔画动画', '语音合成', '传统美学设计']
    },
    {
      id: 'design-showcase',
      title: '设计系统展示',
      description: '完整的传统中华设计系统展示',
      url: '/design-showcase',
      features: ['传统色彩系统', '文化字体', '响应式设计', '无障碍支持']
    },
    {
      id: 'classics',
      title: '经典阅读',
      description: '传统经典文本阅读体验',
      url: '/classics',
      features: ['三字经', '弟子规', '道德经', '拼音标注']
    }
  ]

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="chinese-title display-3 mb-4 animate-fade-in">
          功能演示中心
        </h1>
        <p className="lead chinese-calligraphy mb-4">
          Traditional Chinese Study - Enhanced Features Demo
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          体验我们的增强功能和传统中华设计美学
        </p>
      </div>

      {/* Demo Selection */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card-chinese card-featured">
            <div className="card-chinese-header">
              <h2 className="card-chinese-title">选择演示</h2>
              <p className="card-chinese-subtitle">Choose Demo</p>
            </div>
            <div className="card-chinese-body">
              <div className="row">
                {demos.map((demo) => (
                  <div key={demo.id} className="col-md-4 mb-4">
                    <div 
                      className={`card-chinese card-interactive ${
                        selectedDemo === demo.id ? 'card-featured border-gradient' : 'card-minimal'
                      }`}
                      onClick={() => setSelectedDemo(demo.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-chinese-header">
                        <h5 className="card-chinese-title">{demo.title}</h5>
                        <p className="card-chinese-subtitle">{demo.description}</p>
                      </div>
                      <div className="card-chinese-body">
                        <ul className="list-unstyled">
                          {demo.features.map((feature, index) => (
                            <li key={index} className="mb-2">
                              <span style={{ color: 'var(--primary-color)' }}>✓</span>
                              <span className="ms-2">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="card-chinese-footer">
                        <Link 
                          href={demo.url}
                          className="btn-chinese btn-primary w-100"
                        >
                          <span>🚀</span>
                          体验演示
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card-chinese card-practice">
            <div className="card-chinese-header">
              <h2 className="card-chinese-title">技术亮点</h2>
              <p className="card-chinese-subtitle">Technical Highlights</p>
            </div>
            <div className="card-chinese-body">
              <div className="row">
                <div className="col-md-6 mb-4">
                  <h5 className="chinese-text mb-3">🎨 Magic UI 集成</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">• Framer Motion 流畅动画</li>
                    <li className="mb-2">• Lucide React 图标系统</li>
                    <li className="mb-2">• Class Variance Authority 样式管理</li>
                    <li className="mb-2">• Tailwind CSS 响应式设计</li>
                  </ul>
                </div>
                <div className="col-md-6 mb-4">
                  <h5 className="chinese-text mb-3">🏮 传统文化设计</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">• 传统中华色彩系统</li>
                    <li className="mb-2">• 文化字体与排版</li>
                    <li className="mb-2">• 书法美学元素</li>
                    <li className="mb-2">• 现代交互体验</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card-chinese card-progress cultural-pattern">
            <div className="card-chinese-header text-center">
              <h2 className="card-chinese-title">快速访问</h2>
              <p className="card-chinese-subtitle">Quick Access</p>
            </div>
            <div className="card-chinese-body">
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/enhanced-writing" className="btn-chinese btn-primary btn-lg">
                  <span>✍️</span>
                  汉字练习
                </Link>
                <Link href="/design-showcase" className="btn-chinese btn-secondary btn-lg">
                  <span>🎨</span>
                  设计展示
                </Link>
                <Link href="/classics" className="btn-chinese btn-accent btn-lg">
                  <span>📚</span>
                  经典阅读
                </Link>
                <Link href="/" className="btn-chinese btn-outline btn-lg">
                  <span>🏠</span>
                  返回首页
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="row">
        <div className="col-12">
          <div className="card-chinese card-minimal">
            <div className="card-chinese-header">
              <h3 className="card-chinese-title">技术栈</h3>
              <p className="card-chinese-subtitle">Technology Stack</p>
            </div>
            <div className="card-chinese-body">
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <div className="card-stat">
                    <span className="card-stat-value" style={{ color: 'var(--primary-color)' }}>Next.js 15</span>
                    <p className="card-stat-label">React Framework</p>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card-stat">
                    <span className="card-stat-value" style={{ color: 'var(--secondary-color)' }}>Framer Motion</span>
                    <p className="card-stat-label">Animation Library</p>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card-stat">
                    <span className="card-stat-value" style={{ color: 'var(--accent-color)' }}>Tailwind CSS</span>
                    <p className="card-stat-label">Styling Framework</p>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card-stat">
                    <span className="card-stat-value" style={{ color: 'var(--info-color)' }}>TypeScript</span>
                    <p className="card-stat-label">Type Safety</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
