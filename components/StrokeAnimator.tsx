'use client'

import { useEffect, useRef, useState } from 'react'

interface StrokeAnimatorProps {
  character: string
  width?: number
  height?: number
  speed?: number
  autoPlay?: boolean
  loop?: boolean
  onAnimationComplete?: () => void
  className?: string
}

export default function StrokeAnimator({
  character,
  width = 250,
  height = 250,
  speed = 1,
  autoPlay = false,
  loop = false,
  onAnimationComplete,
  className = ''
}: StrokeAnimatorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const writerRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStroke, setCurrentStroke] = useState(0)
  const [totalStrokes, setTotalStrokes] = useState(0)

  useEffect(() => {
    const loadHanziWriter = async () => {
      if (typeof window !== 'undefined' && (window as any).HanziWriter) {
        setIsLoaded(true)
        return
      }

      if (typeof document !== 'undefined') {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js'
        script.onload = () => setIsLoaded(true)
        script.onerror = () => console.error('Failed to load HanziWriter')
        document.head.appendChild(script)
      }
    }

    loadHanziWriter()
  }, [])

  useEffect(() => {
    if (!isLoaded || !svgRef.current || !character) return

    // Clean up previous writer
    if (writerRef.current) {
      writerRef.current.cancelQuiz()
    }

    // Create new HanziWriter instance for animation
    writerRef.current = (window as any).HanziWriter.create(svgRef.current, character, {
      width,
      height,
      padding: 15,
      showOutline: false,
      showCharacter: false,
      strokeAnimationSpeed: speed,
      strokeHighlightSpeed: speed * 2,
      delayBetweenStrokes: 500 / speed,
      strokeColor: '#2563eb',
      radicalColor: '#dc2626',
      highlightColor: '#3b82f6',
      outlineColor: '#e5e7eb',
      onLoadCharDataSuccess: (data: any) => {
        setTotalStrokes(data.strokes.length)
      },
      onComplete: () => {
        setIsAnimating(false)
        setCurrentStroke(0)
        onAnimationComplete?.()
        
        if (loop) {
          setTimeout(() => {
            startAnimation()
          }, 1000)
        }
      }
    })

    if (autoPlay) {
      setTimeout(() => startAnimation(), 500)
    }

    return () => {
      if (writerRef.current) {
        writerRef.current.cancelQuiz()
      }
    }
  }, [isLoaded, character, width, height, speed, autoPlay, loop, onAnimationComplete])

  const startAnimation = () => {
    if (writerRef.current && !isAnimating) {
      setIsAnimating(true)
      setCurrentStroke(0)
      writerRef.current.animateCharacter({
        onComplete: () => {
          setIsAnimating(false)
          setCurrentStroke(0)
          onAnimationComplete?.()
        }
      })
    }
  }

  const pauseAnimation = () => {
    if (writerRef.current) {
      writerRef.current.pauseAnimation()
      setIsAnimating(false)
    }
  }

  const resumeAnimation = () => {
    if (writerRef.current) {
      writerRef.current.resumeAnimation()
      setIsAnimating(true)
    }
  }

  const resetAnimation = () => {
    if (writerRef.current) {
      writerRef.current.cancelQuiz()
      setIsAnimating(false)
      setCurrentStroke(0)
    }
  }

  const animateStroke = (strokeIndex: number) => {
    if (writerRef.current && strokeIndex >= 0 && strokeIndex < totalStrokes) {
      writerRef.current.animateStroke(strokeIndex)
      setCurrentStroke(strokeIndex + 1)
    }
  }

  if (!isLoaded) {
    return (
      <div className={`stroke-animator-container ${className}`}>
        <div className="loading">
          <div className="spinner"></div>
          <p>加载笔画动画...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`stroke-animator-container ${className}`}>
      <div className="animation-display">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ 
            border: '1px solid #d1d5db', 
            borderRadius: '0.375rem',
            background: '#ffffff'
          }}
        />
      </div>

      <div className="animation-info mt-2">
        <div className="d-flex justify-content-between align-items-center">
          <span className="chinese-text">
            汉字: <strong>{character}</strong>
          </span>
          <span className="text-muted">
            笔画: {currentStroke}/{totalStrokes}
          </span>
        </div>
        
        {totalStrokes > 0 && (
          <div className="progress mt-2">
            <div
              className="progress-bar progress-bar-chinese"
              role="progressbar"
              style={{ width: `${(currentStroke / totalStrokes) * 100}%` }}
              aria-valuenow={currentStroke}
              aria-valuemin={0}
              aria-valuemax={totalStrokes}
            />
          </div>
        )}
      </div>

      <div className="animation-controls mt-3">
        <div className="btn-group" role="group">
          <button
            type="button"
            className="btn btn-primary btn-sm btn-chinese"
            onClick={startAnimation}
            disabled={isAnimating}
          >
            {isAnimating ? '播放中...' : '开始动画'}
          </button>
          <button
            type="button"
            className="btn btn-warning btn-sm btn-chinese"
            onClick={isAnimating ? pauseAnimation : resumeAnimation}
          >
            {isAnimating ? '暂停' : '继续'}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm btn-chinese"
            onClick={resetAnimation}
          >
            重置
          </button>
        </div>
      </div>

      {/* Individual stroke controls */}
      {totalStrokes > 0 && (
        <div className="stroke-controls mt-3">
          <p className="small text-muted mb-2">单独播放笔画:</p>
          <div className="d-flex flex-wrap gap-1">
            {Array.from({ length: totalStrokes }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`btn btn-outline-primary btn-sm ${
                  currentStroke > i ? 'active' : ''
                }`}
                onClick={() => animateStroke(i)}
                disabled={isAnimating}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
