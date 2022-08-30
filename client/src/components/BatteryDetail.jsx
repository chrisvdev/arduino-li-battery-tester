import React from "react";
import Container from "react-bootstrap/esm/Container";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Barcode from "react-barcode";
import axios from "axios";
import { useParams } from "react-router-dom";
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
        console.log(battery);
        return battery.battery ? (
          <>
            <Alert
              key={alert.type}
              variant={alert.type}
              style={alert.type == "none" ? { display: "none" } : {}}
            >
              {alert.message}
            </Alert>
            {!props.print?<h1>Battery Details</h1>:<Link to={`/bat/${id}`}>Battery Details</Link>}
            <Barcode value={battery.battery.id} displayValue={false} />
            <h5>{`ID: ${battery.battery.id} mAh: ${battery.battery.actualMAH}`}</h5>
            <Button variant="warning" onClick={handleShow}>
              Delete
            </Button>
            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Warning!</Modal.Title>
              </Modal.Header>
              <Modal.Body>Are you sure about delete this battery?</Modal.Body>
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
        ) : (
          <h1>No details loaded yet...</h1>
        );
      })()}
    </>
  );
};

export default BatteryDetail;
