import { ActionList, Button, Heading, Text } from "@primer/react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider.jsx";

const navItems = [
  { to: "/home", label: "Início" },
  { to: "/books", label: "Livros" },
  { to: "/cart", label: "Carrinho" },
  { to: "/checkout", label: "Pedidos" },
];

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav
      aria-label="Navegação principal"
      style={{
        borderRight: "1px solid #d0d7de",
        padding: 16,
        minHeight: "100%",
      }}
    >
      <Heading as="h2" sx={{ fontSize: 2 }}>
        Livraria online
      </Heading>

      <div style={{ marginTop: 16 }}>
        <ActionList>
          {navItems.map((item) => (
            <ActionList.LinkItem as={NavLink} to={item.to} key={item.to}>
              {item.label}
            </ActionList.LinkItem>
          ))}
        </ActionList>
      </div>

      <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
        <Text as="p" sx={{ color: "fg.muted", fontSize: 1 }}>
          {user ? `Conectado como ${user.name}` : "Usuário não autenticado"}
        </Text>
        <Button
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Sair
        </Button>
      </div>
    </nav>
  );
}
