import { Heading, PageLayout, Text } from "@primer/react";
import { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useCart } from "../app/providers/CartProvider.jsx";
import { GlobalVoiceAssistant } from "./GlobalVoiceAssistant.jsx";
import { Navbar } from "./Navbar.jsx";
import { VoiceHelpPanel } from "./VoiceHelpPanel.jsx";

export function Layout() {
  const navigate = useNavigate();
  const { items } = useCart();

  const cartItemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  return (
    <PageLayout sx={{ minHeight: "100vh" }}>
      <PageLayout.Pane position="start" sx={{ width: ["100%", 280] }}>
        <Navbar />
      </PageLayout.Pane>

      <PageLayout.Content sx={{ p: 3 }}>
        <header
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Heading as="h1" sx={{ fontSize: 4 }}>
              Loja Online de Livros em Braille
            </Heading>
            <Text as="p" sx={{ color: "fg.muted" }}>
              Demonstração acadêmica de acessibilidade com Web Speech API
            </Text>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <VoiceHelpPanel />

            <button
              type="button"
              className="interactive-button cart-indicator-button"
              onClick={() => navigate("/cart")}
              aria-label={`Abrir carrinho com ${cartItemCount} item(ns)`}
            >
              <span aria-hidden="true" className="cart-indicator-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 5H5L7.2 14.2C7.3 14.7 7.8 15 8.3 15H17.5C18 15 18.5 14.7 18.6 14.2L20.2 8.2C20.4 7.5 19.9 7 19.2 7H6.2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="19" r="1.5" fill="currentColor" />
                  <circle cx="17" cy="19" r="1.5" fill="currentColor" />
                </svg>
              </span>
              <span>Carrinho</span>
              <span className="cart-indicator-count" aria-live="polite">
                {cartItemCount}
              </span>
            </button>
          </div>
        </header>
        <Outlet />
        <GlobalVoiceAssistant />
      </PageLayout.Content>
    </PageLayout>
  );
}
