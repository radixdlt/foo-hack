import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Todo - Re-enable frontend move validation.
// Todo - Turn mech.
// Todo - Draw functionality and alt gif implementation.
// Todo - Ensure that piece movement is consistent (don't update state until component response).
// Todo - Add the alternate final results.
// Todo - Add the rewards / NFT auction mech.
// Todo - Customise board and pieces.
// Todo - Detect if wallet / account is not present.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
