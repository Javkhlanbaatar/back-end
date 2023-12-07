const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const moment = require('moment');

class Users extends Model {}

Users.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true, // Add unique constraint
      allowNull:false
    },
    firstname: {
      type: DataTypes.STRING,
    },
    lastname: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    phonenumber: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "User",
    },
    friendCount: {
      type: DataTypes.INTEGER,
      defaultValue:0
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
    modelName: 'users',
    freezeTableName: true,
    tableName:'users'
  }
);

module.exports = Users;
