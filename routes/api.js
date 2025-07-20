const express = require('express');
const { Classic, Chapter, Sentence, Character, Stats } = require('../models');
const etymologyService = require('../services/etymologyService');
const logger = require('../config/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

// API response validation middleware
const validateApiResponse = (req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    // Add consistent API response structure
    const response = {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
      path: req.path
    };
    return originalJson.call(this, response);
  };
  next();
};

// Use response validation for all API routes
router.use(validateApiResponse);

// Get all classics
router.get('/classics', asyncHandler(async (req, res) => {
  const classics = await Classic.findAll({
    attributes: ['id', 'slug', 'title', 'author', 'dynasty']
  });
  res.json(classics);
}));

// Get chapters for a classic
router.get('/chapters/:classicSlug', 
  param('classicSlug').isSlug().withMessage('Invalid classic slug'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const classic = await Classic.findOne({
      where: { slug: req.params.classicSlug }
    });
    
    if (!classic) {
      return res.status(404).json({ error: 'Classic not found' });
    }

    const chapters = await Chapter.findAll({
      where: { classic_id: classic.id },
      attributes: ['id', 'chapter_no', 'title'],
      order: [['chapter_no', 'ASC']]
    });
    
    res.json(chapters);
  }));

// Get sentences for a chapter
router.get('/sentences/:chapterId', 
  param('chapterId').isInt({ min: 1 }).withMessage('Invalid chapter ID'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const sentences = await Sentence.findAll({
      where: { chapter_id: req.params.chapterId },
      attributes: ['id', 'seq_no', 'simp', 'trad', 'pinyin_json', 'youtube_id'],
      order: [['seq_no', 'ASC']]
    });
    
    res.json(sentences);
  }));

// Get character information - POST method to avoid URL encoding issues
router.post('/characters', 
  body('character').isLength({ min: 1, max: 1 }).withMessage('Character must be exactly one character'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { character } = req.body;
    
    const charData = await Character.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { simp_char: character },
          { trad_char: character }
        ]
      },
      attributes: ['simp_char', 'trad_char', 'stroke_order_json', 'radical', 'story_html', 'etymology_data']
    });

    if (!charData) {
      // Character not found - logging handled by Winston
      return res.status(404).json({ error: 'Character not found' });
    }

    // Success logging handled by Winston
    res.json(charData);
  }));

// Get character information - GET method with URL encoding fix
router.get('/characters/:char', async (req, res) => {
  try {
    // Decode the URL-encoded parameter
    const char = decodeURIComponent(req.params.char);
    
    // Debug logging removed for production
    
    const character = await Character.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { simp_char: char },
          { trad_char: char }
        ]
      },
      attributes: ['simp_char', 'trad_char', 'stroke_order_json', 'radical', 'story_html', 'etymology_data']
    });

    if (!character) {
      // Character not found - logging handled by Winston
      return res.status(404).json({ error: 'Character not found' });
    }

    // Success logging handled by Winston
    res.json(character);
  } catch (error) {
    logger.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// Get etymology data for a character
router.post('/characters/etymology', async (req, res) => {
  try {
    const { character } = req.body;
    
    if (!character) {
      return res.status(400).json({ error: 'Character is required' });
    }

    // First check if we have cached etymology data
    const charData = await Character.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { simp_char: character },
          { trad_char: character }
        ]
      },
      attributes: ['id', 'simp_char', 'trad_char', 'etymology_data']
    });

    if (!charData) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // If we have cached etymology data and it's recent (less than 30 days), return it
    if (charData.etymology_data && charData.etymology_data.fetched_at) {
      const fetchedDate = new Date(charData.etymology_data.fetched_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      if (fetchedDate > thirtyDaysAgo) {
        // Cache hit - logging handled by Winston
        return res.json(charData.etymology_data);
      }
    }

    // Fetch fresh etymology data
    // Fresh fetch - logging handled by Winston
    const etymologyData = await etymologyService.fetchEtymologyData(character);

    // Update the character record with the new etymology data
    await charData.update({ etymology_data: etymologyData });

    res.json(etymologyData);
  } catch (error) {
    logger.error('Etymology API Error:', error);
    res.status(500).json({ error: 'Failed to fetch etymology data' });
  }
});

// Record reading statistics
router.post('/stats', async (req, res) => {
  try {
    const { sentence_id } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const ua = req.get('User-Agent');

    await Stats.create({
      sentence_id,
      ip,
      ua
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record stats' });
  }
});

module.exports = router;