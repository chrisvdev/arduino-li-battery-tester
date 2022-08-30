const SHA1 = require("crypto-js/sha1");

const STARTING = "STARTING";
const DENOISE = "DENOISE";
const CHARGING = "CHARGING";
const DISCHARGING = "DISCHARGING";
const FINISHED = "FINISHED";
const MAX_VOLTS = 4.25;
const MIN_VOLTS = 2.5;

function VoltsToPercent(Volts) {
  let percent = (Volts - MIN_VOLTS) / (MAX_VOLTS - MIN_VOLTS);
  return parseFloat(
    (
      ((percent < 0 ? (percent = 0) : percent) > 1 ? (percent = 1) : percent) *
      100
    ).toFixed(2)
  );
}

class ReportManager {
  constructor() {
    this.currentReport = {
      batteryID: "",
      status: "",
      voltage: 0,
      mWLog: [],
      reported: false,
    };
    this.lastReport = { noReport: "Tester not connected" };
    this.suscribe = null;
  }
  addReport(report) {
    this.lastReport = report;
    switch (report.mode) {
      case STARTING:
        const d_t = new Date();
        let year = d_t.getFullYear();
        let month = ("0" + (d_t.getMonth() + 1)).slice(-2);
        let day = ("0" + d_t.getDate()).slice(-2);
        let hour = d_t.getHours();
        let minute = d_t.getMinutes();
        this.currentReport.batteryID = `${day}-${month}-${year}_${hour}:${minute}`;
        this.currentReport.batteryID = `${SHA1(this.currentReport.batteryID)
          .toString()
          .slice(0, 10)}-${this.currentReport.batteryID}`;
        this.currentReport.status = STARTING;
        this.voltage = 0;
        this.currentReport.mWLog = [];
        this.currentReport.reported = false;
        break;
      case DENOISE:
        this.currentReport.status = DENOISE;
        break;
      case CHARGING:
        this.currentReport.status = CHARGING;
        this.currentReport.voltage = report.averageVolt;
        break;
      case DISCHARGING:
        this.currentReport.status = DISCHARGING;
        this.currentReport.voltage = report.averageVolt;
        this.currentReport.mWLog.push(report.mW);
        break;
      case FINISHED:
        this.currentReport.status = FINISHED;
        if (this.suscribe && !this.currentReport.reported) {
          this.suscribe({
            id: this.currentReport.batteryID,
            mWLog: this.currentReport.mWLog,
            actualMAH: this.getActualMAH(),
          });
          this.currentReport.reported = true;
        }
        break;
      default:
        break;
    }
  }
  getActualMAH() {
    return parseFloat(
      (
        this.currentReport.mWLog.reduce((a, b) => a + b, 0) /
        60 / // 60 seconds per minute
        60 / // 60 minutes per hour
        3.7
      ) // 3.7 is the nominal voltage of the battery
        .toFixed(2)
    );
  }
  getStatus() {
    const report = { batteryID: this.currentReport.batteryID };
    switch (this.currentReport.status) {
      case STARTING:
        return { ...report, status: STARTING };
      case DENOISE:
        return { ...report, status: DENOISE };
      case CHARGING:
        return {
          ...report,
          status: CHARGING,
          percentage: VoltsToPercent(this.currentReport.voltage),
        };
      case DISCHARGING:
        return {
          ...report,
          status: DISCHARGING,
          percentage: VoltsToPercent(this.currentReport.voltage),
          mAh: this.getActualMAH(),
        };
      case FINISHED:
        return { ...report, status: FINISHED, mAh: this.getActualMAH() };
      default:
        return this.lastReport;
    }
  }
  suscribeReport(cb) {
    if (cb instanceof Function) {
      this.suscribe = cb;
      return true;
    } else return false;
  }
}

module.exports = new ReportManager();
