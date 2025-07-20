const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'xiaoxiao_dushulang',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3308,
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    logging: process.env.NODE_ENV === 'development' ? require('../config/logger').debug : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const Classic = require('./Classic')(sequelize);
const Chapter = require('./Chapter')(sequelize);
const Sentence = require('./Sentence')(sequelize);
const Character = require('./Character')(sequelize);
const User = require('./User')(sequelize);
const Session = require('./Session')(sequelize);
const Stats = require('./Stats')(sequelize);
const Child = require('./Child')(sequelize);
const PracticeSession = require('./PracticeSession')(sequelize);
const CharacterProgress = require('./CharacterProgress')(sequelize);
const AvatarSet = require('./AvatarSet')(sequelize);
const AvatarConfig = require('./AvatarConfig')(sequelize);

// New enhanced models
const Book = require('./Book')(sequelize);
const BookChapter = require('./BookChapter')(sequelize);
const UserProgress = require('./UserProgress')(sequelize);

// 关联定义已移至各模型的 associate 方法中，避免重复关联
// Classic.hasMany(Chapter, { foreignKey: 'classic_id', as: 'chapters' });
// Chapter.belongsTo(Classic, { foreignKey: 'classic_id', as: 'classic' });

// 所有关联都通过各模型的 associate 方法定义，避免重复关联导致的别名冲突
// 移除所有直接关联定义，统一使用 associate 方法管理

// Initialize associations if methods exist
const models = {
  Classic, Chapter, Sentence, Character, User, Session, Stats,
  Child, PracticeSession, CharacterProgress, AvatarSet, AvatarConfig,
  Book, BookChapter, UserProgress
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  Classic,
  Chapter,
  Sentence,
  Character,
  User,
  Session,
  Stats,
  Child,
  PracticeSession,
  CharacterProgress,
  AvatarSet,
  AvatarConfig,
  Book,
  BookChapter,
  UserProgress
};