import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, PenTool, Music, Sparkles, Users, Award, Infinity } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-6 py-20 lg:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  传统文化学习平台
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                  小小读书郎
                </h1>
                <p className="text-xl text-gray-600 sm:text-2xl font-medium">
                  传承中华文化，启蒙智慧人生
                </p>
                <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
                  专为儿童设计的中华经典学习平台，通过互动式学习方式，
                  让孩子们在轻松愉快的环境中学习三字经、弟子规、道德经等经典文本。
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                  <Link href="/classics">
                    <BookOpen className="w-5 h-5 mr-2" />
                    开始学习
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-red-200 text-red-700 hover:bg-red-50">
                  <Link href="/enhanced-writing">
                    <PenTool className="w-5 h-5 mr-2" />
                    汉字练习
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative mx-auto flex h-96 w-96 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 shadow-2xl">
                <div className="text-8xl font-bold text-red-800 select-none">学</div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    点击学习笔画
                  </Button>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-red-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
              <div className="absolute top-1/4 -right-12 w-12 h-12 bg-orange-400 rounded-full opacity-20 animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">学习特色</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              通过现代化的教学方式，让传统文化学习变得生动有趣
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">经典阅读</CardTitle>
                <CardDescription className="text-blue-600 font-medium">Classical Literature</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  三字经、弟子规、道德经等经典文本，配有拼音标注和语音朗读功能。适合初学者系统学习中华经典。
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/classics">开始阅读</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                  <PenTool className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">汉字练习</CardTitle>
                <CardDescription className="text-green-600 font-medium">Character Writing</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  交互式汉字书写练习，学习正确的笔画顺序和字形结构。通过动画演示和实时反馈提升书写技能。
                </p>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/enhanced-writing">练习书写</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <Music className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">拼音学习</CardTitle>
                <CardDescription className="text-purple-600 font-medium">Pinyin Practice</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  拼音发音练习和声调训练，帮助孩子掌握标准普通话发音。通过语音识别技术提供实时发音指导。
                </p>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/pinyin-practice">拼音练习</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">学习成果</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              数字见证学习的力量，每一步都是成长的足迹
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center space-y-2">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <BookOpen className="h-10 w-10 text-red-600" />
              </div>
              <div className="text-4xl font-bold text-red-600">3</div>
              <p className="text-gray-600 font-medium">经典文本</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <PenTool className="h-10 w-10 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600">1000+</div>
              <p className="text-gray-600 font-medium">常用汉字</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                <Music className="h-10 w-10 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-600">400+</div>
              <p className="text-gray-600 font-medium">拼音组合</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                <Infinity className="h-10 w-10 text-yellow-600" />
              </div>
              <div className="text-4xl font-bold text-yellow-600">∞</div>
              <p className="text-gray-600 font-medium">学习乐趣</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-orange-600">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                开始您的学习之旅
              </h2>
              <p className="text-xl text-red-100 leading-relaxed max-w-2xl mx-auto">
                让我们一起探索中华文化的博大精深，在学习中感受传统文化的魅力。
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="bg-white text-red-600 hover:bg-red-50">
                <Link href="/classics">
                  <Sparkles className="w-5 h-5 mr-2" />
                  立即开始
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-red-600">
                <Link href="/enhanced-writing">
                  <PenTool className="w-5 h-5 mr-2" />
                  体验练习
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-white hover:bg-red-500">
                <Link href="/magic-ui">
                  <Award className="w-5 h-5 mr-2" />
                  Magic UI
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
