const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAvatarTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'xiaodaode',
    charset: 'utf8mb4'
  });

  console.log('Connected to database for avatar tables creation');

  try {
    // 创建头像套装表
    const avatarSetTable = `
      CREATE TABLE IF NOT EXISTS avatar_sets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        api_type ENUM('dicebear', 'ui_avatars', 'avataaars', 'robohash') DEFAULT 'dicebear',
        style VARCHAR(50) DEFAULT 'avataaars',
        total_count INT DEFAULT 10,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    // 创建头像配置表
    const avatarConfigTable = `
      CREATE TABLE IF NOT EXISTS avatar_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        set_id INT NOT NULL,
        avatar_index INT NOT NULL,
        seed VARCHAR(100) NOT NULL,
        options JSON,
        preview_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (set_id) REFERENCES avatar_sets(id) ON DELETE CASCADE,
        UNIQUE KEY unique_set_index (set_id, avatar_index)
      )
    `;

    await connection.execute(avatarSetTable);
    console.log('Avatar sets table created successfully');

    await connection.execute(avatarConfigTable);
    console.log('Avatar configs table created successfully');

    // 插入默认头像套装
    const defaultSets = [
      {
        name: '可爱卡通',
        description: '适合儿童的可爱卡通风格头像',
        api_type: 'dicebear',
        style: 'avataaars',
        total_count: 10
      },
      {
        name: '小动物',
        description: '各种可爱的小动物头像',
        api_type: 'dicebear', 
        style: 'bottts',
        total_count: 10
      },
      {
        name: '像素风格',
        description: '复古像素风格头像',
        api_type: 'dicebear',
        style: 'pixel-art',
        total_count: 10
      }
    ];

    for (const set of defaultSets) {
      const [result] = await connection.execute(
        'INSERT INTO avatar_sets (name, description, api_type, style, total_count) VALUES (?, ?, ?, ?, ?)',
        [set.name, set.description, set.api_type, set.style, set.total_count]
      );
      
      const setId = result.insertId;
      console.log(`Created avatar set: ${set.name} (ID: ${setId})`);

      // 为每个套装生成10个头像配置
      for (let i = 0; i < set.total_count; i++) {
        const seed = `${set.style}-${setId}-${i}`;
        const options = JSON.stringify({
          backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'][i % 5],
          accessories: ['none', 'prescription01', 'prescription02', 'round', 'sunglasses'][i % 5],
          clothing: ['blazerShirt', 'blazerSweater', 'collarSweater', 'graphicShirt', 'hoodie'][i % 5]
        });
        
        const previewUrl = `https://api.dicebear.com/7.x/${set.style}/svg?seed=${seed}&size=100`;

        await connection.execute(
          'INSERT INTO avatar_configs (set_id, avatar_index, seed, options, preview_url) VALUES (?, ?, ?, ?, ?)',
          [setId, i, seed, options, previewUrl]
        );
      }
      
      console.log(`Generated ${set.total_count} avatar configs for ${set.name}`);
    }

    console.log('Avatar tables and default data created successfully');

  } catch (error) {
    console.error('Error during avatar tables creation:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  addAvatarTables().catch(err => {
    console.error('Avatar tables creation failed:', err);
    process.exit(1);
  });
}

module.exports = addAvatarTables;