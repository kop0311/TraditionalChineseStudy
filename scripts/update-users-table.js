const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateUsersTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'xiaodaode',
    charset: 'utf8mb4'
  });

  console.log('Connected to database for users table update');

  try {
    // 添加新字段到users表
    const alterQueries = [
      "ALTER TABLE users ADD COLUMN name VARCHAR(100)",
      "ALTER TABLE users ADD COLUMN phone VARCHAR(20)",  
      "ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      "ALTER TABLE users MODIFY COLUMN role ENUM('admin','parent','child') DEFAULT 'parent'"
    ];

    for (const query of alterQueries) {
      try {
        await connection.execute(query);
        console.log('Executed:', query.substring(0, 50) + '...');
      } catch (error) {
        if (!error.message.includes('Duplicate column name')) {
          console.log('Query result:', error.message);
        }
      }
    }

    console.log('Users table update completed successfully');

  } catch (error) {
    console.error('Error during update:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  updateUsersTable().catch(err => {
    console.error('Update failed:', err);
    process.exit(1);
  });
}

module.exports = updateUsersTable;