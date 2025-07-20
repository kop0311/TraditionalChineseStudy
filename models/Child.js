const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Child = sequelize.define('Child', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    avatar_config_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'avatar_configs',
        key: 'id'
      }
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'children',
    timestamps: false
  });

  Child.associate = function(models) {
    Child.belongsTo(models.User, {
      foreignKey: 'parent_id',
      as: 'parent'
    });
    
    Child.hasMany(models.PracticeSession, {
      foreignKey: 'child_id',
      as: 'practiceSessions'
    });
    
    Child.hasMany(models.CharacterProgress, {
      foreignKey: 'child_id',
      as: 'characterProgress'
    });
    
    Child.belongsTo(models.AvatarConfig, {
      foreignKey: 'avatar_config_id',
      as: 'avatarConfig'
    });
  };

  return Child;
};