import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Status from "../components/Status";
import History from "../components/History";

const Main = () => {
  return (
    <Container>
      <Row>
        <Col>
          <Status />
        </Col>
        <Col xs lg="4">
          <History limit={5} />
        </Col>
      </Row>
    </Container>
  );
};

export default Main;
