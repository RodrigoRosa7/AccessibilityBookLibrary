import { Button } from "@primer/react";
import { useEffect, useRef, useState } from "react";

const VOICE_FEEDBACK_EVENT = "voice-feedback:update";

interface FeedbackEventDetail {
  text?: string;
  severity?: string;
  isSpeaking?: boolean;
}

export function VoiceFeedbackBanner() {
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearDismissTimeout() {
      if (!timeoutRef.current) {
        return;
      }

      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    function handleFeedbackEvent(event: Event) {
      const detail =
        (event as CustomEvent<FeedbackEventDetail>).detail ?? {};
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
        <p style={{ fontWeight: 600, margin: 0 }}>
          Assistente de voz ({speakingState})
        </p>
        <p style={{ margin: 0 }}>{message}</p>
      </div>
      <Button
        variant="invisible"
        onClick={() => setIsVisible(false)}
        aria-label="Ocultar mensagem do assistente de voz"
      >
        Fechar
      </Button>
    </section>
  );
}
