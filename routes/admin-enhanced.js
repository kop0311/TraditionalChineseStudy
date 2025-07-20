const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');
const { 
  User, Character, Classic, Chapter, Sentence,
  Book, BookChapter, UserProgress,
  Child, PracticeSession, CharacterProgress
} = require('../models');

const router = express.Router();

// 文件上传配置
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'video/mp4'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

// 认证中间件
const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/admin/login');
  }
  
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user || user.role !== 'admin') {
      req.session.destroy();
      return res.redirect('/admin/login');
    }
    req.user = user;
    next();
  } catch (error) {
    req.session.destroy();
    res.redirect('/admin/login');
  }
};

// ======================
// 仪表板和统计
// ======================

router.get('/enhanced', requireAuth, async (req, res) => {
  try {
    // 基础统计
    const stats = {
      books: await Book.count(),
      chapters: await BookChapter.count(),
      characters: await Character.count(),
      users: await User.count({ where: { role: 'user' } }),
      charactersWithStories: await Character.count({
        where: { story_html: { [Op.ne]: null } }
      })
    };

    // 最近活动
    const recentBooks = await Book.findAll({
      limit: 5,
      order: [['updatedAt', 'DESC']],
      include: [{ model: BookChapter, as: 'chapters' }]
    });

    const recentUsers = await User.findAll({
      where: { role: 'user' },
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    // 学习进度统计
    const progressStats = await UserProgress.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status']
    });

    res.render('admin/enhanced/dashboard', {
      title: '增强管理后台',
      user: req.user,
      stats,
      recentBooks,
      recentUsers,
      progressStats,
      CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载仪表板' }
    });
  }
});

// ======================
// 书籍管理
// ======================

// 书籍列表
router.get('/enhanced/books', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || '';

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }
    if (category) whereClause.category = category;
    if (status === 'published') whereClause.is_published = true;
    if (status === 'unpublished') whereClause.is_published = false;

    const { count, rows: books } = await Book.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: BookChapter, 
          as: 'chapters',
          attributes: ['id', 'title', 'is_published']
        }
      ],
      limit,
      offset,
      order: [['sort_order', 'ASC'], ['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.render('admin/enhanced/books/list', {
      title: '书籍管理',
      books,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      search,
      category,
      status,
      CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP
    });
  } catch (error) {
    console.error('Books list error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载书籍列表' }
    });
  }
});

// 新建书籍表单
router.get('/enhanced/books/new', requireAuth, (req, res) => {
  res.render('admin/enhanced/books/edit', {
    title: '新建书籍',
    book: null,
    isEdit: false,
    CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP,
    CDN_TINYMCE: process.env.CDN_TINYMCE
  });
});

// 编辑书籍表单
router.get('/enhanced/books/:id/edit', requireAuth, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [{ model: BookChapter, as: 'chapters' }]
    });
    
    if (!book) {
      return res.status(404).render('404', { title: '书籍未找到' });
    }

    res.render('admin/enhanced/books/edit', {
      title: `编辑书籍: ${book.title}`,
      book,
      isEdit: true,
      CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP,
      CDN_TINYMCE: process.env.CDN_TINYMCE
    });
  } catch (error) {
    console.error('Book edit form error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载书籍编辑页面' }
    });
  }
});

// 创建书籍
router.post('/enhanced/books', requireAuth, upload.single('cover_image'), async (req, res) => {
  try {
    const bookData = { ...req.body };
    
    // 处理标签
    if (bookData.tags) {
      bookData.tags = bookData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    // 处理上传的封面图片
    if (req.file) {
      bookData.cover_image = `/uploads/${req.file.filename}`;
    }
    
    // 生成slug
    if (!bookData.slug) {
      bookData.slug = bookData.title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const book = await Book.create(bookData);
    
    res.redirect(`/admin/enhanced/books/${book.id}/edit?success=created`);
  } catch (error) {
    console.error('Book creation error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法创建书籍' }
    });
  }
});

// 更新书籍
router.post('/enhanced/books/:id/edit', requireAuth, upload.single('cover_image'), async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).render('404', { title: '书籍未找到' });
    }

    const updateData = { ...req.body };
    
    // 处理标签
    if (updateData.tags) {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    // 处理上传的封面图片
    if (req.file) {
      updateData.cover_image = `/uploads/${req.file.filename}`;
    }

    await book.update(updateData);
    
    res.redirect(`/admin/enhanced/books/${book.id}/edit?success=updated`);
  } catch (error) {
    console.error('Book update error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法更新书籍' }
    });
  }
});

// 删除书籍
router.delete('/enhanced/books/:id', requireAuth, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ error: '书籍未找到' });
    }

    await book.destroy();
    res.json({ success: true, message: '书籍已删除' });
  } catch (error) {
    console.error('Book deletion error:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// 发布/取消发布书籍
router.post('/enhanced/books/:id/toggle-publish', requireAuth, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ error: '书籍未找到' });
    }

    if (book.is_published) {
      await book.unpublish();
    } else {
      await book.publish();
    }

    res.json({ 
      success: true, 
      is_published: book.is_published,
      message: book.is_published ? '书籍已发布' : '书籍已取消发布'
    });
  } catch (error) {
    console.error('Book publish toggle error:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

// ======================
// 章节管理
// ======================

// 章节列表
router.get('/enhanced/books/:bookId/chapters', requireAuth, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bookId);
    if (!book) {
      return res.status(404).render('404', { title: '书籍未找到' });
    }

    const chapters = await BookChapter.findAll({
      where: { book_id: req.params.bookId },
      order: [['chapter_number', 'ASC']]
    });

    res.render('admin/enhanced/chapters/list', {
      title: `${book.title} - 章节管理`,
      book,
      chapters,
      CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP
    });
  } catch (error) {
    console.error('Chapters list error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载章节列表' }
    });
  }
});

