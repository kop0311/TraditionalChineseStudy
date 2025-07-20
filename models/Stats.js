const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Stats = sequelize.define('Stats', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sentence_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    ua: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ts: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'stats',
    timestamps: false
  });

  return Stats;
};