import Link from 'next/link'
import ChineseButton from '../../components/ui/chinese-button'
import ChineseCard from '../../components/ui/chinese-card'

interface Classic {
  id: string
  title: string
  description: string
  chapters: number
  difficulty: 'easy' | 'medium' | 'hard'
  image?: string
}

const classics: Classic[] = [
  {
    id: 'sanzijing',
    title: '三字经',
    description: '中国传统启蒙教材，以三字一句的韵文形式，教授儿童基本的道德观念、历史知识和文化常识。',
    chapters: 12,
    difficulty: 'easy'
  },
  {
    id: 'dizigui',
    title: '弟子规',
    description: '清朝李毓秀所作，以《论语》中"弟子入则孝，出则悌"为总纲，教导儿童如何做人做事。',
    chapters: 8,
    difficulty: 'medium'
  },
  {
    id: 'daodejing',
    title: '道德经',
    description: '老子所著，中国古代哲学经典，阐述了道家思想的核心理念，适合有一定基础的学习者。',
    chapters: 81,
    difficulty: 'hard'
  }
]

export default function ClassicsPage() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'danger'
      default: return 'secondary'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '困难'
      default: return '未知'
    }
  }

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="text-center mb-5">
        <h1 className="chinese-title display-4 mb-3 animate-fade-in">经典阅读</h1>
        <p className="lead chinese-calligraphy">
          探索中华文化的瑰宝，在经典中汲取智慧
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          选择一部经典开始您的学习之旅
        </p>
      </div>

      {/* Classics Grid */}
      <div className="row">
        {classics.map((classic, index) => (
          <div key={classic.id} className="col-lg-4 col-md-6 mb-4">
            <div className="card-chinese card-classic card-interactive h-100 animate-fade-in"
                 style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="card-chinese-header text-center">
                <div className="hanzi-display text-gradient mb-2" style={{ fontSize: '4rem' }}>
                  {classic.title.charAt(0)}
                </div>
                <h5 className="card-chinese-title">{classic.title}</h5>
                <p className="card-chinese-subtitle">
                  {classic.id === 'sanzijing' ? 'Three Character Classic' :
                   classic.id === 'dizigui' ? 'Rules for Students' :
                   'Tao Te Ching'}
                </p>
              </div>

              <div className="card-chinese-body">
                <p className="classical-text mb-3" style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-md)' }}>
                  {classic.description}
                </p>

                <div className="card-stats">
                  <div className="card-stat">
                    <span className="card-stat-value">{classic.chapters}</span>
                    <p className="card-stat-label">章节</p>
                  </div>
                  <div className="card-stat">
                    <div className={`card-difficulty-badge ${classic.difficulty}`}>
                      {getDifficultyText(classic.difficulty)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-chinese-footer">
                <Link
                  href={`/classics/${classic.id}`}
                  className="btn-chinese btn-primary w-100 mb-2"
                >
                  <span>📖</span>
                  开始阅读
                </Link>
                <div className="d-flex gap-2">
                  <Link
                    href={`/writing-practice?classic=${classic.id}`}
                    className="btn-chinese btn-secondary btn-sm flex-fill"
                  >
                    <span>✍️</span>
                    练字
                  </Link>
                  <Link
                    href={`/pinyin-practice?classic=${classic.id}`}
                    className="btn-chinese btn-accent btn-sm flex-fill"
                  >
                    <span>🎵</span>
                    拼音
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Learning Tips */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card-chinese card-minimal cultural-pattern">
            <div className="card-chinese-header">
              <h5 className="card-chinese-title">学习建议</h5>
              <p className="card-chinese-subtitle">Learning Tips</p>
            </div>
            <div className="card-chinese-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="tip-item mb-3 p-3 border-gradient">
                    <h6 className="chinese-text mb-2">📚 循序渐进</h6>
                    <p className="small" style={{ color: 'var(--text-secondary)' }}>
                      建议从《三字经》开始，逐步提高难度，
                      打好基础后再学习更深层次的经典。
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="tip-item mb-3 p-3 border-gradient">
                    <h6 className="chinese-text mb-2">🎵 朗读背诵</h6>
                    <p className="small" style={{ color: 'var(--text-secondary)' }}>
                      经典文本都有韵律美，建议大声朗读，
                      在朗读中感受文字的音韵之美。
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="tip-item mb-3 p-3 border-gradient">
                    <h6 className="chinese-text mb-2">✍️ 书写练习</h6>
                    <p className="small" style={{ color: 'var(--text-secondary)' }}>
                      结合汉字书写练习，在书写中加深
                      对文字和内容的理解与记忆。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card-chinese card-progress">
            <div className="card-chinese-header">
              <h5 className="card-chinese-title">学习进度</h5>
              <p className="card-chinese-subtitle">Learning Progress</p>
            </div>
            <div className="card-chinese-body">
              <p style={{ color: 'var(--text-muted)' }} className="mb-3">
                您的整体学习进度 (需要登录后查看详细进度)
              </p>
              <div className="stroke-progress mb-4">
                <div
                  className="stroke-progress-bar"
                  style={{ width: '25%' }}
                  role="progressbar"
                  aria-valuenow={25}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                </div>
              </div>
              <div className="card-stats">
                <div className="card-stat">
                  <span className="card-stat-value" style={{ color: 'var(--success-color)' }}>156</span>
                  <p className="card-stat-label">已学汉字</p>
                </div>
                <div className="card-stat">
                  <span className="card-stat-value" style={{ color: 'var(--primary-color)' }}>23</span>
                  <p className="card-stat-label">已读章节</p>
                </div>
                <div className="card-stat">
                  <span className="card-stat-value" style={{ color: 'var(--accent-color)' }}>89</span>
                  <p className="card-stat-label">练习次数</p>
                </div>
                <div className="card-stat">
                  <span className="card-stat-value" style={{ color: 'var(--info-color)' }}>12</span>
                  <p className="card-stat-label">学习天数</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
