const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const moment = require('moment');
const Blog = require('./blog');

class Upload extends Model {}

Upload.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    blog_blogId: {
      type: DataTypes.INTEGER,
      references: {
        model: Blog,
        key: 'id'
      },
    },
    filename: {
      type: DataTypes.STRING,
    },
    path: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.INTEGER,
    },
    mimetype: {
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
    modelName: 'upload',
    tableName: 'upload',
    freezeTableName: true,
  }
);

Upload.belongsTo(Blog, {
  foreignKey: 'blog_blogId',
  targedKey:'id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = Upload;
