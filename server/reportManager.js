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
        this.voltage = 0;
        this.currentReport.mWLog = [];
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
          percentage: VoltsToPercent(this.currentReport.voltage),
        };
      case DISCHARGING:
        return {
          status: DISCHARGING,
          percentage: VoltsToPercent(this.currentReport.voltage),
          mWh: this.getActualMAH(),
        };
      case FINISHED:
        return {
          status: FINISHED,
          mAh: this.getActualMAH(),
        };
      default:
        return this.lastReport;
    }
  }
}

module.exports = new ReportManager();
