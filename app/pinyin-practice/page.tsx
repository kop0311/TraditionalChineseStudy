'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, BarChart3, Eye, EyeOff } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { StatsPanel } from '@/components/ui/StatsPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PinyinPractice from '../../components/PinyinPractice'

interface PinyinCharacter {
  character: string
  pinyin: string
  tone: number
  meaning: string
  category: string
}

// Sample characters for pinyin practice
const pinyinCharacters: PinyinCharacter[] = [
  { character: '妈', pinyin: 'ma', tone: 1, meaning: '母亲', category: '家庭' },
  { character: '麻', pinyin: 'ma', tone: 2, meaning: '麻烦', category: '日常' },
  { character: '马', pinyin: 'ma', tone: 3, meaning: '马匹', category: '动物' },
  { character: '骂', pinyin: 'ma', tone: 4, meaning: '责骂', category: '动作' },
  { character: '你', pinyin: 'ni', tone: 3, meaning: '你好', category: '称谓' },
  { character: '好', pinyin: 'hao', tone: 3, meaning: '好的', category: '形容词' },
  { character: '我', pinyin: 'wo', tone: 3, meaning: '我自己', category: '称谓' },
  { character: '他', pinyin: 'ta', tone: 1, meaning: '他人', category: '称谓' },
  { character: '她', pinyin: 'ta', tone: 1, meaning: '她', category: '称谓' },
  { character: '学', pinyin: 'xue', tone: 2, meaning: '学习', category: '教育' },
  { character: '习', pinyin: 'xi', tone: 2, meaning: '练习', category: '教育' },
  { character: '中', pinyin: 'zhong', tone: 1, meaning: '中间', category: '方位' },
  { character: '国', pinyin: 'guo', tone: 2, meaning: '国家', category: '地理' },
  { character: '人', pinyin: 'ren', tone: 2, meaning: '人类', category: '称谓' },
  { character: '大', pinyin: 'da', tone: 4, meaning: '大的', category: '形容词' }
]

const categories = ['全部', '家庭', '日常', '动物', '动作', '称谓', '形容词', '教育', '方位', '地理']

const categoryColors: Record<string, string> = {
  '全部': 'blue',
  '家庭': 'emerald',
  '日常': 'purple',
  '动物': 'amber',
  '动作': 'red',
  '称谓': 'blue',
  '形容词': 'emerald',
  '教育': 'purple',
  '方位': 'amber',
  '地理': 'red'
}

