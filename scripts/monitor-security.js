#!/usr/bin/env node

/**
 * Security Monitoring Script
 * Monitors rate limiting logs and security events
 */

const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Configure monitoring logger
const monitorLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/security-monitor.log') 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Security monitoring configuration
const config = {
  rateLimitThresholds: {
    critical: 50,  // Block count in 15 minutes
    warning: 20,   // Warning level
    monitor: 5     // Start monitoring
  },
  monitorInterval: 60000, // 1 minute
  logFile: path.join(__dirname, '../logs/app-*.log')
};

// Security event counters
let securityStats = {
  rateLimitBlocks: 0,
  csrfFailures: 0,
  authFailures: 0,
  validationErrors: 0,
  lastResetTime: Date.now()
};

/**
 * Parse log entry for security events
 */
function parseLogEntry(line) {
  try {
    const entry = JSON.parse(line);
    
    // Rate limit violations
    if (entry.message && entry.message.includes('Rate limit exceeded')) {
      securityStats.rateLimitBlocks++;
      return { type: 'rate_limit', severity: 'warning', entry };
    }
    
    // CSRF token failures
    if (entry.message && entry.message.includes('CSRF token mismatch')) {
      securityStats.csrfFailures++;
      return { type: 'csrf_failure', severity: 'critical', entry };
    }
    
    // Authentication failures
    if (entry.message && (entry.message.includes('Login error') || 
                         entry.message.includes('invalid_credentials'))) {
      securityStats.authFailures++;
      return { type: 'auth_failure', severity: 'warning', entry };
    }
    
    // Validation errors
    if (entry.message && entry.message.includes('Validation errors')) {
      securityStats.validationErrors++;
      return { type: 'validation_error', severity: 'info', entry };
    }
    
    return null;
  } catch (error) {
    // Skip non-JSON lines
    return null;
  }
}

/**
 * Analyze security events and trigger alerts
 */
function analyzeSecurityEvents() {
  const timeWindow = 15 * 60 * 1000; // 15 minutes
  const now = Date.now();
  
  // Reset counters every 15 minutes
  if (now - securityStats.lastResetTime > timeWindow) {
    const report = {
      timestamp: new Date().toISOString(),
      window: '15min',
      events: { ...securityStats }
    };
    
    // Check thresholds
    if (securityStats.rateLimitBlocks >= config.rateLimitThresholds.critical) {
      monitorLogger.error('CRITICAL: High rate limit violations detected', report);
    } else if (securityStats.rateLimitBlocks >= config.rateLimitThresholds.warning) {
      monitorLogger.warn('WARNING: Elevated rate limit violations', report);
    }
    
    if (securityStats.csrfFailures > 0) {
      monitorLogger.error('CRITICAL: CSRF attacks detected', report);
    }
    
    if (securityStats.authFailures > 10) {
      monitorLogger.warn('WARNING: High authentication failure rate', report);
    }
    
    // Log summary
    monitorLogger.info('Security monitoring report', report);
    
    // Reset counters
    securityStats = {
      rateLimitBlocks: 0,
      csrfFailures: 0,
      authFailures: 0,
      validationErrors: 0,
      lastResetTime: now
    };
  }
}

/**
 * Monitor the latest log file
 */
function monitorLogFile() {
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(__dirname, `../logs/app-${today}.log`);
  
  if (!fs.existsSync(logFile)) {
    monitorLogger.warn(`Log file not found: ${logFile}`);
    return;
  }
  
  try {
    const stats = fs.statSync(logFile);
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Process recent log entries (last 100 lines)
    const recentLines = lines.slice(-100);
    
    for (const line of recentLines) {
      const event = parseLogEntry(line);
      if (event) {
        monitorLogger.info(`Security event detected: ${event.type}`, {
          type: event.type,
          severity: event.severity,
          ip: event.entry.ip || 'unknown',
          timestamp: event.entry.timestamp
        });
      }
    }
    
    analyzeSecurityEvents();
    
  } catch (error) {
    monitorLogger.error('Error monitoring log file:', error);
  }
}

/**
 * Generate security recommendations
 */
function generateRecommendations() {
  const recommendations = [];
  
  if (securityStats.rateLimitBlocks > config.rateLimitThresholds.warning) {
    recommendations.push({
      type: 'rate_limiting',
      message: 'Consider tightening rate limits or implementing IP blocking',
      priority: 'high'
    });
  }
  
  if (securityStats.csrfFailures > 0) {
    recommendations.push({
      type: 'csrf_protection',
      message: 'CSRF attacks detected - verify token implementation',
      priority: 'critical'
    });
  }
  
  if (securityStats.authFailures > 15) {
    recommendations.push({
      type: 'authentication',
      message: 'High auth failure rate - consider account lockout mechanisms',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

// Main monitoring function
function startMonitoring() {
  monitorLogger.info('Security monitoring started', {
    config,
    pid: process.pid,
    timestamp: new Date().toISOString()
  });
  
  // Monitor every minute
  setInterval(() => {
    monitorLogFile();
    
    // Generate recommendations every 5 minutes
    if (Date.now() % (5 * 60 * 1000) < config.monitorInterval) {
      const recommendations = generateRecommendations();
      if (recommendations.length > 0) {
        monitorLogger.warn('Security recommendations generated', recommendations);
      }
    }
  }, config.monitorInterval);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    monitorLogger.info('Security monitoring stopped');
    process.exit(0);
  });
}

// Export for programmatic use
module.exports = {
  startMonitoring,
  analyzeSecurityEvents,
  generateRecommendations,
  securityStats
};

// Run if called directly
if (require.main === module) {
  startMonitoring();
}