import React from "react";
import Main from "./containers/main";
import NavBar from "./components/NavBar";
import { Routes, Route } from "react-router-dom";
import Container from "react-bootstrap/esm/Container";

const App = (props) => {
  return (
    <Container>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route index element={<Main/>}/>
          <Route path="main" element={<Main/>}/>
        </Route>
      </Routes>
    </Container>
  );
};

App.propTypes = {};

export default App;