export default function PinyinPracticePage() {
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [filteredCharacters, setFilteredCharacters] = useState<PinyinCharacter[]>(pinyinCharacters)
  const [practiceHistory, setPracticeHistory] = useState<Array<{character: string, score: number, attempts: number}>>([])
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    if (selectedCategory === '全部') {
      setFilteredCharacters(pinyinCharacters)
    } else {
      setFilteredCharacters(pinyinCharacters.filter(char => char.category === selectedCategory))
    }
    setCurrentCharacterIndex(0)
  }, [selectedCategory])

  const currentCharacter = filteredCharacters[currentCharacterIndex]

  const handlePracticeComplete = (score: number) => {
    const existingRecord = practiceHistory.find(record => record.character === currentCharacter.character)
    
    if (existingRecord) {
      setPracticeHistory(prev => prev.map(record => 
        record.character === currentCharacter.character 
          ? { ...record, score: Math.max(record.score, score), attempts: record.attempts + 1 }
          : record
      ))
    } else {
      setPracticeHistory(prev => [...prev, { 
        character: currentCharacter.character, 
        score, 
        attempts: 1 
      }])
    }
  }

  const nextCharacter = () => {
    if (currentCharacterIndex < filteredCharacters.length - 1) {
      setCurrentCharacterIndex(prev => prev + 1)
    } else {
      setCurrentCharacterIndex(0)
    }
  }

  const previousCharacter = () => {
    if (currentCharacterIndex > 0) {
      setCurrentCharacterIndex(prev => prev - 1)
    } else {
      setCurrentCharacterIndex(filteredCharacters.length - 1)
    }
  }

  const selectCharacter = (index: number) => {
    setCurrentCharacterIndex(index)
  }

  const getAverageScore = () => {
    if (practiceHistory.length === 0) return 0
    const total = practiceHistory.reduce((sum, item) => sum + item.score, 0)
    return Math.round(total / practiceHistory.length)
  }

  const getTotalAttempts = () => {
    return practiceHistory.reduce((sum, item) => sum + item.attempts, 0)
  }

  const getCharacterScore = (character: string) => {
    const record = practiceHistory.find(record => record.character === character)
    return record ? record.score : null
  }

  if (!currentCharacter) {
    return (
      <PageLayout
        title="拼音练习"
        subtitle="学习标准普通话发音，掌握声调变化"
        description="没有找到符合条件的汉字，请选择其他分类"
        badge="发音训练平台"
      >
        <div className="text-center">
          <p className="text-gray-600">没有找到符合条件的汉字</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="拼音练习"
      subtitle="学习标准普通话发音，掌握声调变化"
      description="通过系统性的拼音练习，掌握准确的发音和声调变化"
      badge="发音训练平台"
    >
      {/* Category Filter */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">选择分类</CardTitle>
            <CardDescription>选择您想要练习的汉字分类</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`transition-all duration-200 ${
                    selectedCategory === category 
                      ? `bg-${categoryColors[category]}-600 hover:bg-${categoryColors[category]}-700 text-white` 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Character Navigation */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  字符导航 ({currentCharacterIndex + 1}/{filteredCharacters.length})
                </CardTitle>
                <CardDescription>选择要练习的汉字</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousCharacter}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一个
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextCharacter}
                  className="flex items-center gap-1"
                >
                  下一个
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filteredCharacters.map((char, index) => {
                const score = getCharacterScore(char.character)
                return (
                  <Button
                    key={index}
                    variant={index === currentCharacterIndex ? 'default' : score !== null ? 'secondary' : 'outline'}
                    className={`relative h-12 w-12 text-lg font-bold ${
                      index === currentCharacterIndex 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : score !== null
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectCharacter(index)}
                  >
                    {char.character}
                    {score !== null && (
                      <Badge className="absolute -top-2 -right-2 h-5 min-w-5 p-0 text-xs bg-amber-500">
                        {score}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Current Character Info & Practice Stats */}
      <div className="grid gap-8 lg:grid-cols-3 mb-8">
        {/* Current Character Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">当前字符信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">汉字:</span>
                    <span className="text-2xl font-bold text-gray-900">{currentCharacter.character}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">拼音:</span>
                    <span className="text-lg font-semibold text-blue-600">{currentCharacter.pinyin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">声调:</span>
                    <span className="font-medium">{currentCharacter.tone}声</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">含义:</span>
                    <span className="font-medium">{currentCharacter.meaning}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">分类:</span>
                    <Badge variant="outline">{currentCharacter.category}</Badge>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-8xl font-bold text-gray-800 mb-4">
                    {currentCharacter.character}
                  </div>
                  <div className="text-xl text-blue-600 font-semibold">
                    {currentCharacter.pinyin} ({currentCharacter.tone}声)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Practice Stats */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-gray-900">练习统计</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center gap-1"
                >
                  {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showStats ? '隐藏' : '显示'}详情
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{practiceHistory.length}</div>
                  <div className="text-sm text-gray-600">已练习</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{getAverageScore()}</div>
                  <div className="text-sm text-gray-600">平均分</div>
                </div>
                <div className="text-center col-span-2">
                  <div className="text-2xl font-bold text-purple-600">{getTotalAttempts()}</div>
                  <div className="text-sm text-gray-600">总尝试次数</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pinyin Practice Component */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mb-8"
      >
        <PinyinPractice
          character={currentCharacter.character}
          pinyin={currentCharacter.pinyin}
          tone={currentCharacter.tone}
          onComplete={handlePracticeComplete}
        />
      </motion.section>

      {/* Overall Stats */}
      <StatsPanel
        title="学习统计"
        subtitle="追踪您的拼音学习进度"
        stats={[
          {
            emoji: '📊',
            value: practiceHistory.length,
            label: '已练习字符',
            color: 'blue'
          },
          {
            emoji: '🎯',
            value: `${getAverageScore()}分`,
            label: '平均得分',
            color: 'emerald'
          },
          {
            emoji: '🔄',
            value: getTotalAttempts(),
            label: '总练习次数',
            color: 'purple'
          },
          {
            emoji: '📈',
            value: `${Math.round((practiceHistory.filter(h => h.score >= 80).length / (practiceHistory.length || 1)) * 100)}%`,
            label: '掌握率',
            color: 'amber'
          }
        ]}
        delay={1.0}
      />

      {/* Detailed Statistics */}
      {showStats && practiceHistory.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">详细练习记录</CardTitle>
              <CardDescription>查看每个字符的具体练习情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">汉字</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">最高分</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">尝试次数</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {practiceHistory.map((record, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-2xl font-bold">{record.character}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={
                              record.score >= 90 ? 'default' :
                              record.score >= 70 ? 'secondary' : 'destructive'
                            }
                            className={
                              record.score >= 90 ? 'bg-emerald-600 text-white' :
                              record.score >= 70 ? 'bg-amber-100 text-amber-700' : ''
                            }
                          >
                            {record.score}分
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{record.attempts}次</td>
                        <td className="py-3 px-4">
                          <span className="text-lg">
                            {record.score >= 80 ? '✅ 掌握' : 
                             record.score >= 60 ? '⚠️ 需练习' : '❌ 待提高'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}
    </PageLayout>
  )
}