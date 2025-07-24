'use client'

import { PageLayout } from '@/components/layout/PageLayout'
import EnhancedChineseWritingPractice from '../../components/EnhancedChineseWritingPractice'

export default function EnhancedWritingPage() {
  return (
    <PageLayout
      title="汉字练习"
      subtitle="学习正确的笔画顺序和字形结构"
      description="通过互动式汉字书写练习，掌握标准的书写技能，感受汉字之美"
      badge="书法练习平台"
    >
      <EnhancedChineseWritingPractice />
    </PageLayout>
  )
}