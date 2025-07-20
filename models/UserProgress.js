const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserProgress = sequelize.define('UserProgress', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '用户ID'
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'books',
        key: 'id'
      },
      comment: '书籍ID'
    },
    chapter_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'book_chapters',
        key: 'id'
      },
      comment: '章节ID'
    },
    character_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'characters',
        key: 'id'
      },
      comment: '汉字ID'
    },
    progress_type: {
      type: DataTypes.ENUM('book', 'chapter', 'character', 'practice'),
      allowNull: false,
      comment: '进度类型'
    },
    status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'mastered'),
      defaultValue: 'not_started',
      comment: '学习状态'
    },
    completion_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
      comment: '完成百分比'
    },
    time_spent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '学习时长（秒）'
    },
    attempts_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '尝试次数'
    },
    correct_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '正确次数'
    },
    last_accessed: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后访问时间'
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '开始时间'
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '完成时间'
    },
    difficulty_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 },
      comment: '用户难度评分 1-5'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '学习笔记'
    },
    streak_days: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '连续学习天数'
    },
    last_streak_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '最后连续学习日期'
    },
    practice_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '练习详细数据'
    },
    learning_path: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '学习路径数据'
    }
  }, {
    tableName: 'user_progress',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['book_id'] },
      { fields: ['chapter_id'] },
      { fields: ['character_id'] },
      { fields: ['progress_type'] },
      { fields: ['status'] },
      { fields: ['last_accessed'] },
      { unique: true, fields: ['user_id', 'book_id', 'chapter_id', 'character_id', 'progress_type'] }
    ]
  });

  // 关联关系
  UserProgress.associate = function(models) {
    UserProgress.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    UserProgress.belongsTo(models.Book, {
      foreignKey: 'book_id',
      as: 'book'
    });
    
    UserProgress.belongsTo(models.BookChapter, {
      foreignKey: 'chapter_id',
      as: 'chapter'
    });
    
    UserProgress.belongsTo(models.Character, {
      foreignKey: 'character_id',
      as: 'character'
    });
  };

  // 类方法
  UserProgress.getOverallStats = async function(userId) {
    const stats = await this.findAll({
      where: { user_id: userId },
      attributes: [
        'progress_type',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('completion_percentage')), 'avg_completion'],
        [sequelize.fn('SUM', sequelize.col('time_spent')), 'total_time']
      ],
      group: ['progress_type', 'status']
    });
    
    return stats;
  };

  UserProgress.getUserStreak = async function(userId) {
    const latest = await this.findOne({
      where: { user_id: userId },
      order: [['last_streak_date', 'DESC']]
    });
    
    if (!latest || !latest.last_streak_date) return 0;
    
    const today = new Date().toDateString();
    const lastDate = latest.last_streak_date.toDateString();
    
    if (today === lastDate) {
      return latest.streak_days;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString()) {
        return latest.streak_days;
      }
    }
    
    return 0;
  };

  // 实例方法
  UserProgress.prototype.updateProgress = async function(completionPercentage, timeSpent = 0) {
    this.completion_percentage = Math.min(100, Math.max(0, completionPercentage));
    this.time_spent += timeSpent;
    this.last_accessed = new Date();
    
    // 更新状态
    if (this.completion_percentage === 0) {
      this.status = 'not_started';
    } else if (this.completion_percentage < 100) {
      this.status = 'in_progress';
      if (!this.started_at) {
        this.started_at = new Date();
      }
    } else {
      this.status = 'completed';
      if (!this.completed_at) {
        this.completed_at = new Date();
      }
    }
    
    await this.save();
    await this.updateStreak();
  };

  UserProgress.prototype.updateStreak = async function() {
    const today = new Date().toDateString();
    const lastDate = this.last_streak_date ? this.last_streak_date.toDateString() : null;
    
    if (lastDate === today) {
      // 今天已经更新过了
      return;
    }
    
    if (!lastDate) {
      // 第一次学习
      this.streak_days = 1;
      this.last_streak_date = today;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate === yesterday.toDateString()) {
        // 连续学习
        this.streak_days += 1;
        this.last_streak_date = today;
      } else {
        // 中断了，重新开始
        this.streak_days = 1;
        this.last_streak_date = today;
      }
    }
    
    await this.save();
  };

  UserProgress.prototype.recordAttempt = async function(isCorrect = false) {
    this.attempts_count += 1;
    if (isCorrect) {
      this.correct_attempts += 1;
    }
    
    this.last_accessed = new Date();
    await this.save();
  };

  UserProgress.prototype.getAccuracyRate = function() {
    if (this.attempts_count === 0) return 0;
    return Math.round((this.correct_attempts / this.attempts_count) * 100);
  };

  UserProgress.prototype.markAsMastered = async function() {
    this.status = 'mastered';
    this.completion_percentage = 100;
    if (!this.completed_at) {
      this.completed_at = new Date();
    }
    await this.save();
  };

  return UserProgress;
};