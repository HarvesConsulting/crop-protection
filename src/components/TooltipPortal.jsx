import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./HourTimeline.css";

const TooltipPortal = ({ x, y, children }) => {
  const el = document.createElement("div");

  useEffect(() => {
    el.className = "hour-details-tooltip floating-tooltip";
    el.style.position = "fixed";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = "translateX(-50%) translateY(-100%)";
    el.style.zIndex = 9999;
    document.body.appendChild(el);

    return () => {
      el.remove();
    };
  }, [x, y]);

  return ReactDOM.createPortal(children, el);
};

export default TooltipPortal;
