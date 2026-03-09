import { Heading, Text } from "@primer/react";
import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { Layout } from "../../components/Layout.jsx";
import { LoginPage } from "../../features/auth/LoginPage.jsx";
import { BookDetailsPage } from "../../features/books/BookDetailsPage.jsx";
import { BooksPage } from "../../features/books/BooksPage.jsx";
import { CartPage } from "../../features/cart/CartPage.jsx";
import { CheckoutPage } from "../../features/checkout/CheckoutPage.jsx";
import { useAuth } from "../providers/AuthProvider.jsx";

function HomePage() {
  return (
    <section
      style={{ border: "1px solid #d0d7de", borderRadius: 8, padding: 16 }}
    >
      <Heading as="h2" sx={{ mb: 2 }}>
        Inicio
      </Heading>
      <Text as="p" sx={{ mb: 2 }}>
        Use navegacao por teclado ou voz para explorar o catalogo de livros em
        braille.
      </Text>
      <div>
        Comandos de exemplo: "abrir livros", "ver carrinho", "finalizar compra".
      </div>
    </section>
  );
}

function RequireAuth() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "/home",
            element: <HomePage />,
          },
          {
            path: "/books",
            element: <BooksPage />,
          },
          {
            path: "/books/:id",
            element: <BookDetailsPage />,
          },
          {
            path: "/cart",
            element: <CartPage />,
          },
          {
            path: "/checkout",
            element: <CheckoutPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  },
]);
