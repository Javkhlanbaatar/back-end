const { DataTypes, Model } = require("sequelize");
const db = require("../services/database");
const moment = require("moment");
const Group = require("./group");

class GroupPoster extends Model {}

GroupPoster.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    groupid: {
      type: DataTypes.INTEGER,
      references: {
        model: Group,
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
    modelName: 'groupposter',
    tableName: 'groupposter', 
        freezeTableName: true,
  }
);

GroupPoster.belongsTo(Group, {
  foreignKey: 'groupid',
  targetKey: 'id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = GroupPoster;
