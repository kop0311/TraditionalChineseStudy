// Re-export models for Next.js API routes
// This ensures proper TypeScript support and module resolution

import { 
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
  UserProgress,
} from '../legacy-nodejs-backend/models';

export {
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
  UserProgress,
};

// Initialize database connection for Next.js API routes
export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Unable to connect to database:', error);
    return false;
  }
}

export default {
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
  UserProgress,
  initializeDatabase,
};