const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');

const Ship = sequelize.define(
  "ship",
  {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
      },
      name: {
          type: DataTypes.STRING,
          validate: {
              len: [3, 50]
          }
      },
      displacement: {
          type: DataTypes.INTEGER,
          validate: {
              min: 51,
          },
      }
  }
)

module.exports = Ship;