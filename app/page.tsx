'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, PenTool, Music, Sparkles, Users, Award, Infinity } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50" suppressHydrationWarning>
      {/* Hero Section - Ultra Refined */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="px-6 py-24 lg:py-40"
      >
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
            <div className="space-y-12 animate-fade-in">
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 px-6 py-2 text-sm font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-200">
                    <Sparkles className="w-4 h-4 mr-2" />
                    传统文化学习平台
                  </Badge>
                </motion.div>
                <div className="space-y-6">
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gray-900 leading-tight tracking-tight"
                  >
                    小小读书郎
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-700 leading-tight"
                  >
                    传承中华文化，启蒙智慧人生
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 shadow-lg"
                  >
                    专为儿童设计的中华经典学习平台，通过互动式学习方式，
                    让孩子们在轻松愉快的环境中学习三字经、弟子规、道德经等经典文本。
                  </motion.p>
                </div>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="flex flex-col gap-4 sm:flex-row"
              >
                <Link href="/classics">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold flex items-center gap-3 group">
                    <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span>开始学习</span>
                  </Button>
                </Link>
                <Link href="/enhanced-writing">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold flex items-center gap-3 group">
                    <PenTool className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span>汉字练习</span>
                  </Button>
                </Link>
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 1.0 }}
              className="relative"
            >
              <div className="relative mx-auto flex h-[28rem] w-[28rem] items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500 group">
                <div className="text-[12rem] font-bold text-gray-800 cursor-pointer group-hover:scale-105 transition-transform duration-500">学</div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <Button className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
                    <span>点击学习笔画</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section - Apple Style */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-32 bg-gray-50/80 relative overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 mb-20"
          >
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">学习特色</h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              通过现代化的教学方式，让传统文化学习变得生动有趣
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group"
            >
              <Card className="h-full bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group-hover:scale-[1.02]">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
                    <BookOpen className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">经典阅读</h3>
                  <p className="text-blue-600 font-semibold text-lg mb-6">Classical Literature</p>
                  <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                    三字经、弟子规、道德经等经典文本，配有拼音标注和语音朗读功能。适合初学者系统学习中华经典。
                  </p>
                  <Link href="/classics">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 group">
                      <span>开始阅读</span>
                      <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group"
            >
              <Card className="h-full bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group-hover:scale-[1.02]">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors duration-300">
                    <PenTool className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">汉字练习</h3>
                  <p className="text-emerald-600 font-semibold text-lg mb-6">Character Writing</p>
                  <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                    交互式汉字书写练习，学习正确的笔画顺序和字形结构。通过动画演示和实时反馈提升书写技能。
                  </p>
                  <Link href="/enhanced-writing">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 group">
                      <span>练习书写</span>
                      <PenTool className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group"
            >
              <Card className="h-full bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group-hover:scale-[1.02]">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300">
                    <Music className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">拼音学习</h3>
                  <p className="text-purple-600 font-semibold text-lg mb-6">Pinyin Practice</p>
                  <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                    拼音发音练习和声调训练，帮助孩子掌握标准普通话发音。通过语音识别技术提供实时发音指导。
                  </p>
                  <Link href="/pinyin-practice">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 group">
                      <span>拼音练习</span>
                      <Music className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Statistics Section - Apple Style */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-32 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 mb-20"
          >
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">学习成果</h2>
            <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              数字见证学习的力量，每一步都是成长的足迹
            </p>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center group"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300 shadow-lg">
                <BookOpen className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-5xl font-bold text-gray-900 mb-2">3</div>
              <p className="text-gray-600 font-medium text-lg">经典文本</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center group"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors duration-300 shadow-lg">
                <PenTool className="h-12 w-12 text-emerald-600" />
              </div>
              <div className="text-5xl font-bold text-gray-900 mb-2">1000+</div>
              <p className="text-gray-600 font-medium text-lg">常用汉字</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center group"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300 shadow-lg">
                <Music className="h-12 w-12 text-purple-600" />
              </div>
              <div className="text-5xl font-bold text-gray-900 mb-2">400+</div>
              <p className="text-gray-600 font-medium text-lg">拼音组合</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center group"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors duration-300 shadow-lg">
                <Infinity className="h-12 w-12 text-amber-600" />
              </div>
              <div className="text-5xl font-bold text-gray-900 mb-2">∞</div>
              <p className="text-gray-600 font-medium text-lg">学习乐趣</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Call to Action - Apple Style */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-40 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      >
        
        <div className="container mx-auto max-w-5xl px-6 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div className="space-y-8">
              <h2 className="text-5xl sm:text-6xl font-bold text-white mb-8 tracking-tight">
                开始您的学习之旅
              </h2>
              <p className="text-2xl sm:text-3xl text-white/90 leading-relaxed max-w-4xl mx-auto font-medium bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
                让我们一起探索中华文化的博大精深，在学习中感受传统文化的魅力。
              </p>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col gap-6 sm:flex-row sm:justify-center items-center"
            >
              <Link href="/classics">
                <Button className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold flex items-center gap-3 group">
                  <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>立即开始</span>
                </Button>
              </Link>
              <Link href="/enhanced-writing">
                <Button className="bg-transparent hover:bg-white/10 text-white border-2 border-white/30 px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold flex items-center gap-3 group backdrop-blur-sm">
                  <PenTool className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>体验练习</span>
                </Button>
              </Link>
              <Link href="/pinyin-practice">
                <Button className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold flex items-center gap-3 group">
                  <Music className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>拼音练习</span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
