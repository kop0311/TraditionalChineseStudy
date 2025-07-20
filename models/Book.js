const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '书籍标题'
    },
    slug: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'URL友好的唯一标识符'
    },
    author: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '作者'
    },
    dynasty: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '朝代'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '书籍简介'
    },
    cover_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '封面图片URL'
    },
    difficulty_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'beginner',
      comment: '难度等级'
    },
    category: {
      type: DataTypes.ENUM('classics', 'poetry', 'philosophy', 'history'),
      defaultValue: 'classics',
      comment: '分类'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '标签数组'
    },
    character_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '总字符数'
    },
    chapter_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '章节数'
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否发布'
    },
    publication_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '发布日期'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序顺序'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '额外元数据'
    }
  }, {
    tableName: 'books',
    timestamps: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['category'] },
      { fields: ['difficulty_level'] },
      { fields: ['is_published'] },
      { fields: ['sort_order'] }
    ]
  });

  // 关联关系
  Book.associate = function(models) {
    Book.hasMany(models.BookChapter, {
      foreignKey: 'book_id',
      as: 'chapters',
      onDelete: 'CASCADE'
    });
    
    Book.hasMany(models.UserProgress, {
      foreignKey: 'book_id',
      as: 'userProgress',
      onDelete: 'CASCADE'
    });
  };

  // 实例方法
  Book.prototype.updateCounts = async function() {
    const chapters = await this.getChapters();
    this.chapter_count = chapters.length;
    
    let totalCharacters = 0;
    for (const chapter of chapters) {
      const sentences = await chapter.getSentences();
      totalCharacters += sentences.reduce((sum, sentence) => {
        return sum + (sentence.simp_text ? sentence.simp_text.length : 0);
      }, 0);
    }
    
    this.character_count = totalCharacters;
    await this.save();
  };

  Book.prototype.publish = async function() {
    this.is_published = true;
    this.publication_date = new Date();
    await this.save();
  };

  Book.prototype.unpublish = async function() {
    this.is_published = false;
    await this.save();
  };

  return Book;
};