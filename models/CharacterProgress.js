const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CharacterProgress = sequelize.define('CharacterProgress', {
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
    character_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'characters',
        key: 'id'
      }
    },
    practice_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    mastery_level: {
      type: DataTypes.ENUM('beginner', 'practicing', 'mastered'),
      defaultValue: 'beginner'
    },
    last_practiced_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    total_strokes_written: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    correct_strokes_written: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'character_progress',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['child_id', 'character_id']
      }
    ]
  });

  CharacterProgress.associate = function(models) {
    CharacterProgress.belongsTo(models.Child, {
      foreignKey: 'child_id',
      as: 'child'
    });
    
    CharacterProgress.belongsTo(models.Character, {
      foreignKey: 'character_id',
      as: 'character'
    });
  };

  return CharacterProgress;
};