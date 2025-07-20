const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  // First connection to create database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3308,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    charset: 'utf8mb4'
  });

  console.log('Connected to MySQL server');

  // Create database
  await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'xiaoxiao_dushulang'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`Database ${process.env.DB_NAME || 'xiaoxiao_dushulang'} created or already exists`);

  await connection.end();

  // Second connection to the specific database
  const dbConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3308,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'xiaoxiao_dushulang',
    charset: 'utf8mb4'
  });

  // Create tables
  const tables = [
    `CREATE TABLE IF NOT EXISTS classics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(32) UNIQUE,
      title VARCHAR(64),
      author VARCHAR(64),
      dynasty VARCHAR(32)
    )`,
    
    `CREATE TABLE IF NOT EXISTS chapters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      classic_id INT,
      chapter_no INT,
      title VARCHAR(128),
      FOREIGN KEY (classic_id) REFERENCES classics(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS sentences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      chapter_id INT,
      seq_no INT,
      simp TEXT,
      trad TEXT,
      pinyin_json JSON,
      youtube_id VARCHAR(16),
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS characters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      simp_char CHAR(1),
      trad_char CHAR(1),
      stroke_order_json JSON,
      radical VARCHAR(16),
      story_html TEXT,
      INDEX idx_simp_char (simp_char),
      INDEX idx_trad_char (trad_char)
    )`,
    
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      password_hash CHAR(60),
      role ENUM('admin','parent','child') DEFAULT 'parent',
      name VARCHAR(100),
      phone VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS children (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent_id INT NOT NULL,
      name VARCHAR(50) NOT NULL,
      birth_date DATE,
      avatar_url VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS sessions (
      sid CHAR(64) PRIMARY KEY,
      user_id INT,
      expires_at DATETIME,
      INDEX idx_expires_at (expires_at),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sentence_id INT,
      ip VARCHAR(45),
      ua VARCHAR(255),
      ts DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE SET NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS practice_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      child_id INT NOT NULL,
      sentence_id INT NOT NULL,
      practice_type ENUM('reading', 'pinyin', 'writing') NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      score INT DEFAULT 0,
      total_strokes INT DEFAULT 0,
      correct_strokes INT DEFAULT 0,
      time_spent_seconds INT DEFAULT 0,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE CASCADE,
      INDEX idx_child_date (child_id, started_at),
      INDEX idx_child_type (child_id, practice_type)
    )`,
    
    `CREATE TABLE IF NOT EXISTS character_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      child_id INT NOT NULL,
      character_id INT NOT NULL,
      practice_count INT DEFAULT 0,
      mastery_level ENUM('beginner', 'practicing', 'mastered') DEFAULT 'beginner',
      last_practiced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_strokes_written INT DEFAULT 0,
      correct_strokes_written INT DEFAULT 0,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
      UNIQUE KEY unique_child_character (child_id, character_id),
      INDEX idx_child_mastery (child_id, mastery_level)
    )`
  ];

  for (const sql of tables) {
    await dbConnection.execute(sql);
    console.log('Table created successfully');
  }

  // Insert default admin user
  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASS || '123456', 12);

  await dbConnection.execute(
    'INSERT IGNORE INTO users(email, password_hash, role) VALUES (?, ?, ?)',
    ['admin@local', passwordHash, 'admin']
  );
  console.log('Default admin user created');

  await dbConnection.end();
  console.log('Database migration completed successfully');
}

if (require.main === module) {
  createDatabase().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = createDatabase;