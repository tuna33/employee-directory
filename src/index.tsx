import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";

// TODO: only use this if on development mode
import makeServer from "./server";
makeServer();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
