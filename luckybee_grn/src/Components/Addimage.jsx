import React from "react";
import "react-slideshow-image/dist/styles.css";
import Button from "react-bootstrap/Button";
import Camera, { FACING_MODES, IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

function Addimage({
  images,
  image1,
  openView,
  image2,
  image3,
  image4,
  handleTakePhoto,
  changeimage,
  frontButtonVisible,
  backButtonVisible,
  rightButtonVisible,
  leftButtonVisible,
  isCameraOpen,
}) {
  return (
    <>
      <div className="addimages" style={{ display: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            flexDirection: "row",
            gap: "5px",
          }}
        >
          {images.some(
            (image) => image.view === "Front view" && image.image !== null
          ) ? (
            <img
              style={{ width: "100px", height: "100px" }}
              src={image1}
              alt="Taken photo"
            />
          ) : (
            <button
              style={{
                width: "100px",
                height: "100px",
                backgroundColor: "#dddddd",
                color: "black",
                display: frontButtonVisible ? "block" : "none",
              }}
              type="button"
              id="Front view"
              onClick={() => openView("Front view")}
            >
              Front view
            </button>
          )}

          {images.some(
            (image) => image.view === "Back view" && image.image !== null
          ) ? (
            <img
              style={{ width: "100px", height: "100px" }}
              src={image2}
              alt="Taken photo"
            />
          ) : (
            <button
              style={{
                width: "100px",
                height: "100px",
                backgroundColor: "#dddddd",
                color: "black",
                display: backButtonVisible ? "block" : "none",
              }}
              type="button"
              id="Back view"
              onClick={() => openView("Back view")}
            >
              Back view
            </button>
          )}

          {images.some(
            (image) => image.view === "Right view" && image.image !== null
          ) ? (
            <img
              style={{ width: "100px", height: "100px" }}
              src={image3}
              alt="Taken photo"
            />
          ) : (
            <button
              style={{
                width: "100px",
                height: "100px",
                backgroundColor: "#dddddd",
                color: "black",
                display: rightButtonVisible ? "block" : "none",
              }}
              type="button"
              id="Right view"
              onClick={() => openView("Right view")}
            >
              Right view
            </button>
          )}
          {images.some(
            (image) => image.view === "Left view" && image.image !== null
          ) ? (
            <img
              style={{ width: "100px", height: "100px" }}
              src={image4}
              alt="Taken photo"
            />
          ) : (
            <button
              style={{
                width: "100px",
                height: "100px",
                backgroundColor: "#dddddd",
                color: "black",
                display: leftButtonVisible ? "block" : "none",
              }}
              type="button"
              id="Left view"
              onClick={() => openView("Left view")}
            >
              Left view
            </button>
          )}
        </div>

        {isCameraOpen && (
          <div className="cam1">
            <Camera
              onTakePhoto={(dataUri) => handleTakePhoto(dataUri)}
              idealFacingMode={FACING_MODES.ENVIRONMENT}
            />
          </div>
        )}
      </div>

      <div className="addimagess" style={{ marginTop: "5px" }}>
        <button type="button" onClick={changeimage}>
          Add Images
        </button>
      </div>
    </>
  );
}

export default Addimage;
