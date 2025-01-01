import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ThemeProvider } from "./providers/ThemeProvider";
import "./App.css";

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree, defaultPendingMs: 0 })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
  <ThemeProvider defaultTheme="dark" storageKey="app-theme">
    <RouterProvider router={router} />
  </ThemeProvider>
  // </React.StrictMode>,
);
