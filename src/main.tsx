import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";

async function prepare() {
  const { worker } = await import("./mocks/browser.js");
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });

  if (import.meta.env.DEV) {
    const React = await import("react");
    const ReactDOM = await import("react-dom");
    const { default: axe } = await import("@axe-core/react");
    axe(React, ReactDOM, 1000);
  }
}

prepare().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
