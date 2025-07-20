const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AvatarSet = sequelize.define('AvatarSet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    api_type: {
      type: DataTypes.ENUM('dicebear', 'ui_avatars', 'avataaars', 'robohash'),
      defaultValue: 'dicebear'
    },
    style: {
      type: DataTypes.STRING(50),
      defaultValue: 'avataaars'
    },
    total_count: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    tableName: 'avatar_sets',
    timestamps: false
  });

  AvatarSet.associate = function(models) {
    AvatarSet.hasMany(models.AvatarConfig, {
      foreignKey: 'set_id',
      as: 'configs'
    });
  };

  return AvatarSet;
};