const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const moment = require('moment');

class Group extends Model {}

Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true, // Add unique constraint
      allowNull:false
    },
    description: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue("createdAt")).format(
          "YYYY/MM/DD HH:mm"
        );
      },
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: db,
    modelName: 'group',
    freezeTableName: true,
    tableName:'group'
  }
);

module.exports = Group;
