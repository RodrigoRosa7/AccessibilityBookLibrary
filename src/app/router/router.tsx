import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { Layout } from "../../components/Layout.jsx";
import { LoginPage } from "../../pages/LoginPage.jsx";
import { HomePage } from "../../pages/HomePage.jsx";
import { BooksPage } from "../../pages/BooksPage.jsx";
import { BookDetailsPage } from "../../pages/BookDetailsPage.jsx";
import { CartPage } from "../../pages/CartPage.jsx";
import { CheckoutPage } from "../../pages/CheckoutPage.jsx";
import { useAuth } from "../providers/AuthProvider";

// eslint-disable-next-line react-refresh/only-export-components
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
            { path: "/home", element: <HomePage /> },
            { path: "/books", element: <BooksPage /> },
            { path: "/books/:id", element: <BookDetailsPage /> },
            { path: "/cart", element: <CartPage /> },
            { path: "/checkout", element: <CheckoutPage /> },
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
