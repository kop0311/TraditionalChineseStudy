const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Classic = sequelize.define('Classic', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    slug: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    author: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    dynasty: {
      type: DataTypes.STRING(32),
      allowNull: true
    }
  }, {
    tableName: 'classics',
    timestamps: false
  });

  return Classic;
};