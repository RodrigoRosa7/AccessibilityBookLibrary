import { useCallback, useMemo, useState } from "react";
import { isVoiceFeedbackMuted } from "./services/voiceMute";

const VOICE_FEEDBACK_EVENT = "voice-feedback:update";

export type SpeechSeverity = "info" | "critical";

export interface SpeakMetadata {
  severity?: SpeechSeverity;
  onEnd?: () => void;
}

export interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string, metadata?: SpeakMetadata) => void;
  cancel: () => void;
}

interface VoiceFeedbackDetail {
  text: string;
  severity: SpeechSeverity;
  isSpeaking: boolean;
}

function getSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.speechSynthesis ?? null;
}

function emitVoiceFeedback(detail: VoiceFeedbackDetail): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(VOICE_FEEDBACK_EVENT, { detail }));
}

export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {},
): UseSpeechSynthesisReturn {
  const { lang = "pt-BR", rate = 1, pitch = 1, volume = 1 } = options;

  const synthesis = useMemo(() => getSynthesis(), []);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isSupported = Boolean(synthesis);

  const speak = useCallback(
    (text: string, metadata: SpeakMetadata = {}) => {
      if (!synthesis || !text) {
        return;
      }

      synthesis.cancel();

      const normalizedText = String(text).trim();
      const severity = metadata.severity ?? "info";

      if (isVoiceFeedbackMuted()) {
        // Mute desliga só a Web Speech API. Banner aria-live ainda recebe
        // a mensagem para o leitor de tela (NVDA) anunciar.
        emitVoiceFeedback({
          text: normalizedText,
          severity,
          isSpeaking: false,
        });
        metadata.onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(normalizedText);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        emitVoiceFeedback({ text: normalizedText, severity, isSpeaking: true });
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        emitVoiceFeedback({
          text: normalizedText,
          severity,
          isSpeaking: false,
        });
        metadata.onEnd?.();
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
    emitVoiceFeedback({ text: "", severity: "info", isSpeaking: false });
  }, [synthesis]);

  return { isSupported, isSpeaking, speak, cancel };
}
