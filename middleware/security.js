const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const logger = require('../config/logger');

// Environment variable validation
const validateEnvironment = () => {
  const required = ['DB_NAME', 'DB_USER', 'NODE_ENV'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate session secret
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'xiaodaode-secret') {
    logger.warn('SESSION_SECRET not set or using default value. Set a secure session secret.');
  }
  
  logger.info('Environment validation passed');
};

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, URL: ${req.url}`);
    res.status(429).json({ error: message });
  }
});

// Rate limiters
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later'
);

const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many API requests, please try again later'
);

const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  1000, // limit each IP to 1000 requests per windowMs
  'Too many requests, please try again later'
);

// Simple CSRF protection using double submit pattern
const csrfProtection = {
  // Generate CSRF token
  generateToken: (req) => {
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = crypto.randomBytes(32).toString('hex');
    }
    return crypto.createHmac('sha256', req.session.csrfSecret)
      .update(req.sessionID)
      .digest('hex');
  },

  // Middleware to add CSRF token to forms
  addToken: (req, res, next) => {
    res.locals.csrfToken = csrfProtection.generateToken(req);
    next();
  },

  // Middleware to verify CSRF token
  verifyToken: (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }

    const token = req.body._csrf || req.headers['x-csrf-token'];
    const expectedToken = csrfProtection.generateToken(req);

    if (!token || token !== expectedToken) {
      logger.warn(`CSRF token mismatch for IP: ${req.ip}, URL: ${req.url}`);
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
  }
};

// Input validation schemas
const validationSchemas = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .escape()
      .withMessage('Name must be 1-100 characters'),
    body('phone')
      .optional()
      .isMobilePhone('zh-CN')
      .withMessage('Invalid phone number format')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  child: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .escape()
      .withMessage('Child name must be 1-50 characters'),
    body('birthDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Invalid birth date format')
  ]
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', { 
      errors: errors.array(), 
      ip: req.ip, 
      url: req.url 
    });
    
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errorMessages
    });
  }
  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Basic XSS prevention
        sanitized[key] = value
          .replace(/[<>]/g, '')
          .trim();
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

module.exports = {
  validateEnvironment,
  authLimiter,
  apiLimiter,
  generalLimiter,
  csrfProtection,
  validationSchemas,
  handleValidationErrors,
  sanitizeInput,
  securityHeaders
};