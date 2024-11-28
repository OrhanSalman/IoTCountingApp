import React, { useState } from "react";
import { Spin } from "antd";

const LoadingOverlay = () => {
  const [tip, setTip] = useState("Laden...");
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(5px)",
      }}
    >
      <Spin size="large" fullscreen tip={tip} />
    </div>
  );
};

export default LoadingOverlay;

// ganz unten mit loading timer
// kannst du in die dispatches einbauen, einen neuen wert, der besagt, ob die fetch fertig ist
// setzt ein maximalwert von z.B. 10, pro fetch eine also.
// und hier dann das loading eben auf den zählwert setzen
// inklusive label

// https://ant.design/components/spin
