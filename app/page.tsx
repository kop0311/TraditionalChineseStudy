import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, PenTool, Music, Sparkles, Users, Award, Infinity } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cultural-radial">
      {/* Hero Section - Ultra Refined */}
      <section className="hero-ultra px-6 py-24 lg:py-40 will-animate">
        {/* Floating Orbs */}
        <div className="floating-orb floating-orb-1" style={{ top: '20%', left: '10%' }}></div>
        <div className="floating-orb floating-orb-2" style={{ top: '60%', right: '15%' }}></div>
        <div className="floating-orb floating-orb-3" style={{ top: '40%', left: '70%' }}></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
            <div className="space-y-12 animate-fade-in">
              <div className="space-y-8">
                <Badge variant="secondary" className="glass-morphism border-0 text-vermillion-700 font-semibold px-4 py-2 hover-lift">
                  <Sparkles className="w-4 h-4 mr-2 interactive-icon" />
                  传统文化学习平台
                </Badge>
                <div className="space-y-6">
                  <h1 className="hero-title-ultra animate-fade-in">
                    小小读书郎
                  </h1>
                  <p className="text-silk text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                    传承中华文化，启蒙智慧人生
                  </p>
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl bg-silk-texture p-6 rounded-2xl border border-white/20">
                    专为儿童设计的中华经典学习平台，通过互动式学习方式，
                    让孩子们在轻松愉快的环境中学习三字经、弟子规、道德经等经典文本。
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6 sm:flex-row">
                <button className="btn-imperial hover-glow group">
                  <Link href="/classics" className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 interactive-icon group-hover:scale-110 transition-transform" />
                    <span>开始学习</span>
                  </Link>
                </button>
                <button className="btn-imperial hover-glow group" style={{ background: 'linear-gradient(135deg, var(--jade-500), var(--jade-600))' }}>
                  <Link href="/enhanced-writing" className="flex items-center gap-3">
                    <PenTool className="w-6 h-6 interactive-icon group-hover:scale-110 transition-transform" />
                    <span>汉字练习</span>
                  </Link>
                </button>
              </div>
            </div>
            <div className="relative animate-slide-in-right">
              <div className="relative mx-auto flex h-[28rem] w-[28rem] items-center justify-center rounded-full glass-morphism-strong shadow-floating hover-lift will-animate">
                <div className="hanzi-ultra cursor-pointer hover:scale-105 transition-transform duration-500">学</div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <button className="btn-imperial btn-sm opacity-90">
                    <span>点击学习笔画</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Ultra Refined */}
      <section className="py-32 bg-paper-texture relative overflow-hidden">
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center space-y-8 mb-20">
            <h2 className="text-hero font-bold text-luxury mb-6">学习特色</h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              通过现代化的教学方式，让传统文化学习变得生动有趣
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="card-ultra card-floating hover-glow will-animate">
              <div className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-vermillion shadow-3 interactive-icon">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-luxury mb-3">经典阅读</h3>
                <p className="text-vermillion-600 font-semibold text-lg mb-6">Classical Literature</p>
                <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                  三字经、弟子规、道德经等经典文本，配有拼音标注和语音朗读功能。适合初学者系统学习中华经典。
                </p>
                <button className="btn-imperial group w-full">
                  <Link href="/classics" className="flex items-center justify-center gap-2">
                    <span>开始阅读</span>
                    <BookOpen className="w-5 h-5 interactive-icon group-hover:scale-110" />
                  </Link>
                </button>
              </div>
            </div>

            <div className="card-ultra card-floating hover-glow will-animate">
              <div className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-jade shadow-3 interactive-icon">
                  <PenTool className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-luxury mb-3">汉字练习</h3>
                <p className="text-jade-600 font-semibold text-lg mb-6">Character Writing</p>
                <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                  交互式汉字书写练习，学习正确的笔画顺序和字形结构。通过动画演示和实时反馈提升书写技能。
                </p>
                <button className="btn-imperial group w-full" style={{ background: 'linear-gradient(135deg, var(--jade-500), var(--jade-600))' }}>
                  <Link href="/enhanced-writing" className="flex items-center justify-center gap-2">
                    <span>练习书写</span>
                    <PenTool className="w-5 h-5 interactive-icon group-hover:scale-110" />
                  </Link>
                </button>
              </div>
            </div>

            <div className="card-ultra card-floating hover-glow will-animate">
              <div className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-plum shadow-3 interactive-icon">
                  <Music className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-luxury mb-3">拼音学习</h3>
                <p className="text-plum-600 font-semibold text-lg mb-6">Pinyin Practice</p>
                <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                  拼音发音练习和声调训练，帮助孩子掌握标准普通话发音。通过语音识别技术提供实时发音指导。
                </p>
                <button className="btn-imperial group w-full" style={{ background: 'linear-gradient(135deg, var(--plum-500), var(--plum-600))' }}>
                  <Link href="/pinyin-practice" className="flex items-center justify-center gap-2">
                    <span>拼音练习</span>
                    <Music className="w-5 h-5 interactive-icon group-hover:scale-110" />
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Ultra Refined */}
      <section className="py-32 gradient-sunset relative overflow-hidden">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center space-y-8 mb-20">
            <h2 className="text-hero font-bold text-luxury mb-6">学习成果</h2>
            <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium text-shadow-elegant">
              数字见证学习的力量，每一步都是成长的足迹
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="stat-ultra hover-lift will-animate">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full gradient-vermillion shadow-floating interactive-icon">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <div className="stat-number-ultra">3</div>
              <p className="stat-label-ultra">经典文本</p>
            </div>
            <div className="stat-ultra hover-lift will-animate">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full gradient-jade shadow-floating interactive-icon">
                <PenTool className="h-12 w-12 text-white" />
              </div>
              <div className="stat-number-ultra">1000+</div>
              <p className="stat-label-ultra">常用汉字</p>
            </div>
            <div className="stat-ultra hover-lift will-animate">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full gradient-plum shadow-floating interactive-icon">
                <Music className="h-12 w-12 text-white" />
              </div>
              <div className="stat-number-ultra">400+</div>
              <p className="stat-label-ultra">拼音组合</p>
            </div>
            <div className="stat-ultra hover-lift will-animate">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full gradient-gold shadow-floating interactive-icon">
                <Infinity className="h-12 w-12 text-white" />
              </div>
              <div className="stat-number-ultra">∞</div>
              <p className="stat-label-ultra">学习乐趣</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Ultra Refined */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 gradient-vermillion"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Floating Orbs for CTA */}
        <div className="floating-orb floating-orb-1" style={{ top: '10%', right: '20%', opacity: 0.3 }}></div>
        <div className="floating-orb floating-orb-2" style={{ bottom: '15%', left: '25%', opacity: 0.4 }}></div>
        
        <div className="container mx-auto max-w-5xl px-6 text-center relative z-10">
          <div className="space-y-12">
            <div className="space-y-8">
              <h2 className="text-display font-black text-white mb-8 text-shadow-elegant">
                开始您的学习之旅
              </h2>
              <p className="text-2xl sm:text-3xl text-white/90 leading-relaxed max-w-4xl mx-auto font-medium bg-white/10 p-8 rounded-3xl glass-morphism">
                让我们一起探索中华文化的博大精深，在学习中感受传统文化的魅力。
              </p>
            </div>
            <div className="flex flex-col gap-8 sm:flex-row sm:justify-center items-center">
              <button className="btn-imperial hover-glow group bg-white text-vermillion-700 shadow-floating" style={{ background: 'white', color: 'var(--vermillion-700)' }}>
                <Link href="/classics" className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 interactive-icon group-hover:scale-110" />
                  <span className="font-bold">立即开始</span>
                </Link>
              </button>
              <button className="btn-imperial hover-glow group glass-morphism-strong border-2 border-white/30 text-white">
                <Link href="/enhanced-writing" className="flex items-center gap-3">
                  <PenTool className="w-6 h-6 interactive-icon group-hover:scale-110" />
                  <span className="font-bold">体验练习</span>
                </Link>
              </button>
              <button className="btn-imperial hover-glow group" style={{ 
                background: 'linear-gradient(135deg, var(--gold-400), var(--gold-500))',
                color: 'var(--vermillion-800)'
              }}>
                <Link href="/magic-ui" className="flex items-center gap-3">
                  <Award className="w-6 h-6 interactive-icon group-hover:scale-110" />
                  <span className="font-bold">Magic UI</span>
                </Link>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
