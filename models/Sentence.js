const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sentence = sequelize.define('Sentence', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chapter_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seq_no: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    simp: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    trad: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    pinyin_json: {
      type: DataTypes.JSON,
      allowNull: true
    },
    youtube_id: {
      type: DataTypes.STRING(16),
      allowNull: true
    }
  }, {
    tableName: 'sentences',
    timestamps: false
  });

  return Sentence;
};