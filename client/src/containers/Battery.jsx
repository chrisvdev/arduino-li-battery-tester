import React from "react";
import BatteryDetail from "../components/BatteryDetail";
//import { useRef } from "react";
import Container from "react-bootstrap/esm/Container";
import Button from "react-bootstrap/esm/Button";
import { Link, useParams } from "react-router-dom";

const Battery = () => {
  const componentRef = React.createRef();
  const ToRender = React.forwardRef((props, ref) => (
    <BatteryDetail ref={ref} />
  ));
  return (
    <Container>
      <ToRender ref={componentRef} />
      <Button>
        <Link
          to={`/print/${useParams().id}`}
          style={{ textDecoration: "none" }}
          className='text-white'
        >
          Print
        </Link>
      </Button>
    </Container>
  );
};

export default Battery;
