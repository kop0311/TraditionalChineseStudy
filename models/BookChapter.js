const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookChapter = sequelize.define('BookChapter', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      },
      comment: '所属书籍ID'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '章节标题'
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'URL友好标识符'
    },
    chapter_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '章节序号'
    },
    content_simp: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '简体内容'
    },
    content_trad: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '繁体内容'
    },
    pinyin: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '拼音注音'
    },
    translation: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '翻译'
    },
    commentary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '注释'
    },
    audio_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '音频文件URL'
    },
    video_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '视频文件URL'
    },
    character_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '字符数'
    },
    difficulty_score: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
      comment: '难度评分 0-10'
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否发布'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序顺序'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '标签'
    },
    learning_objectives: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '学习目标'
    },
    key_characters: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '关键字符列表'
    },
    cultural_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '文化背景注释'
    },
    practice_exercises: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '练习题目'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '额外元数据'
    }
  }, {
    tableName: 'book_chapters',
    timestamps: true,
    indexes: [
      { fields: ['book_id'] },
      { fields: ['slug'] },
      { fields: ['chapter_number'] },
      { fields: ['is_published'] },
      { fields: ['sort_order'] },
      { unique: true, fields: ['book_id', 'slug'] },
      { unique: true, fields: ['book_id', 'chapter_number'] }
    ]
  });

  // 关联关系
  BookChapter.associate = function(models) {
    BookChapter.belongsTo(models.Book, {
      foreignKey: 'book_id',
      as: 'book'
    });
    
    BookChapter.hasMany(models.Sentence, {
      foreignKey: 'chapter_id',
      as: 'sentences',
      onDelete: 'CASCADE'
    });
    
    BookChapter.hasMany(models.UserProgress, {
      foreignKey: 'chapter_id',
      as: 'userProgress',
      onDelete: 'CASCADE'
    });
  };

  // 实例方法
  BookChapter.prototype.updateCharacterCount = async function() {
    if (this.content_simp) {
      this.character_count = this.content_simp.replace(/\s+/g, '').length;
      await this.save();
    }
  };

  BookChapter.prototype.extractKeyCharacters = async function() {
    if (!this.content_simp) return [];
    
    // 简单的字符频率分析
    const charMap = {};
    const chars = this.content_simp.replace(/[^\u4e00-\u9fff]/g, ''); // 只保留中文字符
    
    for (const char of chars) {
      charMap[char] = (charMap[char] || 0) + 1;
    }
    
    // 按频率排序，取前20个
    const keyChars = Object.entries(charMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([char, count]) => ({ char, count }));
    
    this.key_characters = keyChars;
    await this.save();
    
    return keyChars;
  };

  BookChapter.prototype.generateSlug = function() {
    if (!this.slug && this.title) {
      // 简单的slug生成
      this.slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
  };

  BookChapter.prototype.publish = async function() {
    this.is_published = true;
    await this.save();
  };

  BookChapter.prototype.unpublish = async function() {
    this.is_published = false;
    await this.save();
  };

  // 钩子
  BookChapter.beforeValidate(async (chapter) => {
    chapter.generateSlug();
    if (chapter.content_simp) {
      chapter.character_count = chapter.content_simp.replace(/\s+/g, '').length;
    }
  });

  return BookChapter;
};