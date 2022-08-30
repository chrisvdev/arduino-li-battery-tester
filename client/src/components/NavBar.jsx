import React from "react";
import Container from "react-bootstrap/esm/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link, useNavigate } from "react-router-dom";
import { TiBatteryCharge } from "react-icons/ti";

const NavBar = () => {
  const ref = React.createRef();
  const navigate = useNavigate();
  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(`/bat/${ref.current.value}`, { replace: true });
  };
  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <Navbar.Brand>
          <TiBatteryCharge style={{ height: "2rem", width: "2rem" }} />{" "}
          <Link to="/" className="text-dark" style={{ textDecoration: "none" }}>
            A.L.B.T.
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            <Nav.Link>
              <Link
                to="/history"
                className="text-secondary"
                style={{ textDecoration: "none" }}
              >
                History
              </Link>
            </Nav.Link>
          </Nav>
          <Form className="d-flex" onSubmit={handleSubmit}>
            <Form.Control
              type="search"
              placeholder="Search battery"
              className="me-2"
              aria-label="Search"
              ref={ref}
            />
            <Button variant="outline-success" type="submit">
              Search
            </Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
