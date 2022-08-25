const { DataTypes } = require("sequelize");
const db = require("../db");

const MWLog = db.define(
  "mWLog",
  {
    mWLog: {
      type: DataTypes.FLOAT
    },
  },
  {
    timestamps: false,
  }
);

module.exports = MWLog;
