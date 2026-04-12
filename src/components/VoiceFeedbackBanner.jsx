import { Button, Text } from "@primer/react";
import { useEffect, useRef, useState } from "react";

const VOICE_FEEDBACK_EVENT = "voice-feedback:update";

export function VoiceFeedbackBanner() {
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    function clearDismissTimeout() {
      if (!timeoutRef.current) {
        return;
      }

      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    function handleFeedbackEvent(event) {
      const detail = event.detail ?? {};
      const nextText = String(detail.text ?? "").trim();
      const nextSeverity = String(detail.severity ?? "info");
      const nextSpeaking = Boolean(detail.isSpeaking);

      setSeverity(nextSeverity);
      setIsSpeaking(nextSpeaking);

      if (nextText) {
        setMessage(nextText);
        setIsVisible(true);
      }

      clearDismissTimeout();

      if (!nextSpeaking && nextSeverity !== "critical") {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 6000);
      }
    }

    window.addEventListener(VOICE_FEEDBACK_EVENT, handleFeedbackEvent);

    return () => {
      window.removeEventListener(VOICE_FEEDBACK_EVENT, handleFeedbackEvent);
      clearDismissTimeout();
    };
  }, []);

  if (!isVisible || !message) {
    return null;
  }

  const role = severity === "critical" ? "alert" : "status";
  const liveMode = severity === "critical" ? "assertive" : "polite";
  const speakingState = isSpeaking ? "falando" : "mensagem finalizada";

  return (
    <section
      className={`voice-feedback-banner voice-feedback-${severity}`}
      role={role}
      aria-live={liveMode}
      aria-atomic="true"
    >
      <div className="voice-feedback-content">
        <Text as="p" sx={{ fontWeight: 600 }}>
          Assistente de voz ({speakingState})
        </Text>
        <Text as="p">{message}</Text>
      </div>
      <Button
        variant="invisible"
        sx={{ color: "var(--color-primary-strong)" }}
        onClick={() => setIsVisible(false)}
        aria-label="Ocultar mensagem do assistente de voz"
      >
        Fechar
      </Button>
    </section>
  );
}
