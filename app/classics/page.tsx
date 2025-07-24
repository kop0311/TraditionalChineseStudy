'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, PenTool, Music, Users, Award, TrendingUp, Clock } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { FeatureCard } from '@/components/ui/FeatureCard'
import { StatsPanel } from '@/components/ui/StatsPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Classic {
  id: string
  title: string
  description: string
  chapters: number
  difficulty: 'easy' | 'medium' | 'hard'
  subtitle: string
  emoji: string
}

const classics: Classic[] = [
  {
    id: 'sanzijing',
    title: '三字经',
    subtitle: 'Three Character Classic',
    description: '中国传统启蒙教材，以三字一句的韵文形式，教授儿童基本的道德观念、历史知识和文化常识。',
    chapters: 12,
    difficulty: 'easy',
    emoji: '📖'
  },
  {
    id: 'dizigui',
    title: '弟子规',
    subtitle: 'Rules for Students',
    description: '清朝李毓秀所作，以《论语》中"弟子入则孝，出则悌"为总纲，教导儿童如何做人做事。',
    chapters: 8,
    difficulty: 'medium',
    emoji: '📜'
  },
  {
    id: 'daodejing',
    title: '道德经',
    subtitle: 'Tao Te Ching',
    description: '老子所著，中国古代哲学经典，阐述了道家思想的核心理念，适合有一定基础的学习者。',
    chapters: 81,
    difficulty: 'hard',
    emoji: '🏛️'
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

const learningTips = [
  {
    emoji: '📚',
    title: '循序渐进',
    description: '建议从《三字经》开始，逐步提高难度，打好基础后再学习更深层次的经典。'
  },
  {
    emoji: '🎵',
    title: '朗读背诵',
    description: '经典文本都有韵律美，建议大声朗读，在朗读中感受文字的音韵之美。'
  },
  {
    emoji: '✍️',
    title: '书写练习',
    description: '结合汉字书写练习，在书写中加深对文字和内容的理解与记忆。'
  }
]

export default function ClassicsPage() {
  return (
    <PageLayout
      title="经典阅读"
      subtitle="探索中华文化的瑰宝，在经典中汲取智慧"
      description="选择一部经典开始您的学习之旅，感受传统文化的博大精深"
      badge="传统文化学习"
    >
      {/* Classics Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
        {classics.map((classic, index) => (
          <FeatureCard
            key={classic.id}
            title={classic.title}
            subtitle={classic.subtitle}
            description={classic.description}
            emoji={classic.emoji}
            badge={getDifficultyBadge(classic.difficulty)}
            stats={[
              { value: classic.chapters, label: '章节', color: 'blue' }
            ]}
            actions={[
              {
                text: '开始阅读',
                href: `/classics/${classic.id}`,
                variant: 'default',
                icon: <BookOpen className="w-5 h-5" />,
                color: 'blue'
              },
              {
                text: '练字',
                href: `/writing-practice?classic=${classic.id}`,
                variant: 'secondary',
                icon: <PenTool className="w-4 h-4" />
              },
              {
                text: '拼音',
                href: `/pinyin-practice?classic=${classic.id}`,
                variant: 'secondary',
                icon: <Music className="w-4 h-4" />
              }
            ]}
            delay={index * 0.2}
          />
        ))}
      </div>

      {/* Learning Tips Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">学习建议</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            掌握正确的学习方法，让经典学习事半功倍
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {learningTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="h-full bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{tip.emoji}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{tip.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{tip.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Progress Overview */}
      <StatsPanel
        title="学习成果"
        subtitle="数字见证学习的力量，每一步都是成长的足迹"
        stats={[
          {
            emoji: '📖',
            value: '3',
            label: '经典文本',
            color: 'blue'
          },
          {
            emoji: '✍️',
            value: '1000+',
            label: '常用汉字',
            color: 'emerald'
          },
          {
            emoji: '🎵',
            value: '400+',
            label: '拼音组合',
            color: 'purple'
          },
          {
            emoji: '∞',
            value: '∞',
            label: '学习乐趣',
            color: 'amber'
          }
        ]}
        delay={0.4}
      />

      {/* Personal Progress (Mock Data) */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-16"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              个人学习进度
            </CardTitle>
            <CardDescription className="text-lg text-gray-700">
              您的整体学习进度概览
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <BookOpen className="w-6 h-6" />, value: '156', label: '已学汉字', color: 'emerald' },
                { icon: <Award className="w-6 h-6" />, value: '23', label: '已读章节', color: 'blue' },
                { icon: <TrendingUp className="w-6 h-6" />, value: '89', label: '练习次数', color: 'purple' },
                { icon: <Clock className="w-6 h-6" />, value: '12', label: '学习天数', color: 'amber' }
              ].map((stat, index) => {
                const colors = {
                  emerald: 'text-emerald-600 bg-emerald-100',
                  blue: 'text-blue-600 bg-blue-100',
                  purple: 'text-purple-600 bg-purple-100',
                  amber: 'text-amber-600 bg-amber-100'
                }[stat.color as keyof typeof colors]

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 + (index * 0.1) }}
                    className="text-center group"
                  >
                    <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${colors} transition-all duration-300 group-hover:scale-110`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">整体进度</span>
                <span className="text-sm text-gray-500">25%</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 shadow-inner">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  whileInView={{ width: '25%' }}
                  transition={{ duration: 1.5, delay: 1.2 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </PageLayout>
  )
}