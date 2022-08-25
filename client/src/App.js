import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Status from "./components/Status";

const App = (props) => {
  return (
    <Container>
      <Row>
        <Col>
          <Status />
        </Col>
        <Col xs lg="4"></Col>
      </Row>
    </Container>
  );
};

App.propTypes = {};

export default App;
