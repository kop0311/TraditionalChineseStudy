const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AvatarConfig = sequelize.define('AvatarConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    set_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'avatar_sets',
        key: 'id'
      }
    },
    avatar_index: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seed: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true
    },
    preview_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'avatar_configs',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['set_id', 'avatar_index']
      }
    ]
  });

  AvatarConfig.associate = function(models) {
    AvatarConfig.belongsTo(models.AvatarSet, {
      foreignKey: 'set_id',
      as: 'avatarSet'
    });
  };

  return AvatarConfig;
};