import React from "react";
import NavBar from "./components/NavBar";
import Main from "./containers/main";
import Battery from "./containers/Battery";
import { Routes, Route } from "react-router-dom";
import Container from "react-bootstrap/esm/Container";

const App = (props) => {
  return (
    <Container>
      <NavBar />
      <Container className="my-4" />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/bat" element={<Battery />} />
        <Route path="/bat/:id" element={<Battery />} />
      </Routes>
    </Container>
  );
};

App.propTypes = {};

export default App;
