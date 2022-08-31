import React from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Barcode from "react-barcode";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const BatteryDetail = (props) => {
  const { id } = useParams();
  const [pId, setPId] = useState("");
  if (id !== pId && pId !== "") setPId(id);
  const [battery, setBattery] = useState({});
  const [alert, setAlert] = useState({ type: "none", message: "" });
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  useEffect(() => {
    axios
      .get(`http://${document.domain}/battery?id=${id}`, {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "same-origin",
      })
      .then((response) => setBattery(response.data))
      .catch((e) => console.error(e));
  }, [pId]);
  useEffect(() => {
    if (battery.battery && props.print) window.print();
  }, [battery]);
  const del = () => {
    axios
      .delete(`http://${document.domain}/battery?id=${id}`)
      .then((response) => {
        response.data.success
          ? setAlert({ type: "success", message: "Battery deleted!" })
          : setAlert({
              type: "warning",
              message: "Something unknown went wrong...",
            });
      })
      .catch((e) => {
        console.error(e);
        setAlert({
          type: "danger",
          message: "Error deleting the battery, see the console...",
        });
      });
  };
  return (
    <>
      {(() => {
        return battery.battery ? (
          <>
            {props.print ? (
              <>
                <Link
                  to={`/bat/${id}`}
                  style={{ textDecoration: "none" }}
                  className="text-dark"
                >
                  <Barcode
                    value={battery.battery.id}
                    displayValue={false}
                    width={1}
                    height={30}
                  />
                </Link>
                <h6>{`ID: ${battery.battery.id} mAh: ${battery.battery.actualMAH}`}</h6>
              </>
            ) : (
              <>
                <Alert
                  key={alert.type}
                  variant={alert.type}
                  style={alert.type === "none" ? { display: "none" } : {}}
                >
                  {alert.message}
                </Alert>
                <h1>Battery details</h1>
                <h5>{`ID: ${battery.battery.id} mAh: ${battery.battery.actualMAH}`}</h5>
                <Button
                  variant="warning"
                  onClick={handleShow}
                  style={props.print ? { display: "none" } : {}}
                >
                  Delete
                </Button>
                <Modal show={show} onHide={handleClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>Warning!</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    Are you sure about delete this battery?
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="warning" onClick={handleClose}>
                      Don't delete!
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        del();
                        handleClose();
                      }}
                    >
                      Delete!
                    </Button>
                  </Modal.Footer>
                </Modal>
              </>
            )}
          </>
        ) : (
          <h1>No details loaded yet...</h1>
        );
      })()}
    </>
  );
};

export default BatteryDetail;
