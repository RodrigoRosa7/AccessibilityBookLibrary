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
    <section className="app-surface-card app-stack-sm">
      <Heading as="h2" sx={{ mb: 2 }}>
        Início
      </Heading>
      <Text as="p" sx={{ mb: 2 }}>
        Use navegação por teclado ou voz para explorar o catálogo de livros.
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

export const appRouter = createBrowserRouter(
  [
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
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
