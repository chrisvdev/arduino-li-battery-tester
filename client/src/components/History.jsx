import React from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/esm/Container";

const History = () => {
  const update = () => {
    axios
      .get(`${document.URL}batteries/` /*'http://localhost/batteries/'*/, {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "same-origin",
      })
      .then((response) => setHs(response.data))
      .catch((error) => {
        console.error(error);
      });
  };
  const [hs, setHs] = useState([{ noHistory: "Without history yet..." }]);
  useEffect(update, []);
  return (
    <Container>
      <h3>Battery history</h3>
      <Button onClick={update}>Update</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            {Object.keys(hs[0])?.map((key) => {
              return <th>{`${key}`}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {hs.map((battery) => {
            return (
              <tr>
                {Object.keys(battery)?.map((key) => {
                  return <td>{`${battery[key]}`}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};

export default History;
