import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider, createTheme } from "@mui/material";
import {  QueryClientProvider } from "react-query";

import { queryClient } from "./queryClient.tsx";
import { SnackbarProvider } from "./contexts/SnackbarContext.tsx";
const theme = createTheme({
  palette: {
    mode: "light",
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SnackbarProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </SnackbarProvider>
  </React.StrictMode>
);
