require("dotenv").config({ path: __dirname + "/.env" });

const UART_PORT = process.env["UART_PORT"];
const BAUD_RATE = parseInt(process.env["BAUD_RATE"]);
const TCP_PORT = parseInt(process.env["PORT"]);

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const reportManager = require("./reportManager");

// Data Base implementation ----------------------------------------------------

const db = require("./db/db");
const Battery = require("./db/models/Battery");
const MWLog = require("./db/models/MWLog");

Battery.hasMany(MWLog);
MWLog.belongsTo(Battery);

db.sync({ force: true });

// server implementation -------------------------------------------------------

const express = require("express");
const server = express();
const cors = require('cors');

server.use(cors());
server.use(express.static("public"));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// server request for the Client -----------------------------------------------

server.use("/", express.static("../client/build"));

// server EndPoints ------------------------------------------------------------

server.get("/status", (req, res) => res.send(reportManager.getStatus()));

server.get("/batteries", async (req, res) => await res.send(Battery.findAll()));

server.get("/battery", async (req, res) => {
  try {
    res.status(200).send({
      battery: await Battery.findOne({ where: { id: req.query.id } }),
      mWLog: await MWLog.findAll({ where: { batteryId: req.query.id } }),
    });
  } catch (e) {
    res.status(404).send(e);
  }
});

server.delete("/battery", async (req, res) => {
  try {
    await Battery.destroy({ where: { id: req.query.id } });
    await MWLog.destroy({ where: { batteryId: req.query.id } });
    res.status(200).send({ success: true });
  } catch (e) {
    res.status(404).send(e);
  }
});

server.listen(TCP_PORT, () =>
  console.log(`Escuchando bajo en puerto ${TCP_PORT}...`)
);

// Serial port Connection ------------------------------------------------------

const arduino = new SerialPort(
  {
    path: UART_PORT,
    baudRate: BAUD_RATE,
  },
  (err) => {
    if (err) {
      console.log("Error: ", err.message);
    }
  }
);

const parser = arduino.pipe(new ReadlineParser({ delimiter: "\r\n" }));

// Logic -----------------------------------------------------------------------

reportManager.suscribeReport(async ({ id, mWLog, actualMAH }) => {
  const battery = await Battery.create({
    id: id,
    actualMAH: actualMAH,
  });
  mWLog.forEach(async (mWLog) => {
    console.log(`AAAArrrrrmamo con : mWLog : ${mWLog} , batteryId : ${battery.id}`);
    const mWL = await MWLog.create({ mWLog: mWLog , batteryId : battery.id });
  });
});

parser.on("data", (data) => reportManager.addReport(JSON.parse(data)));

setInterval(() => {
  console.log(reportManager.getStatus());
}, 1000);
