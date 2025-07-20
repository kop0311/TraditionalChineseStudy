const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAvatarConfigToChildren() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'xiaodaode',
    charset: 'utf8mb4'
  });

  console.log('Connected to database for children table update');

  try {
    // 检查 avatar_config_id 字段是否已存在
    const [columns] = await connection.execute(
      'SHOW COLUMNS FROM children LIKE "avatar_config_id"'
    );

    if (columns.length === 0) {
      // 添加 avatar_config_id 字段
      await connection.execute(`
        ALTER TABLE children 
        ADD COLUMN avatar_config_id INT NULL 
        AFTER birth_date,
        ADD FOREIGN KEY (avatar_config_id) REFERENCES avatar_configs(id) ON DELETE SET NULL
      `);
      console.log('Added avatar_config_id column to children table');
    } else {
      console.log('avatar_config_id column already exists in children table');
    }

    console.log('Children table update completed successfully');

  } catch (error) {
    console.error('Error during children table update:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  addAvatarConfigToChildren().catch(err => {
    console.error('Children table update failed:', err);
    process.exit(1);
  });
}

module.exports = addAvatarConfigToChildren;