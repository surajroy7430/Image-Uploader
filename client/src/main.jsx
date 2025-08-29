import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { FileProvider } from "./context/FileContext.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <Router>
    <AuthProvider>
      <FileProvider>
        <App />
      </FileProvider>
    </AuthProvider>
  </Router>
);
