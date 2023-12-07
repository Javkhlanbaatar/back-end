const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const Users = require('./users');

class BlogFiles extends Model {}

BlogFiles.init(
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
    file: {
      type: DataTypes.STRING
    }
  },
  {
    sequelize: db,
    modelName: 'blogfiles',
    tableName: 'blogfiles', 
        freezeTableName: true,
  }
);

BlogFiles.belongsTo(Users, {
  foreignKey: 'userid',
  targetKey: 'id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = BlogFiles;
