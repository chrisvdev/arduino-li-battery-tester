import React from "react";
import Container from "react-bootstrap/esm/Container";
import BatteryDetail from "../components/BatteryDetail";

const Print = () => {
  return (
    <Container>
      <BatteryDetail print={true} />
    </Container>
  );
};

export default Print;
