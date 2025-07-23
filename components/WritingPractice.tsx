'use client'

import { useState, useEffect } from 'react'
import HanziWriter from './HanziWriter'
import StrokeAnimator from './StrokeAnimator'

interface WritingPracticeProps {
  character: string
  pinyin?: string
  meaning?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  onComplete?: (score: number) => void
  className?: string
}

interface PracticeStats {
  attempts: number
  correctStrokes: number
  totalStrokes: number
  timeSpent: number
  hintsUsed: number
}

export default function WritingPractice({
  character,
  pinyin = '',
  meaning = '',
  difficulty = 'medium',
  onComplete,
  className = ''
}: WritingPracticeProps) {
  const [currentMode, setCurrentMode] = useState<'demo' | 'practice'>('demo')
  const [practiceStats, setPracticeStats] = useState<PracticeStats>({
    attempts: 0,
    correctStrokes: 0,
    totalStrokes: 0,
    timeSpent: 0,
    hintsUsed: 0
  })
  const [startTime, setStartTime] = useState<number | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    // Reset stats when character changes
    setPracticeStats({
      attempts: 0,
      correctStrokes: 0,
      totalStrokes: 0,
      timeSpent: 0,
      hintsUsed: 0
    })
    setIsCompleted(false)
    setShowStats(false)
    setStartTime(null)
  }, [character])

  const startPractice = () => {
    setCurrentMode('practice')
    setStartTime(Date.now())
    setPracticeStats(prev => ({
      ...prev,
      attempts: prev.attempts + 1
    }))
  }

  const handlePracticeComplete = () => {
    if (startTime) {
      const timeSpent = Date.now() - startTime
      setPracticeStats(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + timeSpent
      }))
    }
    
    setIsCompleted(true)
    setShowStats(true)
    
    // Calculate score based on performance
    const score = calculateScore()
    onComplete?.(score)
  }

  const calculateScore = (): number => {
    const { attempts, hintsUsed, timeSpent } = practiceStats
    
    let baseScore = 100
    
    // Deduct points for multiple attempts
    baseScore -= Math.max(0, (attempts - 1) * 15)
    
    // Deduct points for using hints
    baseScore -= hintsUsed * 10
    
    // Bonus for quick completion (under 30 seconds)
    if (timeSpent < 30000) {
      baseScore += 10
    }
    
    // Difficulty multiplier
    const difficultyMultiplier = {
      easy: 0.8,
      medium: 1.0,
      hard: 1.2
    }[difficulty]
    
    return Math.max(0, Math.round(baseScore * difficultyMultiplier))
  }

  const handleHintUsed = () => {
    setPracticeStats(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }))
  }

  const resetPractice = () => {
    setCurrentMode('demo')
    setIsCompleted(false)
    setShowStats(false)
    setStartTime(null)
    setPracticeStats({
      attempts: 0,
      correctStrokes: 0,
      totalStrokes: 0,
      timeSpent: 0,
      hintsUsed: 0
    })
  }

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    return `${seconds}秒`
  }

  return (
    <div className={`writing-practice-container ${className}`}>
      {/* Character Information */}
      <div className="character-info text-center mb-4">
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <div className="hanzi-character mb-2">{character}</div>
                {pinyin && (
                  <div className="pinyin-text mb-2">{pinyin}</div>
                )}
                {meaning && (
                  <div className="text-muted">{meaning}</div>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="practice-modes">
              <div className="btn-group mb-3" role="group">
                <button
                  type="button"
                  className={`btn ${currentMode === 'demo' ? 'btn-primary' : 'btn-outline-primary'} btn-chinese`}
                  onClick={() => setCurrentMode('demo')}
                >
                  笔画演示
                </button>
                <button
                  type="button"
                  className={`btn ${currentMode === 'practice' ? 'btn-success' : 'btn-outline-success'} btn-chinese`}
                  onClick={startPractice}
                  disabled={isCompleted}
                >
                  书写练习
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Area */}
      <div className="practice-area">
        {currentMode === 'demo' ? (
          <div className="demo-mode">
            <div className="text-center mb-3">
              <h5 className="chinese-text">笔画演示模式</h5>
              <p className="text-muted">观看正确的笔画顺序和书写方法</p>
            </div>
            <div className="d-flex justify-content-center">
              <StrokeAnimator
                character={character}
                width={300}
                height={300}
                speed={1}
                autoPlay={true}
                loop={true}
              />
            </div>
          </div>
        ) : (
          <div className="practice-mode">
            <div className="text-center mb-3">
              <h5 className="chinese-text">书写练习模式</h5>
              <p className="text-muted">按照正确的笔画顺序书写汉字</p>
              {practiceStats.attempts > 0 && (
                <div className="practice-info">
                  <span className="badge bg-info me-2">
                    第 {practiceStats.attempts} 次尝试
                  </span>
                  {practiceStats.hintsUsed > 0 && (
                    <span className="badge bg-warning">
                      使用了 {practiceStats.hintsUsed} 次提示
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="d-flex justify-content-center">
              <HanziWriter
                character={character}
                width={300}
                height={300}
                showOutline={false}
                showCharacter={false}
                onComplete={handlePracticeComplete}
              />
            </div>
          </div>
        )}
      </div>

      {/* Practice Statistics */}
      {showStats && isCompleted && (
        <div className="practice-stats mt-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0 chinese-text">练习统计</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-value text-primary">{calculateScore()}</div>
                    <div className="stat-label">得分</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-value text-info">{practiceStats.attempts}</div>
                    <div className="stat-label">尝试次数</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-value text-warning">{practiceStats.hintsUsed}</div>
                    <div className="stat-label">提示次数</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-value text-success">
                      {formatTime(practiceStats.timeSpent)}
                    </div>
                    <div className="stat-label">用时</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-primary btn-chinese me-3"
                  onClick={resetPractice}
                >
                  再练一次
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-chinese"
                  onClick={() => {
                    // This would typically load the next character
                    console.log('Load next character')
                  }}
                >
                  下一个字
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Indicator */}
      <div className="difficulty-indicator mt-3">
        <div className="d-flex align-items-center justify-content-center">
          <span className="me-2 chinese-text">难度:</span>
          <span className={`badge ${
            difficulty === 'easy' ? 'bg-success' : 
            difficulty === 'medium' ? 'bg-warning' : 'bg-danger'
          }`}>
            {difficulty === 'easy' ? '简单' : 
             difficulty === 'medium' ? '中等' : '困难'}
          </span>
        </div>
      </div>
    </div>
  )
}
