const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const Task = require("./task");
const Blog = require("./blog");

class TaskAssignment extends Model {}

TaskAssignment.init(
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
        key: "id",
      },
    },
    blogid: {
      type: DataTypes.INTEGER,
      references: {
        model: Blog,
        key: "id",
      },
    },
    grade: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize: db,
    modelName: "task_assignment",
    tableName: "task_assignment",
    freezeTableName: true,
  }
);

TaskAssignment.belongsTo(Task, {
  foreignKey: "taskid",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
TaskAssignment.belongsTo(Blog, {
  foreignKey: "blogid",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = TaskAssignment;
