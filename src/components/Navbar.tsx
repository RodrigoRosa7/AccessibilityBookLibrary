import { ActionList, Heading, Text } from "@primer/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { to: "/home", label: "Início", icon: "🏠" },
  { to: "/books", label: "Livros", icon: "📚" },
  { to: "/cart", label: "Carrinho", icon: "🛒" },
  { to: "/checkout", label: "Pedidos", icon: "📦" },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
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
      <Heading as="h2" style={{ fontSize: 16 }}>
        Livraria online
      </Heading>

      <div style={{ marginTop: 16 }}>
        <ActionList>
          {navItems.map((item) => (
            <ActionList.LinkItem
              key={item.to}
              href={item.to}
              aria-current={
                location.pathname === item.to
                  ? ("page" as const)
                  : undefined
              }
              onClick={(event) => {
                event.preventDefault();
                navigate(item.to);
              }}
            >
              <span style={{ marginRight: 8, fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 500 }}>
                {item.label}
              </span>
            </ActionList.LinkItem>
          ))}
        </ActionList>
      </div>

      <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
        <Text as="p" style={{ color: "var(--color-muted)", fontSize: "12px" }}>
          {user ? `Conectado como ${user.name}` : "Usuário não autenticado"}
        </Text>
        <button
          type="button"
          className="interactive-button cart-indicator-button app-button-secondary"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
