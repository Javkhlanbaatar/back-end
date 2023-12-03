const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const moment = require('moment');
const Task = require('./task');
const Blog = require('./blog')
class TaskReport extends Model {}

TaskReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_taskId: {
      type: DataTypes.INTEGER,
      references: {
        model: Task,
        key: 'id'
      },
    },
    blog_blogId: {
        type: DataTypes.INTEGER,
        references: {
          model: Blog,
          key: 'id'
        },
    },
    reply: {
      type: DataTypes.STRING,
    },
    grade: {
      type: DataTypes.FLOAT,
    },
    sentDate: {
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
    modelName: 'taskreport',
    tableName: 'taskreport', 
        freezeTableName: true,
  }
);

TaskReport.belongsTo(Task, {
  foreignKey: 'task_taskId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
TaskReport.belongsTo(Blog, {
    foreignKey: 'blog_blogId',
    targetKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
module.exports = TaskReport;
