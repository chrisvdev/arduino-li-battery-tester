import React from "react";
import BatteryDetail from "../components/BatteryDetail";
//import { useRef } from "react";
import Container from "react-bootstrap/esm/Container";
import Button from "react-bootstrap/esm/Button";

const Battery = () => {
  const componentRef = React.createRef();
  const ToRender = React.forwardRef((props, ref) => (
    <BatteryDetail ref={ref} />
  ));
  return (
    <Container>
      <ToRender ref={componentRef} />
    </Container>
  );
};

export default Battery;