// 新建章节表单
router.get('/enhanced/books/:bookId/chapters/new', requireAuth, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bookId);
    if (!book) {
      return res.status(404).render('404', { title: '书籍未找到' });
    }

    // 获取下一个章节号
    const lastChapter = await BookChapter.findOne({
      where: { book_id: req.params.bookId },
      order: [['chapter_number', 'DESC']]
    });

    const nextChapterNumber = lastChapter ? lastChapter.chapter_number + 1 : 1;

    res.render('admin/enhanced/chapters/edit', {
      title: `${book.title} - 新建章节`,
      book,
      chapter: null,
      nextChapterNumber,
      isEdit: false,
      CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP,
      CDN_TINYMCE: process.env.CDN_TINYMCE
    });
  } catch (error) {
    console.error('Chapter new form error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载章节创建页面' }
    });
  }
});

// 创建章节
router.post('/enhanced/books/:bookId/chapters', requireAuth, upload.fields([
  { name: 'audio_file', maxCount: 1 },
  { name: 'video_file', maxCount: 1 }
]), async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: '书籍未找到' });
    }

    const chapterData = { 
      ...req.body, 
      book_id: req.params.bookId 
    };
    
    // 处理标签和学习目标
    if (chapterData.tags) {
      chapterData.tags = chapterData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    if (chapterData.learning_objectives) {
      chapterData.learning_objectives = chapterData.learning_objectives.split('\n').filter(obj => obj.trim());
    }
    
    // 处理上传的文件
    if (req.files.audio_file) {
      chapterData.audio_url = `/uploads/${req.files.audio_file[0].filename}`;
    }
    if (req.files.video_file) {
      chapterData.video_url = `/uploads/${req.files.video_file[0].filename}`;
    }

    const chapter = await BookChapter.create(chapterData);
    
    // 提取关键字符
    await chapter.extractKeyCharacters();
    
    // 更新书籍统计
    await book.updateCounts();
    
    res.redirect(`/admin/enhanced/books/${req.params.bookId}/chapters/${chapter.id}/edit?success=created`);
  } catch (error) {
    console.error('Chapter creation error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法创建章节' }
    });
  }
});

// ======================
// 用户管理
// ======================

// 用户列表
router.get('/enhanced/users', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (role) whereClause.role = role;

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: UserProgress, 
          as: 'progress',
          limit: 5,
          order: [['updatedAt', 'DESC']]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.render('admin/enhanced/users/list', {
      title: '用户管理',
      users,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      search,
      role,
      CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP
    });
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载用户列表' }
    });
  }
});

// 用户详情
router.get('/enhanced/users/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { 
          model: UserProgress, 
          as: 'progress',
          include: [
            { model: Book, as: 'book' },
            { model: BookChapter, as: 'chapter' },
            { model: Character, as: 'character' }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).render('404', { title: '用户未找到' });
    }

    // 计算统计数据
    const stats = {
      totalProgress: user.progress.length,
      completedItems: user.progress.filter(p => p.status === 'completed').length,
      totalTimeSpent: user.progress.reduce((sum, p) => sum + p.time_spent, 0),
      averageAccuracy: user.progress.length > 0 
        ? Math.round(user.progress.reduce((sum, p) => sum + p.getAccuracyRate(), 0) / user.progress.length)
        : 0
    };

    res.render('admin/enhanced/users/detail', {
      title: `用户详情: ${user.username}`,
      user,
      stats,
      CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP
    });
  } catch (error) {
    console.error('User detail error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载用户详情' }
    });
  }
});

// ======================
// 分析报告
// ======================

// 学习分析dashboard
router.get('/enhanced/analytics', requireAuth, async (req, res) => {
  try {
    // 用户活跃度统计
    const userStats = await UserProgress.findAll({
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('last_accessed')), 'date'],
        [require('sequelize').fn('COUNT', require('sequelize').fn('DISTINCT', require('sequelize').col('user_id'))), 'active_users']
      ],
      where: {
        last_accessed: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
        }
      },
      group: [require('sequelize').fn('DATE', require('sequelize').col('last_accessed'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('last_accessed')), 'DESC']]
    });

    // 热门书籍统计
    const popularBooks = await Book.findAll({
      include: [
        {
          model: UserProgress,
          as: 'userProgress',
          attributes: []
        }
      ],
      attributes: [
        'id', 'title',
        [require('sequelize').fn('COUNT', require('sequelize').col('userProgress.id')), 'progress_count']
      ],
      group: ['Book.id'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('userProgress.id')), 'DESC']],
      limit: 10
    });

    // 学习完成率统计
    const completionStats = await UserProgress.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('AVG', require('sequelize').col('completion_percentage')), 'avg_completion']
      ],
      group: ['status']
    });

    res.render('admin/enhanced/analytics/dashboard', {
      title: '学习分析',
      userStats,
      popularBooks,
      completionStats,
      CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载分析数据' }
    });
  }
});

// API端点用于实时数据
router.get('/enhanced/api/stats/realtime', requireAuth, async (req, res) => {
  try {
    const stats = {
      onlineUsers: await User.count({
        where: {
          updatedAt: {
            [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // 最近5分钟活跃
          }
        }
      }),
      todayProgress: await UserProgress.count({
        where: {
          last_accessed: {
            [Op.gte]: new Date().setHours(0, 0, 0, 0)
          }
        }
      }),
      systemHealth: 'good' // 这里可以添加系统健康检查逻辑
    };

    res.json(stats);
  } catch (error) {
    console.error('Realtime stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;