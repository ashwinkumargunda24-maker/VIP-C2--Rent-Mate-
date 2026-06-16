import React from "react";

const Toast = ({ message, type }) => {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "10px 20px",
        color: "#fff",
        backgroundColor:
          type === "success"
            ? "green"
            : type === "error"
            ? "red"
            : "gray",
        borderRadius: "5px",
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  );
};

export default Toast;