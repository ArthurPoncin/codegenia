import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import { TokensProvider } from "@/features/tokens/useTokens.jsx";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TokensProvider>
      <RouterProvider router={router} />
    </TokensProvider>
  </React.StrictMode>
);
