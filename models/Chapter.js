const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Chapter = sequelize.define('Chapter', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    classic_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    chapter_no: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(128),
      allowNull: false
    }
  }, {
    tableName: 'chapters',
    timestamps: false
  });

  return Chapter;
};