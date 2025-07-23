'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DesignShowcasePage() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark')
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="chinese-title display-3 mb-4 animate-fade-in">
          设计系统展示
        </h1>
        <p className="lead chinese-calligraphy mb-4">
          Traditional Chinese Study Application Design System
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          展示传统中华文化美学与现代网页设计的完美融合
        </p>
        <div className="mt-4">
          <button 
            className="btn-chinese btn-ghost btn-sm"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? '🌞 浅色模式' : '🌙 深色模式'}
          </button>
        </div>
      </div>

      {/* Color Palette */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card-chinese card-featured">
            <div className="card-chinese-header">
              <h2 className="card-chinese-title">传统色彩系统</h2>
              <p className="card-chinese-subtitle">Traditional Color Palette</p>
            </div>
            <div className="card-chinese-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div 
                      className="rounded-circle mx-auto mb-2" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: 'var(--primary-color)',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    ></div>
                    <h6 className="chinese-text">朱红 Vermillion</h6>
                    <small style={{ color: 'var(--text-muted)' }}>Primary Color</small>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div 
                      className="rounded-circle mx-auto mb-2" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: 'var(--secondary-color)',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    ></div>
                    <h6 className="chinese-text">翠绿 Jade Green</h6>
                    <small style={{ color: 'var(--text-muted)' }}>Secondary Color</small>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div 
                      className="rounded-circle mx-auto mb-2" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: 'var(--accent-color)',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    ></div>
                    <h6 className="chinese-text">明黄 Imperial Yellow</h6>
                    <small style={{ color: 'var(--text-muted)' }}>Accent Color</small>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div 
                      className="rounded-circle mx-auto mb-2" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: 'var(--info-color)',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    ></div>
                    <h6 className="chinese-text">梅紫 Plum Purple</h6>
                    <small style={{ color: 'var(--text-muted)' }}>Info Color</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card-chinese card-minimal">
            <div className="card-chinese-header">
              <h2 className="card-chinese-title">字体系统</h2>
              <p className="card-chinese-subtitle">Typography System</p>
            </div>
            <div className="card-chinese-body">
              <div className="row">
                <div className="col-md-6">
                  <h3 className="chinese-title">中华文化传承</h3>
                  <p className="chinese-text">
                    这是中文文本样式，使用传统中文字体族，
                    具有良好的可读性和文化韵味。
                  </p>
                  <p className="chinese-calligraphy">
                    书法风格文本展示
                  </p>
                  <div className="hanzi-display text-gradient">学</div>
                </div>
                <div className="col-md-6">
                  <h3>English Typography</h3>
                  <p>
                    This is the English text style using modern sans-serif fonts
                    for optimal readability and accessibility.
                  </p>
                  <p className="pinyin-text">Pinyin text style: xuéxí</p>
                  <p className="pinyin-large">Large pinyin: xuéxí</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button System */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card-chinese card-practice">
            <div className="card-chinese-header">
              <h2 className="card-chinese-title">按钮系统</h2>
              <p className="card-chinese-subtitle">Button System</p>
            </div>
            <div className="card-chinese-body">
              <div className="row">
                <div className="col-md-6 mb-4">
                  <h5 className="mb-3">Button Variants</h5>
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    <button className="btn-chinese btn-primary">
                      <span>📚</span>
                      Primary
                    </button>
                    <button className="btn-chinese btn-secondary">
                      <span>✍️</span>
                      Secondary
                    </button>
                    <button className="btn-chinese btn-accent">
                      <span>🎵</span>
                      Accent
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-3">
                    <button className="btn-chinese btn-outline">Outline</button>
                    <button className="btn-chinese btn-ghost">Ghost</button>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <h5 className="mb-3">Button Sizes</h5>
                  <div className="d-flex flex-wrap gap-3 align-items-center">
                    <button className="btn-chinese btn-primary btn-sm">Small</button>
                    <button className="btn-chinese btn-primary">Default</button>
                    <button className="btn-chinese btn-primary btn-lg">Large</button>
                    <button className="btn-chinese btn-primary btn-icon">
                      <span>📖</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card System */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card-chinese card-progress">
            <div className="card-chinese-header">
              <h2 className="card-chinese-title">卡片系统</h2>
              <p className="card-chinese-subtitle">Card System</p>
            </div>
            <div className="card-chinese-body">
              <div className="row">
                <div className="col-md-4 mb-4">
                  <div 
                    className={`card-chinese card-classic card-interactive ${
                      selectedCard === 'classic' ? 'border-gradient' : ''
                    }`}
                    onClick={() => setSelectedCard(selectedCard === 'classic' ? null : 'classic')}
                  >
                    <div className="card-chinese-header text-center">
                      <div className="hanzi-display" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}>
                        读
                      </div>
                      <h5 className="card-chinese-title">经典阅读</h5>
                      <p className="card-chinese-subtitle">Classic Reading</p>
                    </div>
                    <div className="card-chinese-body">
                      <p>传统经典文本学习</p>
                      <div className="card-difficulty-badge easy">
                        <span>📖</span> 适合初学
                      </div>
                    </div>
                    <div className="card-chinese-footer">
                      <button className="btn-chinese btn-primary">开始学习</button>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div 
                    className={`card-chinese card-practice card-interactive ${
                      selectedCard === 'practice' ? 'border-gradient' : ''
                    }`}
                    onClick={() => setSelectedCard(selectedCard === 'practice' ? null : 'practice')}
                  >
                    <div className="card-chinese-header text-center">
                      <div className="hanzi-display" style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
                        写
                      </div>
                      <h5 className="card-chinese-title">汉字练习</h5>
                      <p className="card-chinese-subtitle">Character Writing</p>
                    </div>
                    <div className="card-chinese-body">
                      <p>交互式汉字书写练习</p>
                      <div className="card-difficulty-badge medium">
                        <span>✍️</span> 互动练习
                      </div>
                    </div>
                    <div className="card-chinese-footer">
                      <button className="btn-chinese btn-secondary">开始练习</button>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div 
                    className={`card-chinese card-progress card-interactive ${
                      selectedCard === 'progress' ? 'border-gradient' : ''
                    }`}
                    onClick={() => setSelectedCard(selectedCard === 'progress' ? null : 'progress')}
                  >
                    <div className="card-chinese-header text-center">
                      <div className="hanzi-display" style={{ fontSize: '3rem', color: 'var(--accent-color)' }}>
                        音
                      </div>
                      <h5 className="card-chinese-title">拼音学习</h5>
                      <p className="card-chinese-subtitle">Pinyin Practice</p>
                    </div>
                    <div className="card-chinese-body">
                      <p>拼音发音练习和声调训练</p>
                      <div className="card-difficulty-badge easy">
                        <span>🎵</span> 声调训练
                      </div>
                    </div>
                    <div className="card-chinese-footer">
                      <button className="btn-chinese btn-accent">开始练习</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Components */}
      <div className="row mb-5">
        <div className="col-md-6 mb-4">
          <div className="hanzi-writer-container">
            <div className="text-center mb-4">
              <h5 className="chinese-text mb-3">汉字书写组件</h5>
              <div className="hanzi-display text-gradient">学</div>
              <p className="pinyin-large">xuéxí</p>
            </div>
            <div className="hanzi-writer-controls">
              <button className="btn-chinese btn-primary btn-sm">演示笔画</button>
              <button className="btn-chinese btn-secondary btn-sm">开始练习</button>
              <button className="btn-chinese btn-ghost btn-sm">显示提示</button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="pinyin-practice-container">
            <div className="pinyin-character-display">
              <div className="pinyin-character">妈</div>
              <div className="pinyin-input-group">
                <input 
                  type="text" 
                  className="pinyin-input" 
                  placeholder="输入拼音..."
                  defaultValue="mā"
                />
              </div>
              <div className="tone-selector">
                <button className="tone-button selected">1</button>
                <button className="tone-button">2</button>
                <button className="tone-button">3</button>
                <button className="tone-button">4</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="row">
        <div className="col-12 text-center">
          <div className="card-chinese card-featured cultural-pattern">
            <div className="card-chinese-body py-4">
              <h3 className="chinese-title mb-4">探索更多功能</h3>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/" className="btn-chinese btn-primary btn-lg">
                  <span>🏠</span>
                  返回首页
                </Link>
                <Link href="/classics" className="btn-chinese btn-secondary btn-lg">
                  <span>📚</span>
                  经典阅读
                </Link>
                <Link href="/enhanced-writing" className="btn-chinese btn-accent btn-lg">
                  <span>✍️</span>
                  汉字练习
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
