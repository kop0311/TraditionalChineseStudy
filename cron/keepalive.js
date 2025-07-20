#!/usr/bin/env node

// Keep-alive script for shared hosting
// Run this via cron every 10 minutes to prevent the Node.js process from being killed

const http = require('http');
const https = require('https');

const config = {
  // Change this to your actual domain when deployed
  host: process.env.KEEPALIVE_HOST || 'localhost',
  port: process.env.PORT || 3000,
  path: '/ping',
  timeout: 10000 // 10 seconds timeout
};

function makeRequest() {
  const protocol = config.host === 'localhost' ? http : https;
  const port = config.host === 'localhost' ? config.port : (process.env.NODE_ENV === 'production' ? 443 : 80);
  
  const options = {
    hostname: config.host,
    port: port,
    path: config.path,
    method: 'GET',
    timeout: config.timeout,
    headers: {
      'User-Agent': 'XiaoDaoDeKeepAlive/1.0'
    }
  };

  const req = protocol.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const timestamp = new Date().toISOString();
      if (res.statusCode === 200) {
        console.log(`[${timestamp}] Keep-alive successful: ${res.statusCode}`);
        try {
          const response = JSON.parse(data);
          console.log(`[${timestamp}] Server uptime: ${Math.round(response.uptime)}s`);
        } catch (e) {
          console.log(`[${timestamp}] Response: ${data.substring(0, 100)}`);
        }
        process.exit(0);
      } else {
        console.error(`[${timestamp}] Keep-alive failed: ${res.statusCode}`);
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Keep-alive error:`, error.message);
    
    // If it's a connection error, the app might be down
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error(`[${timestamp}] App appears to be down. You may need to restart it.`);
      process.exit(2);
    }
    
    process.exit(1);
  });

  req.on('timeout', () => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Keep-alive timeout`);
    req.destroy();
    process.exit(1);
  });

  req.end();
}

// Add some randomness to avoid all instances hitting at the same time
const delay = Math.floor(Math.random() * 30000); // 0-30 seconds
setTimeout(makeRequest, delay);