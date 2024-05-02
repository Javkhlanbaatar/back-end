const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const Blogs = require("./blog");
const Users = require("./users");

class BlogLikes extends Model {}

BlogLikes.init(
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
        key: "id",
      },
    },
    userid: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: "id"
      },
    },
  },
  {
    sequelize: db,
    modelName: "blogLikes",
    tableName: "blogLikes",
    freezeTableName: true,
  }
);

BlogLikes.belongsTo(Blogs, {
  foreignKey: "blogid",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = BlogLikes;
