import React from "react";
import CanvasJSReact from "../dependences/canvasjs.react";

const WLogChart = (props) => {
  const CanvasJSChart = CanvasJSReact.CanvasJSChart;
  var toRender = <p>No Chart</p>;
  if (props.mWLog) {
    const { mWLog } = props;
    const data = [
      {
        type: "line",
        dataPoints: mWLog.map((log, i) => {
          return { x: i, y: log };
        }),
      },
    ];
    const options = {
      zoomEnabled: true,
      animationEnabled: true,
      title: {
        text: "mWatts per second",
      },
      data: data,
    };
    toRender = <CanvasJSChart options={options} />;
  }
  return toRender;
};

export default WLogChart;
