const express = require('express');
const bcrypt = require('bcrypt');
const { User, Character } = require('../models');
const router = express.Router();

// Authentication middleware
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

// Admin root - redirect to login or dashboard
router.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login');
  }
});

// Login page
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { 
    title: '管理员登录',
    error: req.query.error,
    CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP
  });
});

// Login handler
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ 
      where: { email, role: 'admin' } 
    });
    
    if (!user) {
      return res.redirect('/admin/login?error=invalid');
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.redirect('/admin/login?error=invalid');
    }
    
    req.session.userId = user.id;
    res.redirect('/admin/dashboard');
    
  } catch (error) {
    res.redirect('/admin/login?error=server');
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const characterCount = await Character.count();
    const charactersWithStories = await Character.count({
      where: {
        story_html: {
          [require('sequelize').Op.ne]: null
        }
      }
    });
    
    res.render('admin/dashboard', {
      title: '管理后台',
      user: req.user,
      stats: {
        characterCount,
        charactersWithStories,
        storyCoverage: characterCount > 0 ? Math.round((charactersWithStories / characterCount) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载仪表板' }
    });
  }
});

// Character list
router.get('/characters', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Character.findAndCountAll({
      limit,
      offset,
      order: [['simp_char', 'ASC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.render('admin/characters', {
      title: '汉字管理',
      characters: rows,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载汉字列表' }
    });
  }
});

// Character edit form
router.get('/characters/:id/edit', requireAuth, async (req, res) => {
  try {
    const character = await Character.findByPk(req.params.id);
    if (!character) {
      return res.status(404).render('404', { title: '汉字未找到' });
    }
    
    res.render('admin/character-edit', {
      title: `编辑汉字: ${character.simp_char}`,
      character
    });
  } catch (error) {
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载汉字编辑页面' }
    });
  }
});

// Character update handler
router.post('/characters/:id/edit', requireAuth, async (req, res) => {
  try {
    const { story_html } = req.body;
    const character = await Character.findByPk(req.params.id);
    
    if (!character) {
      return res.status(404).render('404', { title: '汉字未找到' });
    }
    
    // Basic HTML sanitization (in production, use DOMPurify on server)
    const sanitizedHtml = story_html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
    
    await character.update({ story_html: sanitizedHtml });
    
    res.redirect(`/admin/characters/${character.id}/edit?success=1`);
  } catch (error) {
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法保存汉字故事' }
    });
  }
});

// Character search API
router.get('/api/characters/search', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    
    const characters = await Character.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { simp_char: { [require('sequelize').Op.like]: `%${q}%` } },
          { trad_char: { [require('sequelize').Op.like]: `%${q}%` } }
        ]
      },
      limit: 10
    });
    
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;