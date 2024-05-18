const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const Blogs = require('./blog');

class BlogFiles extends Model {}

BlogFiles.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    blogid: {
      type: DataTypes.INTEGER,
      references: {
        model: Blogs,
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
      type: DataTypes.STRING(511)
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
    modelName: 'blogfiles',
    tableName: 'blogfiles', 
        freezeTableName: true,
  }
);

BlogFiles.belongsTo(Blogs, {
  foreignKey: 'blogid',
  targetKey: 'id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = BlogFiles;
