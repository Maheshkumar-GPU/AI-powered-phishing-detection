import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@/lib/api-client";
import App from "./App";
import "./index.css";

setBaseUrl("http://localhost:8000");

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
