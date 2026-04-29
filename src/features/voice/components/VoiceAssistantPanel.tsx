import type React from "react";
import type { ComponentType, ReactNode } from "react";
import { Accordion as AccordionBase } from "../../../shared/ui/Accordion.jsx";
import { VoiceButton } from "../../../components/VoiceButton.jsx";
import type { SpeechSeverity } from "../useSpeechSynthesis";

// Accordion.jsx is untyped; cast to avoid implicit-any errors on its props.
const Accordion = AccordionBase as ComponentType<{
  className?: string;
  titleComponent?: ReactNode;
  summaryClassName?: string;
  chevronClassName?: string;
  bodyClassName?: string;
  contentClassName?: string;
  isOpen?: boolean;
  children?: ReactNode;
}>;

interface VoiceAssistantPanelProps {
  pathname: string;
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  feedback: string;
  feedbackSeverity: SpeechSeverity;
  voiceError: string;
  lastCommand: string;
  transcript: string;
  typedCommand: string;
  onTypedCommandChange: (value: string) => void;
  onTypedCommandSubmit: (event: React.FormEvent) => void;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceAssistantPanel({
  pathname,
  isListening,
  isSpeaking,
  isSupported,
  feedback,
  feedbackSeverity,
  voiceError,
  lastCommand,
  transcript,
  typedCommand,
  onTypedCommandChange,
  onTypedCommandSubmit,
  onStart,
  onStop,
}: VoiceAssistantPanelProps) {
  return (
    <div className="voice-assistant-panel" aria-label="Assistente de voz global">
      <Accordion
        className="voice-assistant-accordion"
        titleComponent={
          <div className="voice-assistant-title-wrapper">
            <h3 style={{ fontSize: "13px", margin: 0 }}>Assistente de voz</h3>
            <div className="voice-assistant-button-container">
              <VoiceButton
                isListening={isListening}
                isSpeaking={isSpeaking}
                isSupported={isSupported}
                onStart={onStart}
                onStop={onStop}
              />
            </div>
          </div>
        }
        summaryClassName="voice-assistant-summary"
        chevronClassName="voice-assistant-chevron"
        bodyClassName="voice-assistant-body"
        contentClassName="voice-assistant-content"
        isOpen={true}
      >
        <p style={{ color: "var(--color-muted)", fontSize: "13px" }}>
          Rota atual: {pathname}
        </p>

        <p style={{ color: "var(--color-muted)", fontSize: "13px" }}>
          Último comando: {lastCommand || transcript || "nenhum"}
        </p>

        <p style={{ color: "var(--color-muted)", fontSize: "13px" }}>
          Estado: {isListening ? "escutando" : "em espera"}
          {isSpeaking ? " e falando" : ""}
        </p>

        {voiceError ? (
          <p style={{ color: "var(--color-danger)", fontSize: "13px" }}>
            {voiceError}
          </p>
        ) : null}

        <form className="voice-command-fallback" onSubmit={onTypedCommandSubmit}>
          <label htmlFor="voice-command-input" className="voice-command-label">
            Se a voz falhar, digite um comando
          </label>
          <div className="voice-command-row">
            <input
              id="voice-command-input"
              type="text"
              className="voice-command-input"
              placeholder='Ex.: "abrir livros"'
              value={typedCommand}
              onChange={(event) => onTypedCommandChange(event.target.value)}
            />
            <button
              type="submit"
              className="app-button-primary voice-command-submit"
            >
              Executar
            </button>
          </div>
        </form>
      </Accordion>

      <div
        role={feedbackSeverity === "critical" ? "alert" : "status"}
        aria-live={feedbackSeverity === "critical" ? "assertive" : "polite"}
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {feedback}
      </div>
    </div>
  );
}
