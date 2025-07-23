'use client'

import Link from 'next/link'
import { useState } from 'react'
import ChineseButton from '../../components/ui/chinese-button'
import ChineseCard from '../../components/ui/chinese-card'

export default function MagicShowcasePage() {
  const [selectedDemo, setSelectedDemo] = useState<string>('buttons')

  const demos = [
    {
      id: 'buttons',
      title: '按钮组件',
      description: 'Magic UI 增强的中华风格按钮'
    },
    {
      id: 'cards',
      title: '卡片组件',
      description: '优雅的中华文化主题卡片'
    },
    {
      id: 'interactive',
      title: '交互演示',
      description: '完整的用户交互体验'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-amber-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 chinese-title">Magic UI 中华组件展示</h1>
          <p className="text-xl text-gray-600">Enhanced Chinese UI Components with Traditional Aesthetics</p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-amber-500 mx-auto rounded-full"></div>
        </div>

        {/* Demo Navigation */}
        <div className="flex justify-center gap-4 flex-wrap">
          {demos.map((demo) => (
            <ChineseButton
              key={demo.id}
              variant={selectedDemo === demo.id ? 'primary' : 'outline'}
              size="md"
              onClick={() => setSelectedDemo(demo.id)}
            >
              {demo.title}
            </ChineseButton>
          ))}
        </div>

        {/* Button Demo */}
        {selectedDemo === 'buttons' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 text-center chinese-text">按钮组件演示</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Primary Buttons</h3>
                <div className="space-y-3">
                  <ChineseButton variant="primary" size="sm">开始学习</ChineseButton>
                  <ChineseButton variant="primary" size="md">探索文化</ChineseButton>
                  <ChineseButton variant="primary" size="lg">深入了解</ChineseButton>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Secondary Buttons</h3>
                <div className="space-y-3">
                  <ChineseButton variant="secondary" size="sm">查看详情</ChineseButton>
                  <ChineseButton variant="secondary" size="md">了解更多</ChineseButton>
                  <ChineseButton variant="secondary" size="lg">立即体验</ChineseButton>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Outline Buttons</h3>
                <div className="space-y-3">
                  <ChineseButton variant="outline" size="sm">返回</ChineseButton>
                  <ChineseButton variant="outline" size="md">取消</ChineseButton>
                  <ChineseButton variant="outline" size="lg">重置</ChineseButton>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Ghost Buttons</h3>
                <div className="space-y-3">
                  <ChineseButton variant="ghost" size="sm">跳过</ChineseButton>
                  <ChineseButton variant="ghost" size="md">稍后</ChineseButton>
                  <ChineseButton variant="ghost" size="lg">忽略</ChineseButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Demo */}
        {selectedDemo === 'cards' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 text-center chinese-text">卡片组件演示</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ChineseCard
                title="书法艺术"
                subtitle="Calligraphy Art"
                content="中国书法是汉字的书写艺术，被誉为无言的诗、无行的舞、无图的画、无声的乐。"
                variant="default"
              >
                <div className="flex space-x-2">
                  <ChineseButton variant="primary" size="sm">开始练习</ChineseButton>
                  <ChineseButton variant="outline" size="sm">了解历史</ChineseButton>
                </div>
              </ChineseCard>

              <ChineseCard
                title="茶道文化"
                subtitle="Tea Culture"
                content="茶道是一种以茶为媒的生活礼仪，也是修身养性的方式，通过沏茶、赏茶、闻茶、饮茶来增进友谊。"
                variant="elegant"
              >
                <div className="flex space-x-2">
                  <ChineseButton variant="secondary" size="sm">品茶体验</ChineseButton>
                  <ChineseButton variant="ghost" size="sm">茶具介绍</ChineseButton>
                </div>
              </ChineseCard>

              <ChineseCard
                title="古典音乐"
                subtitle="Classical Music"
                content="中国古典音乐历史悠久，以其独特的五声音阶和丰富的表现力，展现了深厚的文化内涵。"
                variant="minimal"
              >
                <div className="flex space-x-2">
                  <ChineseButton variant="primary" size="sm">聆听音乐</ChineseButton>
                  <ChineseButton variant="outline" size="sm">乐器介绍</ChineseButton>
                </div>
              </ChineseCard>

              <ChineseCard
                title="传统节日"
                subtitle="Traditional Festivals"
                content="中国传统节日承载着深厚的历史文化内涵，是中华民族悠久历史文化的重要组成部分。"
                variant="default"
              />

              <ChineseCard
                title="武术精神"
                subtitle="Martial Arts"
                content="中华武术不仅是一种体育运动，更是一种文化传承，体现了中华民族的智慧和精神。"
                variant="elegant"
              />

              <ChineseCard
                title="诗词歌赋"
                subtitle="Poetry & Literature"
                content="中国古典诗词是中华文化的瑰宝，以其精炼的语言和深远的意境，传承着千年的文化底蕴。"
                variant="minimal"
              />
            </div>
          </div>
        )}

        {/* Interactive Demo */}
        {selectedDemo === 'interactive' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 text-center chinese-text">交互体验演示</h2>
            
            <div className="bg-white rounded-2xl p-8 border-2 border-red-100 shadow-xl">
              <div className="text-center space-y-6">
                <h3 className="text-3xl font-bold text-gray-900 chinese-title">开启您的文化之旅</h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto chinese-text">
                  通过我们精心设计的课程和互动体验，深入了解中华文化的博大精深，感受传统与现代的完美融合。
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/enhanced-writing">
                    <ChineseButton variant="primary" size="lg">✍️ 汉字练习</ChineseButton>
                  </Link>
                  <Link href="/classics">
                    <ChineseButton variant="secondary" size="lg">📚 经典阅读</ChineseButton>
                  </Link>
                  <Link href="/pinyin-practice">
                    <ChineseButton variant="outline" size="lg">🎵 拼音学习</ChineseButton>
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChineseCard
                title="🎨 Magic UI 特色"
                subtitle="Magic UI Features"
                content="采用最新的 Magic UI 组件库，结合传统中华美学设计，提供现代化的用户体验。"
                variant="default"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-sm">流畅的动画效果</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span className="text-sm">传统文化色彩</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-sm">响应式设计</span>
                  </div>
                </div>
              </ChineseCard>

              <ChineseCard
                title="🚀 技术亮点"
                subtitle="Technical Highlights"
                content="基于 React、TypeScript 和 Tailwind CSS 构建，确保代码质量和用户体验。"
                variant="elegant"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm">TypeScript 类型安全</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm">组件化架构</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="text-sm">无障碍支持</span>
                  </div>
                </div>
              </ChineseCard>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 chinese-title">探索更多功能</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/">
              <ChineseButton variant="outline" size="lg">🏠 返回首页</ChineseButton>
            </Link>
            <Link href="/magic-ui">
              <ChineseButton variant="primary" size="lg">🎨 完整展示</ChineseButton>
            </Link>
            <Link href="/enhanced-writing">
              <ChineseButton variant="secondary" size="lg">✍️ 体验练习</ChineseButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
