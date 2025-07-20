const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Character = sequelize.define('Character', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    simp_char: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    trad_char: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    stroke_order_json: {
      type: DataTypes.JSON,
      allowNull: true
    },
    radical: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    story_html: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etymology_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Character evolution data: oracle bone, bronze, seal script'
    }
  }, {
    tableName: 'characters',
    timestamps: false
  });

  return Character;
};