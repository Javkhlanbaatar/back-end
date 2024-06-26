const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const moment = require('moment');
const Users = require('./users');
const Task = require("./task");

class Blog extends Model {}

Blog.init(
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
    title: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.STRING(10240),
    },
    privacy: {
      type: DataTypes.INTEGER,
    },
    likeCount: {
      type: DataTypes.INTEGER
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
    modelName: 'blog',
    tableName: 'blog', 
        freezeTableName: true,
  }
);

Blog.belongsTo(Users, {
  foreignKey: 'userid',
  targetKey: 'id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = Blog;
