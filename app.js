const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
require('dotenv').config();

const { sequelize } = require('./models');
const { 
  validateEnvironment, 
  generalLimiter, 
  apiLimiter, 
  csrfProtection, 
  sanitizeInput, 
  securityHeaders 
} = require('./middleware/security');
const { 
  errorHandler, 
  notFoundHandler, 
  setupGlobalErrorHandlers 
} = require('./middleware/errorHandler');

// Setup global error handlers
setupGlobalErrorHandlers();

// Validate environment variables on startup
validateEnvironment();

// Create Express app
const app = express();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(__dirname, 'logs', 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Security middleware
app.use(securityHeaders);
app.use(generalLimiter);
app.use(sanitizeInput);

// Helmet security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.tiny.cloud"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["https://www.youtube-nocookie.com"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"]
    }
  }
}));

app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Set charset for all responses
app.use((req, res, next) => {
  res.charset = 'utf-8';
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'xiaodaode-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CSRF protection
app.use(csrfProtection.addToken);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// Make environment variables available to templates
app.locals.CDN_BOOTSTRAP = process.env.CDN_BOOTSTRAP;
app.locals.CDN_HANZI = process.env.CDN_HANZI;
app.locals.CDN_TINYMCE = process.env.CDN_TINYMCE;

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Routes with rate limiting
app.use('/api', apiLimiter, require('./routes/api'));
app.use('/api/avatar', require('./routes/avatar'));
app.use('/admin', require('./routes/admin'));
app.use('/admin', require('./routes/admin-enhanced')); // Enhanced admin routes
app.use('/auth', require('./routes/auth'));
app.use('/', require('./routes/web'));

// Health check
app.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 9001;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`小小读书郎服务器启动成功！`);
      logger.info(`访问地址: http://localhost:${PORT}`);
      logger.info(`管理后台: http://localhost:${PORT}/admin`);
      logger.info(`当前端口: ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
