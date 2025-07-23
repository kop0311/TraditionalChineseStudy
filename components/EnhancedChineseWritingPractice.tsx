"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Volume2, VolumeX, BookOpen, PenTool, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LinesPatternCardProps {
  children: React.ReactNode;
  className?: string;
  patternClassName?: string;
  gradientClassName?: string;
}

function LinesPatternCard({ 
  children, 
  className,
  patternClassName,
  gradientClassName
}: LinesPatternCardProps) {
  return (
    <motion.div
      className={cn(
        "border w-full rounded-md overflow-hidden",
        "bg-background",
        "border-border",
        "p-3",
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        background: 'var(--surface-color)',
        borderColor: 'var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <div className={cn(
        "size-full bg-repeat bg-[length:30px_30px]",
        "cultural-pattern",
        patternClassName
      )}>
        <div className={cn(
          "size-full bg-gradient-to-tr",
          "from-background/90 via-background/40 to-background/10",
          gradientClassName
        )}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

interface Stroke {
  id: number;
  path: string;
  completed: boolean;
  order: number;
}

interface ChineseCharacter {
  character: string;
  pinyin: string;
  meaning: string;
  strokes: Stroke[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface StrokeAnimationProps {
  strokes: Stroke[];
  isAnimating: boolean;
  currentStroke: number;
  onStrokeComplete: () => void;
}

function StrokeAnimation({ strokes, isAnimating, currentStroke, onStrokeComplete }: StrokeAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isAnimating && currentStroke < strokes.length) {
      const timer = setTimeout(() => {
        onStrokeComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isAnimating, currentStroke, onStrokeComplete, strokes.length]);

  return (
    <div className="relative w-80 h-80 mx-auto">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="w-full h-full rounded-lg"
        style={{
          border: '2px solid var(--primary-color)',
          background: 'linear-gradient(135deg, rgba(229, 62, 62, 0.05), rgba(255, 215, 0, 0.05))',
          backgroundImage: `
            linear-gradient(rgba(229, 62, 62, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(229, 62, 62, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      >
        {/* Grid lines for traditional Chinese writing practice */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(229, 62, 62, 0.2)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#grid)" />
        
        {/* Center guidelines */}
        <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(229, 62, 62, 0.3)" strokeWidth="1" strokeDasharray="5,5" />
        <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(229, 62, 62, 0.3)" strokeWidth="1" strokeDasharray="5,5" />

        {strokes.map((stroke, index) => (
          <motion.path
            key={stroke.id}
            d={stroke.path}
            fill="none"
            stroke={index <= currentStroke ? "var(--primary-color)" : "var(--primary-light)"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0.3 }}
            animate={{ 
              pathLength: index <= currentStroke ? 1 : 0,
              opacity: index <= currentStroke ? 1 : 0.3
            }}
            transition={{
              duration: index === currentStroke && isAnimating ? 1.5 : 0.3,
              ease: "easeInOut"
            }}
            style={{
              filter: index === currentStroke && isAnimating ? 'drop-shadow(0 0 8px rgba(229, 62, 62, 0.6))' : 'none'
            }}
          />
        ))}

        {/* Stroke order numbers */}
        {strokes.map((stroke, index) => (
          <motion.g key={`order-${stroke.id}`}>
            <motion.circle
              cx={stroke.path.match(/M\s*(\d+)/)?.[1] || "0"}
              cy={stroke.path.match(/M\s*\d+\s*(\d+)/)?.[1] || "0"}
              r="8"
              fill={index <= currentStroke ? "var(--primary-color)" : "var(--primary-light)"}
              initial={{ scale: 0 }}
              animate={{ scale: index <= currentStroke ? 1 : 0.7 }}
              transition={{ delay: index * 0.1 }}
            />
            <motion.text
              x={stroke.path.match(/M\s*(\d+)/)?.[1] || "0"}
              y={stroke.path.match(/M\s*\d+\s*(\d+)/)?.[1] || "0"}
              textAnchor="middle"
              dy="0.3em"
              fontSize="10"
              fill="white"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: index <= currentStroke ? 1 : 0.7 }}
              transition={{ delay: index * 0.1 }}
            >
              {index + 1}
            </motion.text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

interface PinyinDisplayProps {
  pinyin: string;
  isPlaying: boolean;
  onPlay: () => void;
}

function PinyinDisplay({ pinyin, isPlaying, onPlay }: PinyinDisplayProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playPronunciation = () => {
    if (soundEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(pinyin);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
    onPlay();
  };

  return (
    <motion.div 
      className="pinyin-practice-container"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex-1">
        <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>拼音 (Pinyin)</div>
        <div className="pinyin-large chinese-text">
          {pinyin}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          className="btn-chinese btn-ghost btn-sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button
          onClick={playPronunciation}
          disabled={isPlaying}
          className="btn-chinese btn-accent btn-sm"
        >
          <Mic className="w-4 h-4 mr-2" />
          {isPlaying ? '播放中...' : '发音'}
        </button>
      </div>
    </motion.div>
  );
}

interface CharacterInfoProps {
  character: ChineseCharacter;
}

function CharacterInfo({ character }: CharacterInfoProps) {
  const difficultyColors = {
    beginner: 'easy',
    intermediate: 'medium',
    advanced: 'hard'
  };

  const difficultyText = {
    beginner: '简单',
    intermediate: '中等',
    advanced: '困难'
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="text-center">
        <motion.div 
          className="hanzi-display text-gradient mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        >
          {character.character}
        </motion.div>
        <div className={`card-difficulty-badge ${difficultyColors[character.difficulty]}`}>
          {difficultyText[character.difficulty]}
        </div>
      </div>
      
      <div className="card-chinese card-minimal p-4">
        <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>含义 (Meaning)</div>
        <div className="text-xl font-semibold chinese-text" style={{ color: 'var(--secondary-color)' }}>
          {character.meaning}
        </div>
      </div>
    </motion.div>
  );
}

export default function EnhancedChineseWritingPractice() {
  const [selectedCharacter, setSelectedCharacter] = useState<ChineseCharacter>({
    character: '水',
    pinyin: 'shuǐ',
    meaning: 'water / 水',
    difficulty: 'beginner',
    strokes: [
      { id: 1, path: 'M 80 60 L 120 60', completed: false, order: 1 },
      { id: 2, path: 'M 100 40 L 100 80', completed: false, order: 2 },
      { id: 3, path: 'M 70 100 L 90 120 L 110 120 L 130 100', completed: false, order: 3 },
      { id: 4, path: 'M 60 140 L 140 140', completed: false, order: 4 }
    ]
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const characters: ChineseCharacter[] = [
    selectedCharacter,
    {
      character: '火',
      pinyin: 'huǒ',
      meaning: 'fire / 火',
      difficulty: 'beginner',
      strokes: [
        { id: 1, path: 'M 90 50 L 110 50', completed: false, order: 1 },
        { id: 2, path: 'M 100 40 L 100 90', completed: false, order: 2 },
        { id: 3, path: 'M 80 100 L 100 120 L 120 100', completed: false, order: 3 },
        { id: 4, path: 'M 70 130 L 90 150', completed: false, order: 4 },
        { id: 5, path: 'M 110 130 L 130 150', completed: false, order: 5 }
      ]
    },
    {
      character: '山',
      pinyin: 'shān',
      meaning: 'mountain / 山',
      difficulty: 'intermediate',
      strokes: [
        { id: 1, path: 'M 100 50 L 100 120', completed: false, order: 1 },
        { id: 2, path: 'M 70 80 L 70 140', completed: false, order: 2 },
        { id: 3, path: 'M 130 80 L 130 140', completed: false, order: 3 },
        { id: 4, path: 'M 60 140 L 140 140', completed: false, order: 4 }
      ]
    }
  ];

  const startAnimation = () => {
    setIsAnimating(true);
    setCurrentStroke(0);
    setProgress(0);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentStroke(-1);
    setProgress(0);
  };

  const handleStrokeComplete = () => {
    const nextStroke = currentStroke + 1;
    if (nextStroke < selectedCharacter.strokes.length) {
      setCurrentStroke(nextStroke);
      setProgress(((nextStroke + 1) / selectedCharacter.strokes.length) * 100);
    } else {
      setIsAnimating(false);
      setProgress(100);
    }
  };

  const handlePinyinPlay = () => {
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 2000);
  };

  return (
    <div className="min-h-screen p-6" style={{ 
      background: 'linear-gradient(135deg, var(--background-color), rgba(229, 62, 62, 0.02), rgba(255, 215, 0, 0.02))'
    }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="chinese-title flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10" style={{ color: 'var(--primary-color)' }} />
            汉字书法练习
            <PenTool className="w-10 h-10" style={{ color: 'var(--accent-color)' }} />
          </h1>
          <p className="lead chinese-calligraphy">
            Chinese Character Writing Practice with Traditional Aesthetics
          </p>
        </motion.div>

        {/* Character Selection */}
        <motion.div 
          className="flex justify-center gap-4 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {characters.map((char, index) => (
            <button
              key={char.character}
              className={`btn-chinese ${selectedCharacter.character === char.character ? 'btn-primary' : 'btn-outline'} btn-lg`}
              onClick={() => {
                setSelectedCharacter(char);
                resetAnimation();
              }}
              style={{ 
                width: '4rem', 
                height: '4rem', 
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-2xl)'
              }}
            >
              {char.character}
            </button>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Character Info Panel */}
          <LinesPatternCard className="h-fit">
            <div className="p-6 space-y-6">
              <CharacterInfo character={selectedCharacter} />
              <PinyinDisplay 
                pinyin={selectedCharacter.pinyin}
                isPlaying={isPlayingAudio}
                onPlay={handlePinyinPlay}
              />
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm chinese-text">
                  <span>笔画进度 (Stroke Progress)</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="stroke-progress">
                  <div 
                    className="stroke-progress-bar"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                <button 
                  onClick={startAnimation}
                  disabled={isAnimating}
                  className="btn-chinese btn-primary flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isAnimating ? '演示中...' : '开始演示'}
                </button>
                <button 
                  onClick={resetAnimation}
                  className="btn-chinese btn-outline"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </LinesPatternCard>

          {/* Stroke Animation Panel */}
          <LinesPatternCard>
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="chinese-title" style={{ fontSize: 'var(--font-size-xl)' }}>
                  笔画顺序 (Stroke Order)
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Follow the traditional stroke order for proper character formation
                </p>
              </div>
              
              <StrokeAnimation
                strokes={selectedCharacter.strokes}
                isAnimating={isAnimating}
                currentStroke={currentStroke}
                onStrokeComplete={handleStrokeComplete}
              />

              <div className="mt-6 text-center">
                <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                  当前笔画 (Current Stroke)
                </div>
                <div className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>
                  {isAnimating ? `${currentStroke + 1} / ${selectedCharacter.strokes.length}` : '准备开始'}
                </div>
              </div>
            </div>
          </LinesPatternCard>
        </div>

        {/* Footer */}
        <motion.div 
          className="text-center text-sm"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="chinese-text">传统书法美学与现代用户体验的完美结合</p>
          <p className="mt-1">Traditional Calligraphy Aesthetics meets Modern UX Design</p>
        </motion.div>
      </div>
    </div>
  );
}
