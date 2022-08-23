const { DataTypes } = require("sequelize");
const db = require("../db");

const mWLog = db.define("mWLog", {
  mWLog: {
    type: DataTypes.FLOAT.UNSIGNED,
    allowNull: false,
  },
});

module.exports = mWLog;
