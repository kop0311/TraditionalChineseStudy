'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, PenTool, BarChart3, Trophy, Target } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { StatsPanel } from '@/components/ui/StatsPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import WritingPractice from '../../components/WritingPractice'

interface Character {
  character: string
  pinyin: string
  meaning: string
  difficulty: 'easy' | 'medium' | 'hard'
  strokes: number
  radical: string
}

// Sample characters for practice
const practiceCharacters: Character[] = [
  { character: '人', pinyin: 'rén', meaning: '人类', difficulty: 'easy', strokes: 2, radical: '人' },
  { character: '大', pinyin: 'dà', meaning: '大的', difficulty: 'easy', strokes: 3, radical: '大' },
  { character: '小', pinyin: 'xiǎo', meaning: '小的', difficulty: 'easy', strokes: 3, radical: '小' },
  { character: '山', pinyin: 'shān', meaning: '山峰', difficulty: 'easy', strokes: 3, radical: '山' },
  { character: '水', pinyin: 'shuǐ', meaning: '水', difficulty: 'medium', strokes: 4, radical: '水' },
  { character: '火', pinyin: 'huǒ', meaning: '火', difficulty: 'medium', strokes: 4, radical: '火' },
  { character: '木', pinyin: 'mù', meaning: '木头', difficulty: 'medium', strokes: 4, radical: '木' },
  { character: '金', pinyin: 'jīn', meaning: '金属', difficulty: 'medium', strokes: 8, radical: '金' },
  { character: '学', pinyin: 'xué', meaning: '学习', difficulty: 'hard', strokes: 8, radical: '子' },
  { character: '书', pinyin: 'shū', meaning: '书本', difficulty: 'hard', strokes: 10, radical: '书' }
]

const difficultyColors = {
  easy: 'emerald',
  medium: 'amber', 
  hard: 'red'
} as const

const difficultyText = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
} as const

