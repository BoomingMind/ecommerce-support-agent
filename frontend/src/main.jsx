/**
 * Main Entry Point
 * =================
 * React application bootstrapper.
 * Initializes the React tree and mounts it to the DOM.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Import global styles (Tailwind CSS is loaded here)
import "./index.css";

// Import the root App component
import App from "./App.jsx";

/**
 * Mounts the React application to the DOM.
 * - createRoot: New concurrent mode root API (React 18+)
 * - StrictMode: Enables additional development checks in React 18+
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);