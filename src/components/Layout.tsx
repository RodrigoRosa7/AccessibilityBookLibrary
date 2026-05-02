import { PageLayout, Text } from "@primer/react";
import { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDarkMode } from "../app/hooks/useDarkMode";
import { useCart } from "../app/providers/CartProvider";
import { GlobalVoiceAssistant } from "./GlobalVoiceAssistant";
import { Navbar } from "./Navbar";
import { RouteVoiceGuidance } from "./RouteVoiceGuidance";
import { VoiceFeedbackBanner } from "./VoiceFeedbackBanner";
import { VoiceHelpPanel } from "./VoiceHelpPanel";
import { VoiceOnboardingDialog } from "./VoiceOnboardingDialog";

export function Layout() {
  const navigate = useNavigate();
  const { items } = useCart();
  const { isDark, toggle } = useDarkMode();

  const cartItemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  return (
    <PageLayout style={{ minHeight: "100vh" }}>
      <PageLayout.Pane position="start">
        <Navbar />
      </PageLayout.Pane>

      <PageLayout.Content style={{ padding: 16 }}>
        <header className="app-header-row" style={{ marginBottom: 16 }}>
          <div>
            <Text as="p" style={{ color: "var(--color-muted)" }}>
              Demonstração acadêmica de acessibilidade com Web Speech API
            </Text>
          </div>

          <div className="app-actions-row">
            <button
              type="button"
              className="interactive-button dark-mode-toggle"
              onClick={toggle}
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
              aria-pressed={isDark}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isDark ? (
                  <path
                    d="M12 3v1m0 16v1M4.22 4.22l.71.71m12.02 12.02.71.71M3 12h1m16 0h1M4.93 19.07l.71-.71M18.36 5.64l.71-.71M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>

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
        <VoiceFeedbackBanner />
        <RouteVoiceGuidance />
        <Outlet />
        <GlobalVoiceAssistant />
        <VoiceOnboardingDialog />
      </PageLayout.Content>
    </PageLayout>
  );
}
