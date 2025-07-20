const express = require('express');
const bcrypt = require('bcrypt');
const { User, Child } = require('../models');
const logger = require('../config/logger');
const { 
  authLimiter, 
  csrfProtection, 
  validationSchemas, 
  handleValidationErrors 
} = require('../middleware/security');
const router = express.Router();

// 注册页面
router.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('auth/register', { 
    title: '家长注册',
    error: req.query.error,
    success: req.query.success
  });
});

// 注册处理
router.post('/register', 
  authLimiter,
  csrfProtection.verifyToken,
  validationSchemas.register,
  handleValidationErrors,
  async (req, res) => {
  try {
    const { email, password, confirmPassword, name, phone } = req.body;
    
    // 验证输入
    if (!email || !password || !name) {
      return res.redirect('/auth/register?error=missing_fields');
    }
    
    if (password !== confirmPassword) {
      return res.redirect('/auth/register?error=password_mismatch');
    }
    
    if (password.length < 6) {
      return res.redirect('/auth/register?error=password_too_short');
    }
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.redirect('/auth/register?error=email_exists');
    }
    
    // 创建用户
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password_hash: passwordHash,
      name,
      phone,
      role: 'parent'
    });
    
    // 自动登录
    req.session.userId = user.id;
    res.redirect('/dashboard?success=registration_complete');
    
  } catch (error) {
    logger.error('Registration error:', error);
    res.redirect('/auth/register?error=server_error');
  }
});

// 登录页面
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { 
    title: '家长登录',
    error: req.query.error
  });
});

// 登录处理
router.post('/login', 
  authLimiter,
  csrfProtection.verifyToken,
  validationSchemas.login,
  handleValidationErrors,
  async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.redirect('/auth/login?error=missing_fields');
    }
    
    const user = await User.findOne({ 
      where: { email, role: ['parent', 'admin'] }
    });
    
    if (!user) {
      return res.redirect('/auth/login?error=invalid_credentials');
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.redirect('/auth/login?error=invalid_credentials');
    }
    
    req.session.userId = user.id;
    
    // 根据角色重定向
    if (user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/dashboard');
    }
    
  } catch (error) {
    logger.error('Login error:', error);
    res.redirect('/auth/login?error=server_error');
  }
});

// 登出
router.post('/logout', 
  csrfProtection.verifyToken,
  (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error:', err);
    }
    res.redirect('/');
  });
});


// 添加孩子
router.post('/children', 
  requireAuth,
  csrfProtection.verifyToken,
  validationSchemas.child,
  handleValidationErrors,
  async (req, res) => {
  try {
    const { name, birthDate } = req.body;
    
    if (!name) {
      return res.redirect('/dashboard?error=child_name_required');
    }
    
    await Child.create({
      parent_id: req.session.userId,
      name,
      birth_date: birthDate || null
    });
    
    res.redirect('/dashboard?success=child_added');
    
  } catch (error) {
    logger.error('Add child error:', error);
    res.redirect('/dashboard?error=server_error');
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