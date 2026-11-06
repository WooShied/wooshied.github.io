import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/unbounded";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/martian-mono";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/site.css";
import "./styles/playground.css";
import "./styles/workbench.css";
import App from "./App";

// Lets CSS hide reveal-on-scroll elements only when JavaScript is running.
document.documentElement.classList.add("js");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
