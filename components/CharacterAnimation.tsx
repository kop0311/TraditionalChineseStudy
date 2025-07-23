'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface CharacterAnimationProps {
  char: string;
  size?: number;
  showOutline?: boolean;
  showCharacter?: boolean;
  delayBetweenStrokes?: number;
  strokeAnimationSpeed?: number;
  className?: string;
}

interface AnimationControls {
  isPlaying: boolean;
  isPaused: boolean;
  currentStroke: number;
  totalStrokes: number;
}

export const CharacterAnimation: React.FC<CharacterAnimationProps> = ({
  char,
  size = 300,
  showOutline = true,
  showCharacter = false,
  delayBetweenStrokes = 1000,
  strokeAnimationSpeed = 1,
  className = '',
}) => {
  const writerRef = useRef<HTMLDivElement>(null);
  const hanziWriterRef = useRef<any>(null);
  const [controls, setControls] = useState<AnimationControls>({
    isPlaying: false,
    isPaused: false,
    currentStroke: 0,
    totalStrokes: 0,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize HanziWriter
  useEffect(() => {
    if (!writerRef.current || !char) return;

    setIsLoading(true);
    setError(null);

    try {
      // Clear previous writer
      if (hanziWriterRef.current) {
        hanziWriterRef.current = null;
      }
      writerRef.current.innerHTML = '';

      // Create new HanziWriter instance
      const writer = HanziWriter.create(writerRef.current, char, {
        width: size,
        height: size,
        padding: 20,
        showOutline,
        showCharacter,
        strokeAnimationSpeed: strokeAnimationSpeed * 1000,
        delayBetweenStrokes,
        strokeColor: 'var(--primary-color, #E53E3E)',
        outlineColor: 'var(--border-light, #E2E8F0)',
        highlightColor: 'var(--accent-color, #FFD700)',
        drawingColor: 'var(--secondary-color, #00A86B)',
        radicalColor: 'var(--info-color, #8B5A96)',
      });

      hanziWriterRef.current = writer;

      // Set up event listeners
      writer.target.addEventListener('loadingstart', () => {
        setIsLoading(true);
      });

      writer.target.addEventListener('loadingcomplete', () => {
        setIsLoading(false);
        setControls(prev => ({
          ...prev,
          totalStrokes: writer.getCharacterData()?.strokes?.length || 0,
        }));
      });

      writer.target.addEventListener('loadingerror', () => {
        setIsLoading(false);
        setError(`无法加载汉字 "${char}" 的笔画数据`);
      });

      writer.target.addEventListener('animationbegin', () => {
        setControls(prev => ({ ...prev, isPlaying: true, isPaused: false }));
      });

      writer.target.addEventListener('animationend', () => {
        setControls(prev => ({ 
          ...prev, 
          isPlaying: false, 
          isPaused: false,
          currentStroke: prev.totalStrokes 
        }));
      });

      writer.target.addEventListener('strokeanimationend', (event: any) => {
        setControls(prev => ({ 
          ...prev, 
          currentStroke: event.detail.strokeNum + 1 
        }));
      });

    } catch (err) {
      setIsLoading(false);
      setError(`初始化汉字 "${char}" 失败`);
      console.error('HanziWriter initialization error:', err);
    }

    return () => {
      if (hanziWriterRef.current) {
        hanziWriterRef.current = null;
      }
    };
  }, [char, size, showOutline, showCharacter, delayBetweenStrokes, strokeAnimationSpeed]);

  // Play animation
  const handlePlay = useCallback(() => {
    if (!hanziWriterRef.current) return;

    try {
      if (controls.isPaused) {
        hanziWriterRef.current.resumeAnimation();
      } else {
        hanziWriterRef.current.animateCharacter();
      }

      // Play pronunciation if sound is enabled
      if (soundEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(char);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Animation play error:', err);
    }
  }, [controls.isPaused, soundEnabled, char]);

  // Pause animation
  const handlePause = useCallback(() => {
    if (!hanziWriterRef.current) return;

    try {
      hanziWriterRef.current.pauseAnimation();
      setControls(prev => ({ ...prev, isPaused: true, isPlaying: false }));
    } catch (err) {
      console.error('Animation pause error:', err);
    }
  }, []);

  // Reset animation
  const handleReset = useCallback(() => {
    if (!hanziWriterRef.current) return;

    try {
      hanziWriterRef.current.cancelAnimation();
      hanziWriterRef.current.hideCharacter();
      setControls(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isPaused: false, 
        currentStroke: 0 
      }));
    } catch (err) {
      console.error('Animation reset error:', err);
    }
  }, []);

  // Toggle sound
  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  if (error) {
    return (
      <div className={`character-animation-error ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-red-600 chinese-text">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-chinese btn-outline btn-sm mt-4"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`character-animation-container ${className}`}>
      {/* Character display area */}
      <div className="character-animation-display">
        <div 
          ref={writerRef}
          className="hanzi-writer-svg"
          style={{ 
            width: size, 
            height: size,
            margin: '0 auto',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-color)',
          }}
        />
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner animate-pulse">
              <div className="hanzi-display text-gradient">
                {char}
              </div>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                加载笔画数据...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="character-animation-controls mt-6">
        <div className="flex justify-center items-center gap-4 mb-4">
          {!controls.isPlaying ? (
            <button
              onClick={handlePlay}
              disabled={isLoading}
              className="btn-chinese btn-primary btn-sm"
              title="播放动画"
            >
              <Play className="w-4 h-4 mr-2" />
              {controls.isPaused ? '继续' : '播放'}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="btn-chinese btn-secondary btn-sm"
              title="暂停动画"
            >
              <Pause className="w-4 h-4 mr-2" />
              暂停
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={isLoading}
            className="btn-chinese btn-outline btn-sm"
            title="重置动画"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </button>

          <button
            onClick={handleToggleSound}
            className="btn-chinese btn-ghost btn-sm"
            title={soundEnabled ? '关闭声音' : '开启声音'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Progress indicator */}
        {controls.totalStrokes > 0 && (
          <div className="progress-indicator">
            <div className="flex justify-between text-sm mb-2 chinese-text">
              <span>笔画进度</span>
              <span>{controls.currentStroke} / {controls.totalStrokes}</span>
            </div>
            <div className="stroke-progress">
              <div 
                className="stroke-progress-bar"
                style={{ 
                  width: `${(controls.currentStroke / controls.totalStrokes) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Character info */}
        <div className="character-info mt-4 text-center">
          <div className="hanzi-display text-gradient mb-2" style={{ fontSize: '2rem' }}>
            {char}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            点击播放按钮观看笔画顺序
          </p>
        </div>
      </div>
    </div>
  );
};

export default CharacterAnimation;
