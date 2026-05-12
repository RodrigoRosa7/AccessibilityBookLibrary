import { useCallback, useState } from "react";
import { useSpeechSynthesis } from "../useSpeechSynthesis";
import type { SpeakMetadata, SpeechSeverity } from "../useSpeechSynthesis";

export type { SpeechSeverity };

export const MIN_SPEECH_RATE = 1;
export const MAX_SPEECH_RATE = 3;

function clampRate(rate: number): number {
  if (!Number.isFinite(rate)) return MIN_SPEECH_RATE;
  return Math.max(MIN_SPEECH_RATE, Math.min(MAX_SPEECH_RATE, Math.round(rate)));
}

export interface UseVoiceFeedbackReturn {
  feedback: string;
  feedbackSeverity: SpeechSeverity;
  voiceError: string;
  isSpeaking: boolean;
  speechRate: number;
  setFeedback: (message: string, severity?: SpeechSeverity) => void;
  setVoiceError: (error: string) => void;
  speakMessage: (message: string, severity?: SpeechSeverity) => void;
  speak: (text: string, metadata?: SpeakMetadata) => void;
  cancel: () => void;
  setSpeechRate: (rate: number) => void;
  cycleSpeechRate: () => number;
}

export function useVoiceFeedback(): UseVoiceFeedbackReturn {
  const [speechRate, setSpeechRateState] = useState<number>(MIN_SPEECH_RATE);
  const { speak: synthSpeak, cancel, isSpeaking } = useSpeechSynthesis({
    rate: speechRate,
  });
  const [feedback, setFeedbackState] = useState("");
  const [feedbackSeverity, setFeedbackSeverity] = useState<SpeechSeverity>("info");
  const [voiceError, setVoiceErrorState] = useState("");

  const setSpeechRate = useCallback((rate: number) => {
    setSpeechRateState(clampRate(rate));
  }, []);

  const cycleSpeechRate = useCallback((): number => {
    let next = MIN_SPEECH_RATE;
    setSpeechRateState((current) => {
      next = current >= MAX_SPEECH_RATE ? MIN_SPEECH_RATE : current + 1;
      return next;
    });
    return next;
  }, []);

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
    (text: string, metadata?: SpeakMetadata) => {
      synthSpeak(text, metadata);
    },
    [synthSpeak],
  );

  return {
    feedback,
    feedbackSeverity,
    voiceError,
    isSpeaking,
    speechRate,
    setFeedback,
    setVoiceError,
    speakMessage,
    speak,
    cancel,
    setSpeechRate,
    cycleSpeechRate,
  };
}
