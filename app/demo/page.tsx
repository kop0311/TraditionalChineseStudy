'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Palette, BookOpen, PenTool, Sparkles, Code2 } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { FeatureCard } from '@/components/ui/FeatureCard'
import { StatsPanel } from '@/components/ui/StatsPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<string>('enhanced-writing')

  const demos = [
    {
      id: 'enhanced-writing',
      title: '增强版汉字书写练习',
      subtitle: 'Enhanced Chinese Writing Practice',
      description: 'Magic UI 增强的交互式汉字书写练习组件，集成Framer Motion动画和SVG笔画演示',
      url: '/enhanced-writing',
      emoji: '✍️',
      features: ['Framer Motion 动画', 'SVG 笔画动画', '语音合成', '传统美学设计'],
      difficulty: 'medium'
    },
    {
      id: 'design-showcase',
      title: '设计系统展示',
      subtitle: 'Design System Showcase',
      description: '完整的传统中华设计系统展示，包含色彩、字体、组件和文化元素',
      url: '/design-showcase',
      emoji: '🎨',
      features: ['传统色彩系统', '文化字体', '响应式设计', '无障碍支持'],
      difficulty: 'easy'
    },
    {
      id: 'classics',
      title: '经典阅读',
      subtitle: 'Classical Reading',
      description: '传统经典文本阅读体验，提供拼音标注和现代化阅读界面',
      url: '/classics',
      emoji: '📚',
      features: ['三字经', '弟子规', '道德经', '拼音标注'],
      difficulty: 'easy'
    }
  ]

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': 
        return { text: '简单', variant: 'default' as const, color: 'emerald' }
      case 'medium': 
        return { text: '中等', variant: 'secondary' as const, color: 'amber' }
      case 'hard': 
        return { text: '困难', variant: 'destructive' as const, color: 'red' }
      default: 
        return { text: '未知', variant: 'outline' as const, color: 'gray' }
    }
  }

  const techFeatures = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Magic UI 集成',
      description: 'Framer Motion 流畅动画',
      items: ['Framer Motion 流畅动画', 'Lucide React 图标系统', 'Class Variance Authority 样式管理', 'Tailwind CSS 响应式设计']
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: '传统文化设计',
      description: '传统中华色彩系统',
      items: ['传统中华色彩系统', '文化字体与排版', '书法美学元素', '现代交互体验']
    }
  ]

  return (
    <PageLayout
      title="功能演示中心"
      subtitle="Traditional Chinese Study - Enhanced Features Demo"
      description="体验我们的增强功能和传统中华设计美学"
      badge="演示平台"
    >
      {/* Demo Selection */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
        {demos.map((demo, index) => (
          <FeatureCard
            key={demo.id}
            title={demo.title}
            subtitle={demo.subtitle}
            description={demo.description}
            emoji={demo.emoji}
            badge={getDifficultyBadge(demo.difficulty)}
            actions={[
              {
                text: '体验演示',
                href: demo.url,
                variant: 'default',
                icon: <Monitor className="w-5 h-5" />,
                color: 'blue'
              }
            ]}
            delay={index * 0.2}
            className={selectedDemo === demo.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          />
        ))}
      </div>

      {/* Feature Highlights */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">技术亮点</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Technical Highlights - 现代技术与传统文化的完美融合
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {techFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="h-full bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Quick Access */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mb-16"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              快速访问
            </CardTitle>
            <CardDescription className="text-lg text-gray-700">
              Quick Access - 直达各功能模块
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: '/enhanced-writing', emoji: '✍️', label: '汉字练习', color: 'blue' },
                { href: '/design-showcase', emoji: '🎨', label: '设计展示', color: 'purple' },
                { href: '/classics', emoji: '📚', label: '经典阅读', color: 'emerald' },
                { href: '/', emoji: '🏠', label: '返回首页', color: 'gray' }
              ].map((link, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                >
                  <FeatureCard
                    title={link.label}
                    description=""
                    emoji={link.emoji}
                    actions={[
                      {
                        text: '前往',
                        href: link.href,
                        variant: 'default',
                        color: link.color
                      }
                    ]}
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Technology Stack */}
      <StatsPanel
        title="技术栈"
        subtitle="Technology Stack - 支撑平台的核心技术"
        stats={[
          {
            icon: <Code2 className="w-8 h-8" />,
            value: 'Next.js 15',
            label: 'React Framework',
            color: 'blue'
          },
          {
            icon: <Sparkles className="w-8 h-8" />,
            value: 'Framer Motion',
            label: 'Animation Library',
            color: 'purple'
          },
          {
            icon: <Palette className="w-8 h-8" />,
            value: 'Tailwind CSS',
            label: 'Styling Framework',
            color: 'emerald'
          },
          {
            icon: <PenTool className="w-8 h-8" />,
            value: 'TypeScript',
            label: 'Type Safety',
            color: 'amber'
          }
        ]}
        delay={0.8}
      />
    </PageLayout>
  )
}
