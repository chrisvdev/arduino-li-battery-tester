import React from "react";
import Table from "react-bootstrap/Table";
import axios from "axios";
import { useEffect , useState } from "react";

const Status = () => {
  const [st, setSt] = useState({});
  useEffect(() => {
    setInterval(() => {
      axios
        .get(`${document.URL}status/`/*'http://localhost/status/'*/,{
            method: 'GET',
            mode: 'no-cors',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
            withCredentials: true,
            credentials: 'same-origin',
          })
        .then((response) => setSt(response.data))
        .catch((error) => {
          console.error(error);
          setSt({ error: "Error al consultar el estado, vea la consola." });
        });
    }, 1000);
  }, []);

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Battery on current test</th>
        </tr>
        <tr>
          {Object.keys(st)?.map(key=> { return <td>{`${key}`}</td> } )}
        </tr>
      </thead>
      <tbody>
        <tr>
            {Object.keys(st)?.map(key=> { return <td>{`${st[key]}`}</td> } )}
        </tr>
      </tbody>
    </Table>
  );
};

export default Status;
