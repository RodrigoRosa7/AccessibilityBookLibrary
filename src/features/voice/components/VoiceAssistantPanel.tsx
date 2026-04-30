import type React from "react";
import type { ReactNode } from "react";
import { Accordion } from "../../../shared/ui/Accordion.jsx";
import { VoiceButton } from "../../../components/VoiceButton.jsx";
import { AppButton } from "../../../shared/ui/AppButton";
import type { SpeechSeverity } from "../useSpeechSynthesis";
import styles from "./VoiceAssistantPanel.module.css";

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
    <div className={styles.panel} aria-label="Assistente de voz global">
      <div className={styles.header}>
        <h3 style={{ fontSize: "13px", margin: 0 }}>Assistente de voz</h3>
        <VoiceButton
          isListening={isListening}
          isSpeaking={isSpeaking}
          isSupported={isSupported}
          onStart={onStart}
          onStop={onStop}
        />
      </div>

      <Accordion
        className={styles.accordion}
        titleComponent={(summaryId: string): ReactNode => (
          <span id={summaryId} style={{ fontSize: "13px" }}>
            {isListening ? "Ouvindo…" : isSpeaking ? "Falando…" : "Em espera"}
          </span>
        )}
        summaryClassName={styles.summary}
        chevronClassName={styles.chevron}
        bodyClassName={styles.body}
        contentClassName={styles.content}
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

        <form className={styles.commandFallback} onSubmit={onTypedCommandSubmit}>
          <label htmlFor="voice-command-input" className={styles.commandLabel}>
            Se a voz falhar, digite um comando
          </label>
          <div className={styles.commandRow}>
            <input
              id="voice-command-input"
              type="text"
              className={styles.commandInput}
              placeholder='Ex.: "abrir livros"'
              value={typedCommand}
              onChange={(event) => onTypedCommandChange(event.target.value)}
            />
            <AppButton type="submit" variant="primary">
              Executar
            </AppButton>
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
