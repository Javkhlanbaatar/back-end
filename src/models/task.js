const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const moment = require('moment');
const Group = require('./group');

class Task extends Model {}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    group_groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: Group,
        key: 'id'
      },
    },
    description: {
      type: DataTypes.STRING,
    },
    starttime: {
      type: DataTypes.DATE,
    },
    endtime: {
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
    modelName: 'task',
    tableName: 'task', 
        freezeTableName: true,
  }
);

Task.belongsTo(Group, {
  foreignKey: 'group_groupId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = Task;
