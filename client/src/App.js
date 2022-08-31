import React from "react";
import Container from "react-bootstrap/esm/Container";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Main from "./containers/main";
import Battery from "./containers/Battery";
import Print from "./containers/Print";
import AllHistory from "./containers/AllHistory";

const App = (props) => {
  return (
    <Container>
      <NavBar />
      <Container className="my-4" />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/bat" element={<Battery />} />
        <Route path="/bat/:id" element={<Battery />} />
        <Route path="/print/:id" element={<Print />} />
        <Route path="/history" element={<AllHistory />} />
      </Routes>
    </Container>
  );
};

App.propTypes = {};

export default App;
