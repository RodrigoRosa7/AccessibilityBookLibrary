import { ActionList, Button, Heading, Text } from "@primer/react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";

const navItems = [
  { to: "/home", label: "Início", icon: "🏠" },
  { to: "/books", label: "Livros", icon: "📚" },
  { to: "/cart", label: "Carrinho", icon: "🛒" },
  { to: "/checkout", label: "Pedidos", icon: "📦" },
];

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav
      aria-label="Navegação principal"
      style={{
        borderRight: "1px solid var(--color-border)",
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
              <span style={{ marginRight: 8, fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 500 }}>
                {item.label}
              </span>
            </ActionList.LinkItem>
          ))}
        </ActionList>
      </div>

      <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
        <Text as="p" sx={{ color: "var(--color-muted)", fontSize: 1 }}>
          {user ? `Conectado como ${user.name}` : "Usuário não autenticado"}
        </Text>
        <Button
          className="app-button-secondary"
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
