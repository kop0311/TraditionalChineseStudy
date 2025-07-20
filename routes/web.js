const express = require('express');
const { Classic, Chapter, Sentence, Character, User, Child } = require('../models');
const etymologyService = require('../services/etymologyService');
const router = express.Router();

// Home page - show landing page
router.get('/', async (req, res) => {
  try {
    // Get all classics for the landing page
    const classics = await Classic.findAll({
      order: [['id', 'ASC']]
    });
    
    res.render('index', {
      title: '小小读书郎 - 让孩子在5分钟内学会1个字',
      classics,
      user: req.session.userId ? await User.findByPk(req.session.userId) : null
    });
  } catch (error) {
    const logger = require('../config/logger');
    logger.error('Home page error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载首页' }
    });
  }
});

// Reader page
router.get('/reader/:classicSlug/:chapterNo', async (req, res) => {
  try {
    const { classicSlug, chapterNo } = req.params;
    
    // Find classic
    const classic = await Classic.findOne({
      where: { slug: classicSlug }
    });
    
    if (!classic) {
      return res.status(404).render('404', { title: '经典未找到' });
    }
    
    // Find chapter
    const chapter = await Chapter.findOne({
      where: { 
        classic_id: classic.id,
        chapter_no: parseInt(chapterNo)
      }
    });
    
    if (!chapter) {
      return res.status(404).render('404', { title: '章节未找到' });
    }
    
    // Find sentences
    const sentences = await Sentence.findAll({
      where: { chapter_id: chapter.id },
      order: [['seq_no', 'ASC']]
    });
    
    // Find adjacent chapters for navigation
    const prevChapter = await Chapter.findOne({
      where: { 
        classic_id: classic.id,
        chapter_no: parseInt(chapterNo) - 1
      }
    });
    
    const nextChapter = await Chapter.findOne({
      where: { 
        classic_id: classic.id,
        chapter_no: parseInt(chapterNo) + 1
      }
    });
    
    // Get all chapters for navigation
    const allChapters = await Chapter.findAll({
      where: { classic_id: classic.id },
      order: [['chapter_no', 'ASC']]
    });
    
    res.render('reader', {
      title: `${classic.title} · ${chapter.title}`,
      classic,
      chapter,
      sentences,
      prevChapter,
      nextChapter,
      allChapters,
      user: req.session.userId ? await User.findByPk(req.session.userId) : null,
      CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP,
      CDN_HANZI: process.env.CDN_HANZI
    });
    
  } catch (error) {
    const logger = require('../config/logger');
    logger.error('Reader page error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载阅读页面' }
    });
  }
});

// Classic list page
router.get('/classics', async (req, res) => {
  try {
    const classics = await Classic.findAll({
      include: [{
        model: Chapter,
        as: 'chapters',
        attributes: ['id', 'chapter_no', 'title']
      }]
    });
    
    res.render('classics', {
      title: '经典文本',
      classics,
      user: req.session.userId ? await User.findByPk(req.session.userId) : null
    });
  } catch (error) {
    const logger = require('../config/logger');
    logger.error('Classics page error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载经典列表' }
    });
  }
});

// Practice routes - Pinyin practice
router.get('/practice/pinyin/:sentenceId', async (req, res) => {
  try {
    const { sentenceId } = req.params;
    
    // Find sentence
    const sentence = await Sentence.findByPk(sentenceId);
    if (!sentence) {
      return res.status(404).render('404', { title: '句子未找到' });
    }
    
    // Find chapter and classic
    const chapter = await Chapter.findByPk(sentence.chapter_id);
    const classic = await Classic.findByPk(chapter.classic_id);
    
    // Get characters for this sentence
    const chars = sentence.simp.split('').filter(char => char.match(/[一-龯]/));
    const characters = await Character.findAll({
      where: {
        simp_char: chars
      }
    });
    
    res.render('pinyin-practice', {
      title: `学拼音 - ${sentence.simp}`,
      sentence,
      chapter,
      classic,
      characters,
      CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP,
      CDN_HANZI: process.env.CDN_HANZI
    });
    
  } catch (error) {
    const logger = require('../config/logger');
    logger.error('Pinyin practice error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载拼音练习页面' }
    });
  }
});

