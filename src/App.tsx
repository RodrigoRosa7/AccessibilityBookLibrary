import { BaseStyles, ThemeProvider } from "@primer/react";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./app/providers/AuthProvider.jsx";
import { CartProvider } from "./app/providers/CartProvider.jsx";
import { appRouter } from "./app/router/router.jsx";

function App() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={appRouter} />
          </CartProvider>
        </AuthProvider>
      </BaseStyles>
    </ThemeProvider>
  );
}

export default App;
