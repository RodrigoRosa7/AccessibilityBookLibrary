import type React from "react";
import type { ReactNode } from "react";
import { Accordion } from "../../../shared/ui/Accordion";
import { VoiceButton } from "../../../components/VoiceButton";
import { SpeechRateButton } from "../../../components/SpeechRateButton";
import { MuteFeedbackButton } from "../../../components/MuteFeedbackButton";
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
  speechRate: number;
  muted: boolean;
  onTypedCommandChange: (value: string) => void;
  onTypedCommandSubmit: (event: React.FormEvent) => void;
  onStart: () => void;
  onStop: () => void;
  onCycleSpeechRate: () => void;
  onToggleMute: () => void;
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
  speechRate,
  muted,
  onTypedCommandChange,
  onTypedCommandSubmit,
  onStart,
  onStop,
  onCycleSpeechRate,
  onToggleMute,
}: VoiceAssistantPanelProps) {
  return (
    <div className={styles.panel} aria-label="Assistente de voz global">
      <div className={styles.header}>
        <h3 style={{ fontSize: "13px", margin: 0 }}>Assistente de voz</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <VoiceButton
            isListening={isListening}
            isSpeaking={isSpeaking}
            isSupported={isSupported}
            onStart={onStart}
            onStop={onStop}
          />
          <SpeechRateButton
            speechRate={speechRate}
            onCycle={onCycleSpeechRate}
          />
          <MuteFeedbackButton muted={muted} onToggle={onToggleMute} />
        </div>
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
            <AppButton
              type="submit"
              variant="primary"
              aria-label="Executar comando"
              className={styles.submitButton}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </AppButton>
          </div>
        </form>
      </Accordion>

      <div
        role={
          muted
            ? undefined
            : feedbackSeverity === "critical"
              ? "alert"
              : "status"
        }
        aria-live={
          muted
            ? "off"
            : feedbackSeverity === "critical"
              ? "assertive"
              : "polite"
        }
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