export default function WritingPracticePage() {
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0)
  const [practiceHistory, setPracticeHistory] = useState<Array<{character: string, score: number}>>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>(practiceCharacters)

  useEffect(() => {
    if (selectedDifficulty === 'all') {
      setFilteredCharacters(practiceCharacters)
    } else {
      setFilteredCharacters(practiceCharacters.filter(char => char.difficulty === selectedDifficulty))
    }
    setCurrentCharacterIndex(0)
  }, [selectedDifficulty])

  const currentCharacter = filteredCharacters[currentCharacterIndex]

  const handlePracticeComplete = (score: number) => {
    setPracticeHistory(prev => [...prev, { character: currentCharacter.character, score }])
  }

  const nextCharacter = () => {
    if (currentCharacterIndex < filteredCharacters.length - 1) {
      setCurrentCharacterIndex(prev => prev + 1)
    }
  }

  const previousCharacter = () => {
    if (currentCharacterIndex > 0) {
      setCurrentCharacterIndex(prev => prev - 1)
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

  const getDifficultyBadge = (difficulty: 'easy' | 'medium' | 'hard') => {
    return {
      text: difficultyText[difficulty],
      color: difficultyColors[difficulty],
      variant: 'outline' as const
    }
  }

  if (!currentCharacter) {
    return (
      <PageLayout
        title="汉字书写练习"
        subtitle="学习正确的笔画顺序和字形结构"
        description="没有找到符合条件的汉字，请选择其他难度级别"
        badge="书法练习平台"
      >
        <div className="text-center">
          <p className="text-gray-600">没有找到符合条件的汉字</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="汉字书写练习"
      subtitle="学习正确的笔画顺序和字形结构"
      description="通过交互式练习掌握汉字的正确书写方法，选择汉字开始您的书写练习之旅"
      badge="书法练习平台"
    >

      {/* Difficulty Filter */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">选择难度</CardTitle>
            <CardDescription>Difficulty Level - 选择适合您水平的练习难度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(['all', 'easy', 'medium', 'hard'] as const).map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`flex-1 min-w-[80px] ${
                    selectedDifficulty === difficulty 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {difficulty === 'all' ? '全部' : difficultyText[difficulty]}
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
                  字符选择 ({currentCharacterIndex + 1}/{filteredCharacters.length})
                </CardTitle>
                <CardDescription>选择要练习的汉字</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={previousCharacter}
                  disabled={currentCharacterIndex === 0}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一个
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextCharacter}
                  disabled={currentCharacterIndex === filteredCharacters.length - 1}
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
              {filteredCharacters.map((char, index) => (
                <Button
                  key={index}
                  variant={index === currentCharacterIndex ? 'default' : 'outline'}
                  className={`h-12 w-12 text-lg font-bold ${
                    index === currentCharacterIndex 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => selectCharacter(index)}
                >
                  {char.character}
                </Button>
              ))}
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
              <CardDescription>Current Character Details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">汉字:</span>
                    <span className="text-3xl font-bold text-gray-900">{currentCharacter.character}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">拼音:</span>
                    <span className="text-lg font-semibold text-blue-600">{currentCharacter.pinyin}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">含义:</span>
                    <span className="font-medium">{currentCharacter.meaning}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">笔画:</span>
                    <span className="font-medium">{currentCharacter.strokes} 画</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">部首:</span>
                    <span className="text-xl font-bold text-gray-900">{currentCharacter.radical}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">难度:</span>
                    <Badge 
                      variant="outline"
                      className={`bg-${difficultyColors[currentCharacter.difficulty]}-100 text-${difficultyColors[currentCharacter.difficulty]}-700 border-${difficultyColors[currentCharacter.difficulty]}-200`}
                    >
                      {difficultyText[currentCharacter.difficulty]}
                    </Badge>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-8xl font-bold text-gray-800 mb-4">
                    {currentCharacter.character}
                  </div>
                  <div className="text-xl text-blue-600 font-semibold">
                    {currentCharacter.pinyin}
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
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                练习统计
              </CardTitle>
              <CardDescription>Practice Statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{practiceHistory.length}</div>
                  <div className="text-sm text-gray-600">已练习</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{getAverageScore()}</div>
                  <div className="text-sm text-gray-600">平均分</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Writing Practice Component */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mb-8"
      >
        <WritingPractice
          character={currentCharacter.character}
          pinyin={currentCharacter.pinyin}
          meaning={currentCharacter.meaning}
          difficulty={currentCharacter.difficulty}
          onComplete={handlePracticeComplete}
        />
      </motion.section>

      {/* Overall Stats */}
      <StatsPanel
        title="学习成果"
        subtitle="Practice Achievement - 见证您的学习进步"
        stats={[
          {
            icon: <PenTool className="w-8 h-8" />,
            value: practiceHistory.length,
            label: '已练习字符',
            color: 'blue'
          },
          {
            icon: <Target className="w-8 h-8" />,
            value: `${getAverageScore()}分`,
            label: '平均得分',
            color: 'emerald'
          },
          {
            icon: <Trophy className="w-8 h-8" />,
            value: `${Math.round((practiceHistory.filter(h => h.score >= 80).length / (practiceHistory.length || 1)) * 100)}%`,
            label: '优秀率',
            color: 'amber'
          },
          {
            icon: <BarChart3 className="w-8 h-8" />,
            value: filteredCharacters.length,
            label: '可练习字符',
            color: 'purple'
          }
        ]}
        delay={1.0}
      />

      {/* Practice History */}
      {practiceHistory.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">练习记录</CardTitle>
              <CardDescription>最近练习的汉字 (最多显示10个)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {practiceHistory.slice(-10).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="text-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    <div className="text-2xl font-bold text-gray-900 mb-1">{item.character}</div>
                    <Badge 
                      variant={item.score >= 80 ? 'default' : item.score >= 60 ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {item.score}分
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}
    </PageLayout>
  )
}
