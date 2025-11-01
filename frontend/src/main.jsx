// main.jsx
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "./store/index";
import "./app.css"
const App = lazy(() => import("./App"));

const container = document.getElementById("root");

// ✅ Only create root once
const root = createRoot(container);

root.render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <App />
          <Toaster
            toastOptions={{
              position: "top-right",
              style: {
                background: "#283046",
                color: "white",
              },
            }}
          />
        </Suspense>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
