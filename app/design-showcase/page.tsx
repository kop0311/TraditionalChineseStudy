'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, Type, Layout, Sparkles, Sun, Moon, Eye, Code2 } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { FeatureCard } from '@/components/ui/FeatureCard'
import { StatsPanel } from '@/components/ui/StatsPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function DesignShowcasePage() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark')
  }

  const colorPalette = [
    { name: '朱红', englishName: 'Vermillion', color: 'bg-red-600', description: 'Primary Color', emoji: '🔴' },
    { name: '翠绿', englishName: 'Jade Green', color: 'bg-emerald-600', description: 'Secondary Color', emoji: '🟢' },
    { name: '明黄', englishName: 'Imperial Yellow', color: 'bg-amber-500', description: 'Accent Color', emoji: '🟡' },
    { name: '梅紫', englishName: 'Plum Purple', color: 'bg-purple-600', description: 'Info Color', emoji: '🟣' }
  ]

  return (
    <PageLayout
      title="设计系统展示"
      subtitle="Traditional Chinese Study Application Design System"
      description="展示传统中华文化美学与现代网页设计的完美融合"
      badge="设计平台"
    >
      {/* Theme Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDarkMode}
          className="flex items-center gap-2"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDarkMode ? '浅色模式' : '深色模式'}
        </Button>
      </motion.div>

      {/* Color Palette */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">传统色彩系统</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Traditional Color Palette - 传承千年的中华色彩美学
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {colorPalette.map((color, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className={`mx-auto mb-4 w-20 h-20 rounded-full ${color.color} shadow-lg group-hover:scale-110 transition-transform duration-300`} />
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{color.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{color.englishName}</p>
                  <Badge variant="outline" className="text-xs">
                    {color.description}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Typography */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">字体系统</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Typography System - 传统与现代的文字艺术
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Type className="w-6 h-6 text-blue-600" />
                  中华文化传承
                </CardTitle>
                <CardDescription>传统中文字体展示</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">中华文化传承</h3>
                  <p className="text-gray-600 leading-relaxed">
                    这是中文文本样式，使用传统中文字体族，具有良好的可读性和文化韵味。
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-blue-600">书法风格文本展示</p>
                </div>
                <div className="text-center">
                  <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text">
                    学
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="h-full bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Code2 className="w-6 h-6 text-emerald-600" />
                  English Typography
                </CardTitle>
                <CardDescription>现代英文字体展示</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">English Typography</h3>
                  <p className="text-gray-600 leading-relaxed">
                    This is the English text style using modern sans-serif fonts for optimal readability and accessibility.
                  </p>
                </div>
                <div>
                  <p className="text-lg text-purple-600 font-medium">Pinyin text style: xuéxí</p>
                </div>
                <div>
                  <p className="text-2xl text-amber-600 font-bold">Large pinyin: xuéxí</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Button System */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">按钮系统</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Button System - 现代交互元素设计
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Button Variants</CardTitle>
                <CardDescription>不同样式的按钮展示</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default" className="flex items-center gap-2">
                      <span>📚</span>
                      Primary
                    </Button>
                    <Button variant="secondary" className="flex items-center gap-2">
                      <span>✍️</span>
                      Secondary
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <span>🎵</span>
                      Outline
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Button Sizes</CardTitle>
                <CardDescription>不同尺寸的按钮展示</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button>Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <span>📖</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Interactive Feature Cards */}
      <div className="grid gap-8 md:grid-cols-3 mb-16">
        {[
          {
            id: 'classic',
            title: '经典阅读',
            subtitle: 'Classic Reading',
            description: '传统经典文本学习',
            emoji: '📖',
            character: '读',
            color: 'text-red-600',
            badge: { text: '适合初学', color: 'emerald' },
            href: '/classics'
          },
          {
            id: 'practice',
            title: '汉字练习',
            subtitle: 'Character Writing',
            description: '交互式汉字书写练习',
            emoji: '✍️',
            character: '写',
            color: 'text-emerald-600',
            badge: { text: '互动练习', color: 'blue' },
            href: '/enhanced-writing'
          },
          {
            id: 'progress',
            title: '拼音学习',
            subtitle: 'Pinyin Practice',
            description: '拼音发音练习和声调训练',
            emoji: '🎵',
            character: '音',
            color: 'text-amber-600',
            badge: { text: '声调训练', color: 'purple' },
            href: '/pinyin-practice'
          }
        ].map((feature, index) => (
          <FeatureCard
            key={feature.id}
            title={feature.title}
            subtitle={feature.subtitle}
            description={feature.description}
            emoji={feature.emoji}
            badge={{
              text: feature.badge.text,
              variant: 'outline' as const,
              color: feature.badge.color
            }}
            actions={[
              {
                text: '开始学习',
                href: feature.href,
                variant: 'default',
                color: feature.badge.color
              }
            ]}
            delay={index * 0.2}
            className={`cursor-pointer transition-all duration-300 ${
              selectedCard === feature.id ? 'ring-2 ring-blue-500 ring-opacity-50 scale-105' : 'hover:scale-105'
            }`}
          />
        ))}
      </div>

      {/* Interactive Components */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">交互组件</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Interactive Components - 沉浸式学习体验
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-gray-900">汉字书写组件</CardTitle>
                <CardDescription>Character Writing Component</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  学
                </div>
                <p className="text-2xl text-purple-600 font-bold">xuéxí</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button size="sm" variant="default">演示笔画</Button>
                  <Button size="sm" variant="secondary">开始练习</Button>
                  <Button size="sm" variant="ghost">显示提示</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-gray-900">拼音练习组件</CardTitle>
                <CardDescription>Pinyin Practice Component</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="text-6xl font-bold text-gray-900">妈</div>
                <div className="max-w-xs mx-auto">
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                    placeholder="输入拼音..."
                    defaultValue="mā"
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <Button size="sm" variant="default" className="w-10 h-10">1</Button>
                  <Button size="sm" variant="outline" className="w-10 h-10">2</Button>
                  <Button size="sm" variant="outline" className="w-10 h-10">3</Button>
                  <Button size="sm" variant="outline" className="w-10 h-10">4</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Navigation */}
      <StatsPanel
        title="探索更多功能"
        subtitle="Explore More Features - 发现传统文化学习的无限可能"
        stats={[
          {
            emoji: '🏠',
            value: '首页',
            label: 'Home Page',
            color: 'gray'
          },
          {
            emoji: '📚',
            value: '经典',
            label: 'Classic Reading',
            color: 'blue'
          },
          {
            emoji: '✍️',
            value: '书写',
            label: 'Character Writing',
            color: 'emerald'
          },
          {
            emoji: '🎵',
            value: '拼音',
            label: 'Pinyin Practice',
            color: 'purple'
          }
        ]}
        delay={1.2}
      />
    </PageLayout>
  )
}
