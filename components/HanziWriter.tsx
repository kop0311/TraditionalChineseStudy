'use client'

import { useEffect, useRef, useState } from 'react'

interface HanziWriterProps {
  character: string
  width?: number
  height?: number
  showOutline?: boolean
  showCharacter?: boolean
  onComplete?: () => void
  className?: string
}

declare global {
  interface Window {
    HanziWriter?: any
  }
}

export default function HanziWriter({
  character,
  width = 300,
  height = 300,
  showOutline = true,
  showCharacter = false,
  onComplete,
  className = ''
}: HanziWriterProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const writerRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isWriting, setIsWriting] = useState(false)

  useEffect(() => {
    const loadHanziWriter = async () => {
      // Check if HanziWriter is already loaded
      if (typeof window !== 'undefined' && (window as any).HanziWriter) {
        setIsLoaded(true)
        return
      }

      // Load HanziWriter script
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

    // Create new HanziWriter instance
    writerRef.current = (window as any).HanziWriter.create(svgRef.current, character, {
      width,
      height,
      padding: 20,
      showOutline,
      showCharacter,
      strokeAnimationSpeed: 1,
      strokeHighlightSpeed: 2,
      delayBetweenStrokes: 300,
      strokeColor: '#555',
      radicalColor: '#168F16',
      highlightColor: '#AAF',
      outlineColor: '#DDD',
      drawingColor: '#333',
      onComplete: () => {
        setIsWriting(false)
        onComplete?.()
      },
      onCorrectStroke: () => {
        // Provide haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      },
      onMistake: () => {
        // Provide error feedback
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }
      }
    })

    return () => {
      if (writerRef.current) {
        writerRef.current.cancelQuiz()
      }
    }
  }, [isLoaded, character, width, height, showOutline, showCharacter, onComplete])

  const startAnimation = () => {
    if (writerRef.current) {
      writerRef.current.animateCharacter()
    }
  }

  const startQuiz = () => {
    if (writerRef.current) {
      setIsWriting(true)
      writerRef.current.quiz({
        onComplete: () => {
          setIsWriting(false)
          onComplete?.()
        },
        onMistake: (strokeData: any) => {
          console.log('Mistake on stroke:', strokeData)
        }
      })
    }
  }

  const showHints = () => {
    if (writerRef.current) {
      writerRef.current.showOutline()
    }
  }

  const reset = () => {
    if (writerRef.current) {
      writerRef.current.cancelQuiz()
      setIsWriting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className={`hanzi-writer-container ${className}`}>
        <div className="loading">
          <div className="spinner"></div>
          <p>加载汉字书写组件...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`hanzi-writer-container ${className}`}>
      <div className="stroke-animation-container">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ border: '2px solid #0d6efd', borderRadius: '0.5rem' }}
        />
      </div>
      
      <div className="hanzi-controls mt-3">
        <div className="btn-group" role="group">
          <button
            type="button"
            className="btn btn-primary btn-chinese"
            onClick={startAnimation}
            disabled={isWriting}
          >
            演示笔画
          </button>
          <button
            type="button"
            className="btn btn-success btn-chinese"
            onClick={startQuiz}
            disabled={isWriting}
          >
            开始练习
          </button>
          <button
            type="button"
            className="btn btn-warning btn-chinese"
            onClick={showHints}
            disabled={!isWriting}
          >
            显示提示
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-chinese"
            onClick={reset}
          >
            重新开始
          </button>
        </div>
      </div>

      {isWriting && (
        <div className="mt-3">
          <div className="alert alert-info">
            <strong>练习提示：</strong> 请按照正确的笔画顺序书写汉字 "{character}"
          </div>
        </div>
      )}
    </div>
  )
}
