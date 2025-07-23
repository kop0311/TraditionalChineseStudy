'use client'

import { useState, useEffect } from 'react'
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
      // Loop back to first character
      setCurrentCharacterIndex(0)
    }
  }

  const previousCharacter = () => {
    if (currentCharacterIndex > 0) {
      setCurrentCharacterIndex(prev => prev - 1)
    } else {
      // Loop to last character
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
      <div className="container py-5">
        <div className="text-center">
          <h1 className="chinese-title">拼音练习</h1>
          <p>没有找到符合条件的汉字</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="text-center mb-4">
        <h1 className="chinese-title display-4 mb-3">拼音练习</h1>
        <p className="lead">
          学习标准普通话发音，掌握声调变化
        </p>
      </div>

      {/* Category Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div className="mb-2 mb-md-0">
                  <h6 className="mb-0 chinese-text">选择分类:</h6>
                </div>
                <div className="btn-group flex-wrap" role="group">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`btn ${
                        selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'
                      } btn-chinese btn-sm`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
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
                  字符进度 ({currentCharacterIndex + 1}/{filteredCharacters.length})
                </h6>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-chinese"
                    onClick={previousCharacter}
                  >
                    ← 上一个
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-chinese"
                    onClick={nextCharacter}
                  >
                    下一个 →
                  </button>
                </div>
              </div>
              
              <div className="character-grid">
                <div className="d-flex flex-wrap gap-2">
                  {filteredCharacters.map((char, index) => {
                    const score = getCharacterScore(char.character)
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`btn ${
                          index === currentCharacterIndex ? 'btn-primary' : 
                          score !== null ? 'btn-success' : 'btn-outline-primary'
                        } character-selector position-relative`}
                        onClick={() => selectCharacter(index)}
                        style={{ minWidth: '60px', height: '60px' }}
                      >
                        <span className="chinese-text">{char.character}</span>
                        {score !== null && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning">
                            {score}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h6 className="chinese-text">当前字符信息</h6>
              <div className="row">
                <div className="col-md-6">
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
                        <td>声调:</td>
                        <td>{currentCharacter.tone}声</td>
                      </tr>
                      <tr>
                        <td>含义:</td>
                        <td>{currentCharacter.meaning}</td>
                      </tr>
                      <tr>
                        <td>分类:</td>
                        <td>{currentCharacter.category}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <div className="text-center">
                    <div className="hanzi-character mb-2" style={{ fontSize: '4rem' }}>
                      {currentCharacter.character}
                    </div>
                    <div className="pinyin-text fs-5">
                      {currentCharacter.pinyin} ({currentCharacter.tone}声)
                    </div>
                  </div>
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
                <div className="row">
                  <div className="col-6">
                    <div className="stat-item mb-2">
                      <div className="stat-value text-primary">{practiceHistory.length}</div>
                      <div className="stat-label">已练习</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="stat-item mb-2">
                      <div className="stat-value text-success">{getAverageScore()}</div>
                      <div className="stat-label">平均分</div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="stat-item">
                      <div className="stat-value text-info">{getTotalAttempts()}</div>
                      <div className="stat-label">总尝试次数</div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm btn-chinese w-100 mt-2"
                onClick={() => setShowStats(!showStats)}
              >
                {showStats ? '隐藏' : '显示'}详细统计
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pinyin Practice Component */}
      <div className="row">
        <div className="col-12">
          <PinyinPractice
            character={currentCharacter.character}
            pinyin={currentCharacter.pinyin}
            tone={currentCharacter.tone}
            onComplete={handlePracticeComplete}
          />
        </div>
      </div>

      {/* Detailed Statistics */}
      {showStats && practiceHistory.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0 chinese-text">详细练习记录</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>汉字</th>
                        <th>最高分</th>
                        <th>尝试次数</th>
                        <th>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {practiceHistory.map((record, index) => (
                        <tr key={index}>
                          <td className="chinese-text fs-5">{record.character}</td>
                          <td>
                            <span className={`badge ${
                              record.score >= 90 ? 'bg-success' :
                              record.score >= 70 ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {record.score}分
                            </span>
                          </td>
                          <td>{record.attempts}次</td>
                          <td>
                            {record.score >= 80 ? '✅ 掌握' : 
                             record.score >= 60 ? '⚠️ 需练习' : '❌ 待提高'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
