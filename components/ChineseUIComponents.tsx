import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import ChineseButton from '@/components/ui/chinese-button';
import ChineseCard from '@/components/ui/chinese-card';

const ChineseUIComponents: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-amber-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 chinese-title">中华文化教育平台</h1>
          <p className="text-xl text-gray-600">Chinese Cultural Education Platform</p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-amber-500 mx-auto rounded-full"></div>
        </div>

        {/* Button Showcase */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center chinese-text">按钮组件 Button Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Primary Buttons</h3>
              <div className="space-y-3">
                <ChineseButton variant="primary" size="sm">开始学习</ChineseButton>
                <ChineseButton variant="primary" size="md">探索文化</ChineseButton>
                <ChineseButton variant="primary" size="lg">深入了解</ChineseButton>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Secondary Buttons</h3>
              <div className="space-y-3">
                <ChineseButton variant="secondary" size="sm">查看详情</ChineseButton>
                <ChineseButton variant="secondary" size="md">了解更多</ChineseButton>
                <ChineseButton variant="secondary" size="lg">立即体验</ChineseButton>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Outline Buttons</h3>
              <div className="space-y-3">
                <ChineseButton variant="outline" size="sm">返回</ChineseButton>
                <ChineseButton variant="outline" size="md">取消</ChineseButton>
                <ChineseButton variant="outline" size="lg">重置</ChineseButton>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Ghost Buttons</h3>
              <div className="space-y-3">
                <ChineseButton variant="ghost" size="sm">跳过</ChineseButton>
                <ChineseButton variant="ghost" size="md">稍后</ChineseButton>
                <ChineseButton variant="ghost" size="lg">忽略</ChineseButton>
              </div>
            </div>
          </div>
        </div>

        {/* Card Showcase */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center chinese-text">卡片组件 Card Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ChineseCard
              title="书法艺术"
              subtitle="Calligraphy Art"
              content="中国书法是汉字的书写艺术，被誉为无言的诗、无行的舞、无图的画、无声的乐。"
              variant="default"
            >
              <div className="flex space-x-2">
                <ChineseButton variant="primary" size="sm">开始练习</ChineseButton>
                <ChineseButton variant="outline" size="sm">了解历史</ChineseButton>
              </div>
            </ChineseCard>

            <ChineseCard
              title="茶道文化"
              subtitle="Tea Culture"
              content="茶道是一种以茶为媒的生活礼仪，也是修身养性的方式，通过沏茶、赏茶、闻茶、饮茶来增进友谊。"
              variant="elegant"
            >
              <div className="flex space-x-2">
                <ChineseButton variant="secondary" size="sm">品茶体验</ChineseButton>
                <ChineseButton variant="ghost" size="sm">茶具介绍</ChineseButton>
              </div>
            </ChineseCard>

            <ChineseCard
              title="古典音乐"
              subtitle="Classical Music"
              content="中国古典音乐历史悠久，以其独特的五声音阶和丰富的表现力，展现了深厚的文化内涵。"
              variant="minimal"
            >
              <div className="flex space-x-2">
                <ChineseButton variant="primary" size="sm">聆听音乐</ChineseButton>
                <ChineseButton variant="outline" size="sm">乐器介绍</ChineseButton>
              </div>
            </ChineseCard>

            <ChineseCard
              title="传统节日"
              subtitle="Traditional Festivals"
              content="中国传统节日承载着深厚的历史文化内涵，是中华民族悠久历史文化的重要组成部分。"
              variant="default"
            />

            <ChineseCard
              title="武术精神"
              subtitle="Martial Arts"
              content="中华武术不仅是一种体育运动，更是一种文化传承，体现了中华民族的智慧和精神。"
              variant="elegant"
            />

            <ChineseCard
              title="诗词歌赋"
              subtitle="Poetry & Literature"
              content="中国古典诗词是中华文化的瑰宝，以其精炼的语言和深远的意境，传承着千年的文化底蕴。"
              variant="minimal"
            />
          </div>
        </div>

        {/* Interactive Section */}
        <div className="bg-white rounded-2xl p-8 border-2 border-red-100 shadow-xl">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 chinese-title">开启您的文化之旅</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto chinese-text">
              通过我们精心设计的课程和互动体验，深入了解中华文化的博大精深，感受传统与现代的完美融合。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <ChineseButton variant="primary" size="lg">立即开始</ChineseButton>
              <ChineseButton variant="secondary" size="lg">免费试听</ChineseButton>
              <ChineseButton variant="outline" size="lg">了解课程</ChineseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChineseUIComponents;
