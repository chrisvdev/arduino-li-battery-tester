import React from "react";
import Container from "react-bootstrap/esm/Container";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BatteryDetail = () => {
  const { id } = useParams();
  const [pId, setPId] = useState("");
  if (id !== pId && pId !== "") setPId(id);
  const [battery, setBattery] = useState({});
  useEffect(() => {
    axios
      .get(`http://${document.domain}/battery?id=${id}`, {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "same-origin",
      })
      .then((response) => setBattery(response.data))
      .catch((e) => console.error(e));
  }, [pId]);
  return (
    <Container>
      {(() => {
        console.log(battery);
        return battery.battery ? (
          <>
          <h1>Battery Details</h1>
          <h5>{`ID: ${battery.battery.id} mAh: ${battery.battery.actualMAH}`}</h5>
          </>
        ) : (
          <h1>No details loaded yet...</h1>
        );
      })()}
    </Container>
  );
};

export default BatteryDetail;