// Practice routes - Writing practice
router.get('/practice/writing/:sentenceId', async (req, res) => {
  try {
    const { sentenceId } = req.params;
    
    // Find sentence
    const sentence = await Sentence.findByPk(sentenceId);
    if (!sentence) {
      return res.status(404).render('404', { title: '句子未找到' });
    }
    
    // Find chapter and classic
    const chapter = await Chapter.findByPk(sentence.chapter_id);
    const classic = await Classic.findByPk(chapter.classic_id);
    
    // Get characters for this sentence
    const chars = sentence.simp.split('').filter(char => char.match(/[一-龯]/));
    const characters = await Character.findAll({
      where: {
        simp_char: chars
      }
    });
    
    res.render('writing-practice', {
      title: `学写字 - ${sentence.simp}`,
      sentence,
      chapter,
      classic,
      characters,
      CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP,
      CDN_HANZI: process.env.CDN_HANZI
    });
    
  } catch (error) {
    const logger = require('../config/logger');
    logger.error('Writing practice error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载写字练习页面' }
    });
  }
});

// Test route for Hanzi Writer functionality
router.get('/test/hanzi', (req, res) => {
  res.render('hanzi-test', { title: 'Hanzi Writer 测试' });
});

// 家长仪表板
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      include: [{
        model: Child,
        as: 'children',
        include: [{
          model: require('../models').AvatarConfig,
          as: 'avatarConfig',
          include: [{
            model: require('../models').AvatarSet,
            as: 'avatarSet'
          }]
        }]
      }]
    });
    
    if (!user) {
      return res.redirect('/auth/login');
    }
    
    res.render('parent/dashboard', {
      title: '家长中心',
      user,
      children: user.children || [],
      success: req.query.success
    });
    
  } catch (error) {
    const logger = require('../config/logger');
    logger.error('Dashboard error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载仪表板' }
    });
  }
});

// 头像选择页面
router.get('/children/:id/avatar', requireAuth, async (req, res) => {
  try {
    const childId = req.params.id;
    const child = await Child.findByPk(childId, {
      include: [{
        model: require('../models').AvatarConfig,
        as: 'avatarConfig',
        include: [{
          model: require('../models').AvatarSet,
          as: 'avatarSet'
        }]
      }]
    });

    if (!child) {
      return res.status(404).render('404', { title: '孩子信息不存在' });
    }

    // 验证是否是该孩子的家长
    const user = await User.findByPk(req.session.userId);
    if (!user || child.parent_id !== user.id) {
      return res.status(403).render('error', { 
        title: '访问被拒绝', 
        error: { message: '您没有权限访问这个页面' }
      });
    }

    res.render('parent/avatar-selector', {
      title: '选择头像',
      child
    });

  } catch (error) {
    const logger = require('../config/logger');
    logger.error('Avatar selector error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载头像选择页面' }
    });
  }
});

// Etymology page - dedicated page for character evolution
router.get('/etymology/:character?', async (req, res) => {
  try {
    const { character } = req.params;
    let etymologyData = null;
    let allCharacters = [];

    // Get all characters for the character selector
    const characters = await Character.findAll({
      attributes: ['simp_char', 'trad_char'],
      order: [['simp_char', 'ASC']]
    });
    
    allCharacters = characters.map(c => ({
      simp: c.simp_char,
      trad: c.trad_char
    }));

    // If a character is specified, load its etymology
    if (character) {
      const charData = await Character.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { simp_char: character },
            { trad_char: character }
          ]
        },
        attributes: ['id', 'simp_char', 'trad_char', 'etymology_data', 'story_html']
      });

      if (charData) {
        // Check if we have cached etymology data
        if (charData.etymology_data && charData.etymology_data.fetched_at) {
          const fetchedDate = new Date(charData.etymology_data.fetched_at);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          
          if (fetchedDate > thirtyDaysAgo) {
            etymologyData = charData.etymology_data;
          }
        }

        // If no cached data or data is old, fetch fresh
        if (!etymologyData) {
          try {
            etymologyData = await etymologyService.fetchEtymologyData(character);
            // Update the database with fresh data
            await charData.update({ etymology_data: etymologyData });
          } catch (error) {
            const logger = require('../config/logger');
            logger.error('Error fetching etymology for page:', error);
          }
        }
      }
    }

    res.render('etymology', {
      title: character ? `"${character}" 字源演变 - 小小读书郎` : '汉字字源演变 - 小小读书郎',
      character,
      etymologyData,
      allCharacters,
      user: req.session.userId ? await User.findByPk(req.session.userId) : null
    });
  } catch (error) {
    const logger = require('../config/logger');
    logger.error('Etymology page error:', error);
    res.status(500).render('error', { 
      title: '服务器错误', 
      error: { message: '无法加载字源页面' }
    });
  }
});

// 认证中间件
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}

module.exports = router;