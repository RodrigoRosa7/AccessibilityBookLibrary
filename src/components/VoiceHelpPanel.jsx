import { Heading, Text } from "@primer/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const GLOBAL_UI_COMMANDS = [
  "abrir livros",
  "abrir carrinho",
  "finalizar compra",
  "voltar para início",
  "me ajude",
  "voltar",
];

const SESSION_MODAL_COMMANDS = [
  "fechar modal",
  "fechar ajuda",
  "deslogar",
  "saia do sistema",
];

function getRouteCommandSuggestions(pathname) {
  if (/^\/books\/\d+$/.test(pathname)) {
    return {
      title: "Dicas para detalhes do livro",
      commands: ["adicionar ao carrinho", "ler detalhes", "ler descrição"],
    };
  }

  if (pathname === "/checkout") {
    return {
      title: "Dicas para checkout",
      commands: [
        "continuar comprando",
        "voltar ao carrinho",
        "abrir pedido 3",
        "ler dados do pedido",
        "próximo pedido",
        "pedido anterior",
      ],
    };
  }

  if (pathname === "/books") {
    return {
      title: "Dicas para catálogo",
      commands: [
        "buscar livro interfaces acessíveis",
        "ler resultados da busca",
        "ler próximos resultados",
        "ler resultados anteriores",
        "repetir resultados",
        "abrir detalhes de interfaces acessíveis",
      ],
    };
  }

  if (pathname === "/cart") {
    return {
      title: "Dicas para carrinho",
      commands: [
        "ler itens do carrinho",
        "total do carrinho",
        "finalizar compra",
        "confirmar",
        "cancelar",
        "continuar comprando",
      ],
    };
  }

  return {
    title: "Dicas gerais",
    commands: [
      "abrir livros",
      "abrir carrinho",
      "finalizar compra",
      "voltar para início",
    ],
  };
}

export function VoiceHelpPanel() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function openHelpPanel() {
      setIsOpen(true);
    }

    function closeHelpPanel() {
      setIsOpen(false);
    }

    function handleKeydown(event) {
      const activeElement = event.target;
      const tagName = activeElement?.tagName?.toLowerCase();
      const isTypingField =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        activeElement?.isContentEditable;

      if (isTypingField) {
        return;
      }

      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setIsOpen(true);
      }
    }

    window.addEventListener("voice-help:open", openHelpPanel);
    window.addEventListener("app-modal:close", closeHelpPanel);
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("voice-help:open", openHelpPanel);
      window.removeEventListener("app-modal:close", closeHelpPanel);
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const routeSuggestions = useMemo(
    () => getRouteCommandSuggestions(location.pathname),
    [location.pathname],
  );

  return (
    <>
      <button
        type="button"
        className="interactive-button cart-indicator-button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir ajuda de comandos de voz"
      >
        Ajuda de voz
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-help-modal-title"
          className="voice-help-overlay"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="voice-help-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="voice-help-header">
              <Heading as="h3" id="voice-help-modal-title" sx={{ fontSize: 3 }}>
                Comandos de voz
              </Heading>
              <button
                type="button"
                className="interactive-button cart-indicator-button"
                onClick={() => setIsOpen(false)}
              >
                Fechar
              </button>
            </div>

            <Text as="p" sx={{ color: "fg.muted" }}>
              Rota atual: {location.pathname}
            </Text>

            <Text as="p" sx={{ color: "fg.muted", fontSize: 1 }}>
              Atalhos: ? para abrir e Esc para fechar a modal atual.
            </Text>

            <section className="voice-help-section">
              <Heading as="h4" sx={{ fontSize: 1 }}>
                Comandos essenciais
              </Heading>
              <ul className="voice-help-list">
                {GLOBAL_UI_COMMANDS.map((command) => (
                  <li key={command}>
                    <Text as="p">{command}</Text>
                  </li>
                ))}
              </ul>
            </section>

            <section className="voice-help-section">
              <Heading as="h4" sx={{ fontSize: 1 }}>
                Sessão e modais
              </Heading>
              <ul className="voice-help-list">
                {SESSION_MODAL_COMMANDS.map((command) => (
                  <li key={command}>
                    <Text as="p">{command}</Text>
                  </li>
                ))}
              </ul>
            </section>

            <section className="voice-help-section">
              <Heading as="h4" sx={{ fontSize: 1 }}>
                {routeSuggestions.title}
              </Heading>
              <ul className="voice-help-list">
                {routeSuggestions.commands.map((command) => (
                  <li key={command}>
                    <Text as="p">{command}</Text>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}
