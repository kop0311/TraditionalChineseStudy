import Link from 'next/link'
import ChineseButton from '../components/ui/chinese-button'
import ChineseCard from '../components/ui/chinese-card'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="row align-items-center mb-5">
        <div className="col-lg-6">
          <h1 className="chinese-title display-4 mb-4 animate-fade-in">
            小小读书郎
          </h1>
          <p className="lead chinese-text mb-4 animate-slide-in-right">
            传承中华文化，启蒙智慧人生
          </p>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            专为儿童设计的中华经典学习平台，通过互动式学习方式，
            让孩子们在轻松愉快的环境中学习三字经、弟子规、道德经等经典文本。
          </p>
          <div className="d-flex gap-3 flex-wrap">
            <Link href="/classics">
              <ChineseButton variant="primary" size="lg">
                📚 开始学习
              </ChineseButton>
            </Link>
            <Link href="/enhanced-writing">
              <ChineseButton variant="outline" size="lg">
                ✍️ 汉字练习
              </ChineseButton>
            </Link>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="text-center">
            <div className="hanzi-writer-container cultural-pattern">
              <div className="hanzi-display text-gradient">学</div>
              <p style={{ color: 'var(--text-muted)' }}>点击开始学习汉字</p>
              <div className="mt-3">
                <button className="btn-chinese btn-ghost btn-sm">
                  演示笔画
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="chinese-title h3 mb-4">学习特色</h2>
        </div>
        <div className="col-md-4 mb-4">
          <ChineseCard
            title="📖 经典阅读"
            subtitle="Classical Literature"
            content="三字经、弟子规、道德经等经典文本，配有拼音标注和语音朗读功能。适合初学者系统学习中华经典。"
            variant="default"
          >
            <Link href="/classics">
              <ChineseButton variant="primary" size="md">
                开始阅读
              </ChineseButton>
            </Link>
          </ChineseCard>
        </div>
        <div className="col-md-4 mb-4">
          <ChineseCard
            title="✍️ 汉字练习"
            subtitle="Character Writing"
            content="交互式汉字书写练习，学习正确的笔画顺序和字形结构。通过动画演示和实时反馈提升书写技能。"
            variant="elegant"
          >
            <Link href="/enhanced-writing">
              <ChineseButton variant="secondary" size="md">
                练习书写
              </ChineseButton>
            </Link>
          </ChineseCard>
        </div>
        <div className="col-md-4 mb-4">
          <ChineseCard
            title="🎵 拼音学习"
            subtitle="Pinyin Practice"
            content="拼音发音练习和声调训练，帮助孩子掌握标准普通话发音。通过语音识别技术提供实时发音指导。"
            variant="minimal"
          >
            <Link href="/pinyin-practice">
              <ChineseButton variant="secondary" size="md">
                拼音练习
              </ChineseButton>
            </Link>
          </ChineseCard>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="chinese-title h3 mb-4">学习成果</h2>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card-chinese card-minimal text-center">
            <div className="card-chinese-body">
              <div className="card-stat">
                <span className="card-stat-value text-gradient">3</span>
                <p className="card-stat-label chinese-text">经典文本</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card-chinese card-minimal text-center">
            <div className="card-chinese-body">
              <div className="card-stat">
                <span className="card-stat-value" style={{ color: 'var(--secondary-color)' }}>1000+</span>
                <p className="card-stat-label chinese-text">常用汉字</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card-chinese card-minimal text-center">
            <div className="card-chinese-body">
              <div className="card-stat">
                <span className="card-stat-value" style={{ color: 'var(--accent-color)' }}>400+</span>
                <p className="card-stat-label chinese-text">拼音组合</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card-chinese card-minimal text-center">
            <div className="card-chinese-body">
              <div className="card-stat">
                <span className="card-stat-value" style={{ color: 'var(--info-color)' }}>∞</span>
                <p className="card-stat-label chinese-text">学习乐趣</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="row">
        <div className="col-12">
          <div className="card-chinese card-featured text-center cultural-pattern">
            <div className="card-chinese-body py-5">
              <h2 className="chinese-title h3 mb-3" style={{ color: 'var(--primary-color)' }}>
                开始您的学习之旅
              </h2>
              <p className="lead mb-4" style={{ color: 'var(--text-secondary)' }}>
                让我们一起探索中华文化的博大精深，
                在学习中感受传统文化的魅力。
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/classics">
                  <ChineseButton variant="primary" size="lg">
                    🚀 立即开始
                  </ChineseButton>
                </Link>
                <Link href="/enhanced-writing">
                  <ChineseButton variant="secondary" size="lg">
                    📝 体验练习
                  </ChineseButton>
                </Link>
                <Link href="/magic-ui">
                  <ChineseButton variant="outline" size="lg">
                    🎨 Magic UI
                  </ChineseButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
