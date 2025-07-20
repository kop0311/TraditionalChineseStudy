const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function seedData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3308,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'xiaoxiao_dushulang',
    charset: 'utf8mb4'
  });

  console.log('Connected to database for seeding');

  try {
    // Clear existing data
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE stats');
    await connection.execute('TRUNCATE TABLE sentences');
    await connection.execute('TRUNCATE TABLE chapters');
    await connection.execute('TRUNCATE TABLE classics');
    await connection.execute('TRUNCATE TABLE characters');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Cleared existing data');

    // Load and insert classics data
    const classicsData = [
      { file: 'daodejing.json', slug: 'daodejing' },
      { file: 'sanzijing.json', slug: 'sanzijing' },
      { file: 'dizigui.json', slug: 'dizigui' }
    ];

    for (const classicInfo of classicsData) {
      const dataPath = path.join(__dirname, '..', 'data', classicInfo.file);
      const rawData = await fs.readFile(dataPath, 'utf8');
      const classicData = JSON.parse(rawData);

      // Insert classic
      const [classicResult] = await connection.execute(
        'INSERT INTO classics (slug, title, author, dynasty) VALUES (?, ?, ?, ?)',
        [classicInfo.slug, classicData.classic, classicData.author, classicData.dynasty]
      );
      const classicId = classicResult.insertId;
      console.log(`Inserted classic: ${classicData.classic}`);

      // Insert chapters and sentences
      for (const chapter of classicData.chapters) {
        const [chapterResult] = await connection.execute(
          'INSERT INTO chapters (classic_id, chapter_no, title) VALUES (?, ?, ?)',
          [classicId, chapter.chapter_no, chapter.title]
        );
        const chapterId = chapterResult.insertId;
        console.log(`Inserted chapter: ${chapter.title}`);

        // Insert sentences
        for (const sentence of chapter.sentences) {
          await connection.execute(
            'INSERT INTO sentences (chapter_id, seq_no, simp, trad, pinyin_json, youtube_id) VALUES (?, ?, ?, ?, ?, ?)',
            [
              chapterId,
              sentence.seq,
              sentence.simp,
              sentence.trad,
              JSON.stringify(sentence.pinyin),
              sentence.youtube_id || null
            ]
          );
        }
        console.log(`Inserted ${chapter.sentences.length} sentences for ${chapter.title}`);
      }
    }

    // Load and insert characters data
    const charactersPath = path.join(__dirname, '..', 'data', 'characters.json');
    const charactersData = JSON.parse(await fs.readFile(charactersPath, 'utf8'));

    for (const char of charactersData) {
      await connection.execute(
        'INSERT INTO characters (simp_char, trad_char, stroke_order_json, radical, story_html) VALUES (?, ?, ?, ?, ?)',
        [
          char.simp_char,
          char.trad_char,
          JSON.stringify(char.stroke_order_json),
          char.radical,
          char.story_html
        ]
      );
    }
    console.log(`Inserted ${charactersData.length} characters`);

    console.log('Data seeding completed successfully');

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  seedData().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = seedData;