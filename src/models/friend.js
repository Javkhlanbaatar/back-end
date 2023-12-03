const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const moment = require('moment');
const Users = require('./users');

class Friend extends Model {}

Friend.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userid: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: 'id'
      },
    },
    friendid: {
        type: DataTypes.INTEGER,
        references: {
          model: Users,
          key: 'id'
        },
    },
    time: {
      type: DataTypes.DATE,
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
    modelName: 'friend',
    tableName: 'friend', 
    freezeTableName: true,
  }
);

Friend.belongsTo(Users, {
  foreignKey: 'userid',
  targetKey: 'id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = Friend;
