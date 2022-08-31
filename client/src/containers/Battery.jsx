import React from "react";
import BatteryDetail from "../components/BatteryDetail";
//import { useRef } from "react";
import Container from "react-bootstrap/esm/Container";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import { Link, useParams } from "react-router-dom";
import isInt from "validator/es/lib/isInt";
import { useState } from "react";

const Battery = () => {
  const componentRef = React.createRef();
  const [mAh, setMAh] = useState(0);
  return (
    <Container>
      <BatteryDetail />
      <Form>
        <Form.Group>
          <Form.Label>
            If you want to print with the nominal mAh input them here
          </Form.Label>
          <Form.Control
            placeholder="A valid input is a positive number..."
            ref={componentRef}
            onChange={(e) => {
              const value = componentRef.current.value;
              value.length
                ? isInt(value, { min: 1 })
                  ? setMAh(parseInt(value))
                  : setMAh(-1)
                : setMAh(0);
            }}
          />
          <Form.Text muted style={mAh >= 0 ? { display: "none" } : {}}>
            PAY ATTENTION! 👉🏻 A valid input is a positive number...
          </Form.Text>
          <Button style={mAh < 0 ? { display: "none" } : {}}>
            <Link
              to={`/print/${useParams().id}${mAh ? `/${mAh}` : ""}`}
              style={{ textDecoration: "none" }}
              className="text-white"
            >
              Print
            </Link>
          </Button>
        </Form.Group>
      </Form>
    </Container>
  );
};

export default Battery;
