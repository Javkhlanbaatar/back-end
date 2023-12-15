const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const Task = require("./task");

class TaskFiles extends Model {}

TaskFiles.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    taskid: {
      type: DataTypes.INTEGER,
      references: {
        model: Task,
        key: 'id'
      },
    },
    filename: {
      type: DataTypes.STRING
    },
    filesize: {
      type: DataTypes.INTEGER
    },
    filelink: {
      type: DataTypes.STRING
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
      type: DataTypes.DATE
    },
  },
  {
    sequelize: db,
    modelName: 'taskfiles',
    tableName: 'taskfiles', 
        freezeTableName: true,
  }
);

TaskFiles.belongsTo(Task, {
  foreignKey: 'taskid',
  targetKey: 'id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = TaskFiles;
