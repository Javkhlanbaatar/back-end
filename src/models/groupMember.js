const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const moment = require('moment');
const Users = require('./users');
const Group = require('./group');
class GroupMember extends Model {}

GroupMember.init(
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
    groupid: {
      type: DataTypes.INTEGER,
      references: {
        model: Group,
        key: 'id'
      },
    },
    role: {
      type: DataTypes.INTEGER,
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
    modelName: 'groupmember',
    tableName: 'groupmember', 
        freezeTableName: true,
  }
);

GroupMember.belongsTo(Users, {
  foreignKey: 'userid',
  targetKey: 'id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
GroupMember.belongsTo(Group, {
  foreignKey: 'groupid',
  targetKey: 'id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = GroupMember;
