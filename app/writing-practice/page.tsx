'use client'

import { useState, useEffect } from 'react'
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'danger'
      default: return 'secondary'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '困难'
      default: return '未知'
    }
  }

  if (!currentCharacter) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h1 className="chinese-title">汉字练习</h1>
          <p>没有找到符合条件的汉字</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="text-center mb-4">
        <h1 className="chinese-title display-4 mb-3 animate-fade-in">汉字书写练习</h1>
        <p className="lead chinese-calligraphy">
          通过交互式练习掌握汉字的正确书写方法
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          选择汉字开始您的书写练习之旅
        </p>
      </div>

      {/* Difficulty Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card-chinese card-practice">
            <div className="card-chinese-header">
              <h6 className="card-chinese-title">选择难度</h6>
              <p className="card-chinese-subtitle">Difficulty Level</p>
            </div>
            <div className="card-chinese-body">
              <div className="d-flex gap-2 flex-wrap">
                {(['all', 'easy', 'medium', 'hard'] as const).map((difficulty) => (
                  <button
                    key={difficulty}
                    type="button"
                    className={`btn-chinese ${
                      selectedDifficulty === difficulty ? 'btn-primary' : 'btn-ghost'
                    } flex-fill`}
                    onClick={() => setSelectedDifficulty(difficulty)}
                  >
                    {difficulty === 'all' ? '全部' : getDifficultyText(difficulty)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Character Navigation */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 chinese-text">
                  字符选择 ({currentCharacterIndex + 1}/{filteredCharacters.length})
                </h6>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={previousCharacter}
                    disabled={currentCharacterIndex === 0}
                  >
                    ← 上一个
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={nextCharacter}
                    disabled={currentCharacterIndex === filteredCharacters.length - 1}
                  >
                    下一个 →
                  </button>
                </div>
              </div>
              
              <div className="character-grid">
                <div className="d-flex flex-wrap gap-2">
                  {filteredCharacters.map((char, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`btn ${
                        index === currentCharacterIndex ? 'btn-primary' : 'btn-outline-primary'
                      } character-selector`}
                      onClick={() => selectCharacter(index)}
                      style={{ minWidth: '50px', height: '50px' }}
                    >
                      <span className="chinese-text">{char.character}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Character Info */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="chinese-text">字符信息</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td>汉字:</td>
                        <td><strong className="chinese-text fs-4">{currentCharacter.character}</strong></td>
                      </tr>
                      <tr>
                        <td>拼音:</td>
                        <td><span className="pinyin-text">{currentCharacter.pinyin}</span></td>
                      </tr>
                      <tr>
                        <td>含义:</td>
                        <td>{currentCharacter.meaning}</td>
                      </tr>
                      <tr>
                        <td>笔画:</td>
                        <td>{currentCharacter.strokes} 画</td>
                      </tr>
                      <tr>
                        <td>部首:</td>
                        <td className="chinese-text">{currentCharacter.radical}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h6 className="chinese-text">难度等级</h6>
                  <span className={`badge bg-${getDifficultyColor(currentCharacter.difficulty)} fs-6`}>
                    {getDifficultyText(currentCharacter.difficulty)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="chinese-text">练习统计</h6>
              <div className="text-center">
                <div className="stat-item mb-2">
                  <div className="stat-value text-primary">{practiceHistory.length}</div>
                  <div className="stat-label">已练习</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value text-success">{getAverageScore()}</div>
                  <div className="stat-label">平均分</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Writing Practice Component */}
      <div className="row">
        <div className="col-12">
          <WritingPractice
            character={currentCharacter.character}
            pinyin={currentCharacter.pinyin}
            meaning={currentCharacter.meaning}
            difficulty={currentCharacter.difficulty}
            onComplete={handlePracticeComplete}
          />
        </div>
      </div>

      {/* Practice History */}
      {practiceHistory.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0 chinese-text">练习记录</h5>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {practiceHistory.slice(-10).map((item, index) => (
                    <div key={index} className="practice-record">
                      <div className="text-center p-2 border rounded">
                        <div className="chinese-text fs-5">{item.character}</div>
                        <div className="small text-muted">{item.score}分</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
