const { DataTypes } = require("sequelize");
const db = require("../db");

const MWLog = db.define("mWLog", {
  mWLog: {
    type: DataTypes.FLOAT.UNSIGNED,
    allowNull: false,
  },
});

module.exports = MWLog;
