import { Heading, Text } from "@primer/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getGlobalVoiceCommands,
  getPageVoiceGuidance,
  getSessionModalCommands,
} from "../features/contextual/pageVoiceGuidance";
import {
  subscribeVoiceEvent,
  VOICE_EVENT,
} from "../features/voice/services/voiceEvents";

export function VoiceHelpPanel() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const previousPathnameRef = useRef(location.pathname);

  useEffect(() => {
    function openHelpPanel() {
      setIsOpen(true);
    }

    function closeHelpPanel() {
      setIsOpen(false);
    }

    function handleKeydown(event: KeyboardEvent) {
      const activeElement = event.target as HTMLElement | null;
      const tagName = activeElement?.tagName?.toLowerCase();
      const isTypingField =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        activeElement?.isContentEditable === true;

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

    const unsubOpen = subscribeVoiceEvent(VOICE_EVENT.HELP_OPEN, openHelpPanel);
    const unsubClose = subscribeVoiceEvent(
      VOICE_EVENT.MODAL_CLOSE,
      closeHelpPanel,
    );
    window.addEventListener("keydown", handleKeydown);

    return () => {
      unsubOpen();
      unsubClose();
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  useEffect(() => {
    const hasPathChanged = previousPathnameRef.current !== location.pathname;

    if (isOpen && hasPathChanged) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(false);
    }

    previousPathnameRef.current = location.pathname;
  }, [isOpen, location.pathname]);

  const routeSuggestions = useMemo(
    () => getPageVoiceGuidance(location.pathname),
    [location.pathname],
  );

  const globalCommands = useMemo(() => getGlobalVoiceCommands(), []);
  const sessionModalCommands = useMemo(() => getSessionModalCommands(), []);

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
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-help-modal-title"
          className="voice-help-overlay"
          onClick={() => setIsOpen(false)}
          onKeyDown={(event) => { if (event.key === "Escape") setIsOpen(false); }}
        >
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="voice-help-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="voice-help-header">
              <Heading
                as="h3"
                id="voice-help-modal-title"
                style={{ fontSize: 20 }}
              >
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

            <Text as="p" style={{ color: "var(--color-muted)" }}>
              Rota atual: {location.pathname}
            </Text>

            <Text
              as="p"
              style={{ color: "var(--color-muted)", fontSize: "12px" }}
            >
              Atalhos: F2 ou Ctrl+M ligam e desligam o microfone do
              assistente; Ctrl sozinho interrompe a fala; ? abre esta ajuda e
              Esc fecha a modal atual. O botão "Mudo / Falando" no painel
              silencia a fala do app sem afetar os banners — útil quando o
              leitor de tela já está lendo o conteúdo. Também é possível
              alternar por voz com "silenciar feedback" / "silenciar fala"
              e "ativar feedback" / "ativar fala".
            </Text>

            <Text
              as="p"
              style={{ color: "var(--color-muted)", fontSize: "12px" }}
            >
              Saída de áudio (fone P2): a Web Speech API usa sempre o
              dispositivo padrão do sistema. Conecte o fone antes de abrir a
              página ou recarregue após plugar; confira também a saída do
              NVDA em NVDA+Ctrl+S → Audio.
            </Text>

            <section className="voice-help-section">
              <Heading as="h4" style={{ fontSize: "12px" }}>
                Comandos essenciais
              </Heading>
              <div className="command-chips">
                {globalCommands.map((command) => (
                  <span className="command-chip" key={command}>
                    {command}
                  </span>
                ))}
              </div>
            </section>

            <section className="voice-help-section">
              <Heading as="h4" style={{ fontSize: "12px" }}>
                Sessão e modais
              </Heading>
              <div className="command-chips">
                {sessionModalCommands.map((command) => (
                  <span className="command-chip" key={command}>
                    {command}
                  </span>
                ))}
              </div>
            </section>

            <section className="voice-help-section">
              <Heading as="h4" style={{ fontSize: "12px" }}>
                {routeSuggestions.title}
              </Heading>
              <Text
                as="p"
                style={{ color: "var(--color-muted)", fontSize: "12px" }}
              >
                {routeSuggestions.description}
              </Text>
              <div className="command-chips">
                {routeSuggestions.commands.map((command) => (
                  <span className="command-chip" key={command}>
                    {command}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}
