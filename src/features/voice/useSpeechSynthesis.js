import { useCallback, useMemo, useState } from "react";

const VOICE_FEEDBACK_EVENT = "voice-feedback:update";

function getSynthesis() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.speechSynthesis ?? null;
}

function emitVoiceFeedback(detail) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(VOICE_FEEDBACK_EVENT, { detail }));
}

export function useSpeechSynthesis(options = {}) {
  const { lang = "pt-BR", rate = 1, pitch = 1, volume = 1 } = options;

  const synthesis = useMemo(() => getSynthesis(), []);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isSupported = Boolean(synthesis);

  const speak = useCallback(
    (text, metadata = {}) => {
      if (!synthesis || !text) {
        return;
      }

      synthesis.cancel();

      const normalizedText = String(text).trim();
      const severity = String(metadata.severity ?? "info");

      const utterance = new SpeechSynthesisUtterance(normalizedText);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      utterance.onstart = () => {
        setIsSpeaking(true);
        emitVoiceFeedback({
          text: normalizedText,
          severity,
          isSpeaking: true,
        });
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        emitVoiceFeedback({
          text: normalizedText,
          severity,
          isSpeaking: false,
        });
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        emitVoiceFeedback({
          text: normalizedText,
          severity: "critical",
          isSpeaking: false,
        });
      };

      synthesis.speak(utterance);
    },
    [synthesis, lang, rate, pitch, volume],
  );

  const cancel = useCallback(() => {
    if (!synthesis) {
      return;
    }

    synthesis.cancel();
    setIsSpeaking(false);
    emitVoiceFeedback({
      text: "",
      severity: "info",
      isSpeaking: false,
    });
  }, [synthesis]);

  return {
    isSupported,
    isSpeaking,
    speak,
    cancel,
  };
}
