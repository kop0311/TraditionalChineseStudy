export const testData = {
  // Test characters for writing practice
  characters: [
    {
      character: '人',
      pinyin: 'rén',
      tone: 2,
      meaning: '人类',
      difficulty: 'easy',
      strokes: 2,
      radical: '人'
    },
    {
      character: '大',
      pinyin: 'dà',
      tone: 4,
      meaning: '大的',
      difficulty: 'easy',
      strokes: 3,
      radical: '大'
    },
    {
      character: '小',
      pinyin: 'xiǎo',
      tone: 3,
      meaning: '小的',
      difficulty: 'easy',
      strokes: 3,
      radical: '小'
    },
    {
      character: '学',
      pinyin: 'xué',
      tone: 2,
      meaning: '学习',
      difficulty: 'medium',
      strokes: 8,
      radical: '子'
    },
    {
      character: '书',
      pinyin: 'shū',
      tone: 1,
      meaning: '书本',
      difficulty: 'hard',
      strokes: 10,
      radical: '书'
    }
  ],

  // Test classics data
  classics: [
    {
      id: 'sanzijing',
      title: '三字经',
      description: '中国传统启蒙教材',
      chapters: 12,
      difficulty: 'easy',
      sampleText: '人之初，性本善。性相近，习相远。'
    },
    {
      id: 'dizigui',
      title: '弟子规',
      description: '清朝李毓秀所作',
      chapters: 8,
      difficulty: 'medium',
      sampleText: '弟子规，圣人训。首孝悌，次谨信。'
    },
    {
      id: 'daodejing',
      title: '道德经',
      description: '老子所著',
      chapters: 81,
      difficulty: 'hard',
      sampleText: '道可道，非常道。名可名，非常名。'
    }
  ],

  // Test user data
  users: [
    {
      username: 'test_student',
      email: 'student@test.com',
      password: 'test123456',
      role: 'student',
      progress: {
        classicsRead: 2,
        charactersPracticed: 25,
        pinyinExercises: 15,
        totalScore: 850
      }
    },
    {
      username: 'test_teacher',
      email: 'teacher@test.com',
      password: 'test123456',
      role: 'teacher',
      permissions: ['view_progress', 'manage_content']
    }
  ],

  // Test practice sessions
  practiceSessions: [
    {
      character: '人',
      attempts: 3,
      score: 85,
      timeSpent: 120000, // 2 minutes
      hintsUsed: 1,
      completed: true
    },
    {
      character: '大',
      attempts: 2,
      score: 92,
      timeSpent: 90000, // 1.5 minutes
      hintsUsed: 0,
      completed: true
    },
    {
      character: '学',
      attempts: 5,
      score: 78,
      timeSpent: 300000, // 5 minutes
      hintsUsed: 3,
      completed: true
    }
  ],

  // Test pinyin exercises
  pinyinExercises: [
    {
      character: '妈',
      pinyin: 'ma',
      tone: 1,
      userAnswer: 'mā',
      correct: true,
      attempts: 1,
      score: 100
    },
    {
      character: '马',
      pinyin: 'ma',
      tone: 3,
      userAnswer: 'má',
      correct: false,
      attempts: 2,
      score: 75
    },
    {
      character: '骂',
      pinyin: 'ma',
      tone: 4,
      userAnswer: 'mà',
      correct: true,
      attempts: 1,
      score: 100
    }
  ],

  // Test API responses
  apiResponses: {
    health: {
      status: 'ok',
      service: 'traditional-chinese-study',
      timestamp: new Date().toISOString(),
      uptime: 3600,
      database: {
        status: 'connected',
        responseTime: 15
      }
    },
    
    characterList: {
      characters: [
        { id: 1, character: '人', difficulty: 'easy' },
        { id: 2, character: '大', difficulty: 'easy' },
        { id: 3, character: '小', difficulty: 'easy' },
        { id: 4, character: '学', difficulty: 'medium' },
        { id: 5, character: '书', difficulty: 'hard' }
      ],
      total: 5,
      page: 1,
      limit: 10
    },

    userProgress: {
      userId: 1,
      totalCharacters: 50,
      completedCharacters: 25,
      averageScore: 85,
      totalTime: 7200000, // 2 hours
      achievements: ['first_character', 'ten_characters', 'perfect_score'],
      lastActivity: new Date().toISOString()
    }
  },

  // Test error scenarios
  errorScenarios: [
    {
      name: 'Network timeout',
      type: 'timeout',
      delay: 30000
    },
    {
      name: 'Server error',
      type: 'server_error',
      status: 500,
      message: 'Internal server error'
    },
    {
      name: 'Not found',
      type: 'not_found',
      status: 404,
      message: 'Resource not found'
    },
    {
      name: 'Unauthorized',
      type: 'unauthorized',
      status: 401,
      message: 'Authentication required'
    }
  ],

  // Test performance thresholds
  performanceThresholds: {
    pageLoad: {
      homepage: 3000,
      classics: 2000,
      writingPractice: 4000,
      pinyinPractice: 3000
    },
    apiResponse: {
      health: 500,
      characterList: 1000,
      userProgress: 1500,
      practiceSubmit: 2000
    },
    interaction: {
      buttonClick: 100,
      formSubmit: 1000,
      pageNavigation: 2000,
      componentLoad: 3000
    }
  },

  // Test accessibility requirements
  accessibilityRequirements: {
    colorContrast: {
      normal: 4.5,
      large: 3.0
    },
    touchTargets: {
      minWidth: 44,
      minHeight: 44
    },
    headingStructure: {
      maxH1: 1,
      logicalProgression: true
    },
    keyboardNavigation: {
      allInteractiveElementsFocusable: true,
      visibleFocusIndicator: true,
      logicalTabOrder: true
    }
  },

  // Test device configurations
  devices: [
    {
      name: 'iPhone 12',
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    },
    {
      name: 'iPad Pro',
      width: 1024,
      height: 1366,
      deviceScaleFactor: 2,
      isMobile: false,
      hasTouch: true
    },
    {
      name: 'Desktop Chrome',
      width: 1200,
      height: 800,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false
    },
    {
      name: 'Desktop Firefox',
      width: 1200,
      height: 800,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false
    }
  ],

  // Test URLs
  urls: {
    base: 'http://localhost',
    nextjs: 'http://localhost:3000',
    express: 'http://localhost:9005',
    api: {
      health: '/api/health',
      ping: '/ping',
      characters: '/api/characters',
      progress: '/api/progress',
      practice: '/api/practice'
    },
    pages: {
      home: '/',
      classics: '/classics',
      writingPractice: '/writing-practice',
      pinyinPractice: '/pinyin-practice',
      sanzijing: '/classics/sanzijing',
      dizigui: '/classics/dizigui',
      daodejing: '/classics/daodejing'
    }
  }
};

export default testData;
