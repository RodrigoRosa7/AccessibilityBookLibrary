import { useCallback, useState } from "react";
import { useSpeechSynthesis } from "../useSpeechSynthesis";
import type { SpeechSeverity } from "../useSpeechSynthesis";

export type { SpeechSeverity };

export interface UseVoiceFeedbackReturn {
  feedback: string;
  feedbackSeverity: SpeechSeverity;
  voiceError: string;
  isSpeaking: boolean;
  setFeedback: (message: string, severity?: SpeechSeverity) => void;
  setVoiceError: (error: string) => void;
  speakMessage: (message: string, severity?: SpeechSeverity) => void;
  speak: (text: string) => void;
  cancel: () => void;
}

export function useVoiceFeedback(): UseVoiceFeedbackReturn {
  const { speak: synthSpeak, cancel, isSpeaking } = useSpeechSynthesis();
  const [feedback, setFeedbackState] = useState("");
  const [feedbackSeverity, setFeedbackSeverity] = useState<SpeechSeverity>("info");
  const [voiceError, setVoiceErrorState] = useState("");

  const setFeedback = useCallback((message: string, severity: SpeechSeverity = "info") => {
    setFeedbackState(String(message ?? ""));
    setFeedbackSeverity(severity);
  }, []);

  const setVoiceError = useCallback((error: string) => {
    setVoiceErrorState(error);
  }, []);

  const speakMessage = useCallback(
    (message: string, severity: SpeechSeverity = "info") => {
      const normalized = String(message ?? "").trim();
      if (!normalized) return;
      setFeedbackState(normalized);
      setFeedbackSeverity(severity);
      setVoiceErrorState(severity === "critical" ? normalized : "");
      synthSpeak(normalized, { severity });
    },
    [synthSpeak],
  );

  const speak = useCallback(
    (text: string) => {
      synthSpeak(text);
    },
    [synthSpeak],
  );

  return {
    feedback,
    feedbackSeverity,
    voiceError,
    isSpeaking,
    setFeedback,
    setVoiceError,
    speakMessage,
    speak,
    cancel,
  };
}
