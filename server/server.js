const UART_PORT = "COM6";
const BAUD_RATE = 115200;
const TCP_PORT = 80;

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const reportManager = require("./reportManager");

// server implementation -------------------------------------------------------
const express = require("express");
const server = express();

server.use(express.static("public"));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get("/status", (req, res) => res.send(reportManager.getStatus()));

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

reportManager.suscribe(({ id, mWLog, actualMAH }) => {});

parser.on("data", (data) => reportManager.addReport(JSON.parse(data)));

setInterval(() => {
  console.log(reportManager.getStatus());
}, 1000);
