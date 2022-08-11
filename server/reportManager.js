const STARTING = "STARTING";
const DENOISE = "DENOISE";
const CHARGING = "CHARGING";
const DISCHARGING = "DISCHARGING";
const FINISHED = "FINISHED";

class ReportManager {
  constructor() {
    this.currentReport = {
      status: "",
      voltage: 0,
      mWLog: [],
    };
    this.lastReport = {};
  }
  addReport(report) {
    this.lastReport = report;
    switch (report.mode) {
      case STARTING:
        this.currentReport.status = STARTING;
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
        this.voltage = report.averageVolt;
        this.mWLog.push(report.mW);
        break;
      case FINISHED:
        break;
      default:
        break;
    }
  }
  getActualMWH() {
    return ((this.currentReport.mWLog.reduce((a, b) => a + b, 0)/60)/60).toFixed(2);
  }
  getStatus() {
    switch (this.currentReport.status) {
      case STARTING:
        return {
          status: STARTING,
        };
      case DENOISE:
        return {
          status: DENOISE,
        };
      case CHARGING:
        return {
          status: CHARGING,
          voltage: this.currentReport.voltage,
        };
      case DISCHARGING:
        return {
            status: DISCHARGING,
            voltage: this.currentReport.voltage,
            mWh: this.getActualMWH(),
        };
      case FINISHED:
        return {
            status: FINISHED,
            mWh: this.getActualMWH(),
        };
      default:
        return this.lastReport;
    }
  }
}

module.exports = new ReportManager();
