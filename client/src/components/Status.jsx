import React from "react";
import Table from "react-bootstrap/Table";
import axios from "axios";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/esm/Container";

const Status = () => {
  const [st, setSt] = useState({});
  useEffect(() => {
    setInterval(() => {
      axios
        .get(
          `http://${document.domain}/status/` /*'http://localhost/status/'*/,
          {
            method: "GET",
            mode: "no-cors",
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
            withCredentials: true,
            credentials: "same-origin",
          }
        )
        .then((response) => setSt(response.data))
        .catch((error) => {
          console.error(error);
          setSt({ error: "Error al consultar el estado, vea la consola." });
        });
    }, 1000);
  }, []);

  return (
    <Container>
      <h4>Battery on current test...</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            {Object.keys(st)
              ?.filter((key) => key !== "mWLog")
              .map((key) => {
                return <th>{`${key}`}</th>;
              })}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Object.keys(st)
              ?.filter((key) => key !== "mWLog")
              .map((key) => {
                return <td>{`${st[key]}`}</td>;
              })}
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};

export default Status;
