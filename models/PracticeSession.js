const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PracticeSession = sequelize.define('PracticeSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    child_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'children',
        key: 'id'
      }
    },
    sentence_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sentences',
        key: 'id'
      }
    },
    practice_type: {
      type: DataTypes.ENUM('reading', 'pinyin', 'writing'),
      allowNull: false
    },
    started_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_strokes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    correct_strokes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    time_spent_seconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'practice_sessions',
    timestamps: false
  });

  PracticeSession.associate = function(models) {
    PracticeSession.belongsTo(models.Child, {
      foreignKey: 'child_id',
      as: 'child'
    });
    
    PracticeSession.belongsTo(models.Sentence, {
      foreignKey: 'sentence_id',
      as: 'sentence'
    });
  };

  return PracticeSession;
};