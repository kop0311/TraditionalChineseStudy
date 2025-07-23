'use client'

import { useState, useEffect, useRef } from 'react'

interface PinyinPracticeProps {
  character: string
  pinyin: string
  tone: number
  onComplete?: (score: number) => void
  className?: string
}

interface ToneMarks {
  [key: string]: string[]
}

const toneMarks: ToneMarks = {
  'a': ['a', 'ā', 'á', 'ǎ', 'à'],
  'o': ['o', 'ō', 'ó', 'ǒ', 'ò'],
  'e': ['e', 'ē', 'é', 'ě', 'è'],
  'i': ['i', 'ī', 'í', 'ǐ', 'ì'],
  'u': ['u', 'ū', 'ú', 'ǔ', 'ù'],
  'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
  'v': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ']
}

export default function PinyinPractice({
  character,
  pinyin,
  tone,
  onComplete,
  className = ''
}: PinyinPracticeProps) {
  const [userInput, setUserInput] = useState('')
  const [selectedTone, setSelectedTone] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const correctPinyinWithTone = addToneMarks(pinyin, tone)

  function addToneMarks(pinyinText: string, toneNumber: number): string {
    if (toneNumber === 0 || toneNumber > 4) return pinyinText

    // Find the vowel to add tone mark to
    const vowelPriority = ['a', 'o', 'e', 'i', 'u', 'ü', 'v']
    
    for (const vowel of vowelPriority) {
      if (pinyinText.includes(vowel)) {
        const toneVowel = toneMarks[vowel]?.[toneNumber] || vowel
        return pinyinText.replace(vowel, toneVowel)
      }
    }
    
    return pinyinText
  }

  const playAudio = async () => {
    setIsPlaying(true)
    
    // Use Web Speech API for pronunciation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(character)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.8
      utterance.pitch = 1.0
      
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      
      speechSynthesis.speak(utterance)
    } else {
      // Fallback: try to use audio element with TTS service
      try {
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encodeURIComponent(character)}`
        if (audioRef.current) {
          audioRef.current.src = audioUrl
          await audioRef.current.play()
        }
      } catch (error) {
        console.error('Audio playback failed:', error)
      } finally {
        setIsPlaying(false)
      }
    }
  }

  const checkAnswer = () => {
    const userPinyinWithTone = selectedTone ? addToneMarks(userInput.toLowerCase(), selectedTone) : userInput.toLowerCase()
    const correct = userPinyinWithTone === correctPinyinWithTone.toLowerCase()
    
    setIsCorrect(correct)
    setShowResult(true)
    setAttempts(prev => prev + 1)
    
    if (correct) {
      const currentScore = Math.max(0, 100 - (attempts * 10))
      setScore(currentScore)
      onComplete?.(currentScore)
    }
  }

  const reset = () => {
    setUserInput('')
    setSelectedTone(null)
    setShowResult(false)
    setIsCorrect(false)
    setAttempts(0)
    setScore(0)
  }

  const nextPractice = () => {
    reset()
    // This would typically trigger loading the next character
  }

  return (
    <div className={`pinyin-practice-container ${className}`}>
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      <div className="practice-header text-center mb-4">
        <div className="hanzi-character mb-3">{character}</div>
        <button
          type="button"
          className="btn btn-outline-primary btn-chinese"
          onClick={playAudio}
          disabled={isPlaying}
        >
          {isPlaying ? '播放中...' : '🔊 听发音'}
        </button>
      </div>

      <div className="practice-input mb-4">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="pinyin-input" className="form-label chinese-text">
              请输入拼音 (不含声调):
            </label>
            <input
              id="pinyin-input"
              type="text"
              className="form-control"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="例如: ni, hao"
              disabled={showResult && isCorrect}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label chinese-text">选择声调:</label>
            <div className="btn-group d-flex" role="group">
              {[1, 2, 3, 4].map((toneNum) => (
                <button
                  key={toneNum}
                  type="button"
                  className={`btn ${
                    selectedTone === toneNum ? 'btn-primary' : 'btn-outline-primary'
                  } flex-fill`}
                  onClick={() => setSelectedTone(toneNum)}
                  disabled={showResult && isCorrect}
                >
                  {toneNum}声
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="practice-preview mb-3">
        <div className="card">
          <div className="card-body">
            <h6 className="card-title chinese-text">预览:</h6>
            <p className="card-text">
              {userInput && selectedTone ? (
                <span className="pinyin-text fs-4">
                  {addToneMarks(userInput, selectedTone)}
                </span>
              ) : (
                <span className="text-muted">请输入拼音并选择声调</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {!showResult ? (
        <div className="practice-actions text-center">
          <button
            type="button"
            className="btn btn-success btn-lg btn-chinese me-3"
            onClick={checkAnswer}
            disabled={!userInput || !selectedTone}
          >
            检查答案
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-chinese"
            onClick={reset}
          >
            重新开始
          </button>
        </div>
      ) : (
        <div className="practice-result">
          <div className={`alert ${isCorrect ? 'alert-success' : 'alert-danger'}`}>
            <div className="d-flex align-items-center">
              <div className="me-3">
                {isCorrect ? '✅' : '❌'}
              </div>
              <div className="flex-grow-1">
                <h5 className="alert-heading chinese-text">
                  {isCorrect ? '回答正确！' : '回答错误'}
                </h5>
                <p className="mb-2">
                  正确答案: <strong className="pinyin-text">{correctPinyinWithTone}</strong>
                </p>
                {isCorrect && (
                  <p className="mb-0">
                    得分: <strong>{score}</strong> 分 (尝试次数: {attempts})
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            {isCorrect ? (
              <button
                type="button"
                className="btn btn-primary btn-lg btn-chinese me-3"
                onClick={nextPractice}
              >
                下一个练习
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-warning btn-lg btn-chinese me-3"
                onClick={() => setShowResult(false)}
              >
                再试一次
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-chinese"
              onClick={reset}
            >
              重新开始
            </button>
          </div>
        </div>
      )}

      {/* Tone reference */}
      <div className="tone-reference mt-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0 chinese-text">声调参考</h6>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-3">
                <div className="tone-example">
                  <div className="tone-mark">ˉ</div>
                  <div className="tone-name">一声</div>
                  <div className="tone-desc">高平</div>
                </div>
              </div>
              <div className="col-3">
                <div className="tone-example">
                  <div className="tone-mark">ˊ</div>
                  <div className="tone-name">二声</div>
                  <div className="tone-desc">上升</div>
                </div>
              </div>
              <div className="col-3">
                <div className="tone-example">
                  <div className="tone-mark">ˇ</div>
                  <div className="tone-name">三声</div>
                  <div className="tone-desc">下降上升</div>
                </div>
              </div>
              <div className="col-3">
                <div className="tone-example">
                  <div className="tone-mark">ˋ</div>
                  <div className="tone-name">四声</div>
                  <div className="tone-desc">下降</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
