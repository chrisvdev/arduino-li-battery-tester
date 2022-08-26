import React from "react";
import NavBar from "./components/NavBar";
import Main from "./containers/main";
import BatteryDetail from "./components/BatteryDetail";
import { Routes, Route } from "react-router-dom";
import Container from "react-bootstrap/esm/Container";

const App = (props) => {
  return (
    <Container>
      <NavBar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/bat" element={<BatteryDetail />} />
        <Route path="/bat/:id" element={<BatteryDetail />} />
      </Routes>
    </Container>
  );
};

App.propTypes = {};

export default App;
