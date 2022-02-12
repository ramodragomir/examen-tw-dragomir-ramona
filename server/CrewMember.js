const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');


const CrewMember = sequelize.define(
  "crewMember",
  {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
      },
      name: {
          type: DataTypes.STRING(),
          validate: {
              len: [5, 50]
          }
      },
      role: {
          type: DataTypes.ENUM,
          values: ["Captain", "Boatswain", "Navigator", "Carpenter"],
      }
  }
)


module.exports = CrewMember;