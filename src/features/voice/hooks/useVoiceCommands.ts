import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { useSpeechRecognition } from "../useSpeechRecognition";
import { parseVoiceIntent } from "../intentParser";
import { handleVoiceCommand } from "../voiceCommands";
import type { VoiceActions } from "../../../types";
import type { SpeechSeverity } from "../useSpeechSynthesis";

interface UseVoiceCommandsOptions {
  pathname: string;
  voiceActions: VoiceActions;
  setFeedback: (message: string, severity?: SpeechSeverity) => void;
  setVoiceError: (error: string) => void;
  speakMessage: (message: string, severity?: SpeechSeverity) => void;
  speak: (text: string) => void;
  cancel: () => void;
}

export interface UseVoiceCommandsReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  lastCommand: string;
  typedCommand: string;
  setTypedCommand: (value: string) => void;
  startVoiceCommand: () => void;
  cancelVoiceCommand: () => void;
  runTypedCommand: (event: React.FormEvent) => void;
}

function getSpeechRecognitionErrorMessage(recognitionError: string): string {
  if (recognitionError === "network") {
    return "Falha de rede no reconhecimento de voz. Verifique se o navegador pode usar servicos de fala online e tente novamente.";
  }
  if (recognitionError === "not-allowed") {
    return "Permissao de microfone negada. Autorize o uso do microfone no navegador e tente novamente.";
  }
  if (recognitionError === "service-not-allowed") {
    return "Servico de reconhecimento de voz bloqueado pelo navegador.";
  }
  if (recognitionError === "notallowederror") {
    return "Nao foi possivel iniciar o reconhecimento de voz. Verifique a permissao do microfone no navegador.";
  }
  if (recognitionError === "invalidstateerror") {
    return "Reconhecimento de voz ja estava em andamento. Tente novamente em alguns segundos.";
  }
  return `Erro no reconhecimento de voz: ${recognitionError}`;
}

export function useVoiceCommands({
  pathname,
  voiceActions,
  setFeedback,
  setVoiceError,
  speakMessage,
  speak,
  cancel,
}: UseVoiceCommandsOptions): UseVoiceCommandsReturn {
  const [typedCommand, setTypedCommand] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const cancelRequestedRef = useRef(false);
  const voiceActionsRef = useRef(voiceActions);

  useEffect(() => {
    voiceActionsRef.current = voiceActions;
  }, [voiceActions]);

  const runAssistantCommand = useCallback(
    (transcriptText: string) => {
      const normalized = String(transcriptText ?? "").trim();
      if (!normalized) return;

      cancelRequestedRef.current = false;
      setVoiceError("");
      setLastCommand(normalized);

      const intentResult = parseVoiceIntent(normalized, { currentRoute: pathname });
      const message = handleVoiceCommand(intentResult, voiceActionsRef.current);
      setFeedback(message);
      if (message) {
        cancel();
        speak(message);
      }
    },
    [cancel, pathname, setFeedback, setVoiceError, speak],
  );

  const speechRecognition = useSpeechRecognition({
    lang: "pt-BR",
    currentRoute: pathname,
    onTranscript: (nextTranscript) => setLastCommand(nextTranscript),
    onIntent: (_intentResult, nextTranscript) => runAssistantCommand(nextTranscript),
    onError: (recognitionError) => {
      const isCancelledByUser =
        cancelRequestedRef.current &&
        (recognitionError === "no-speech" || recognitionError === "aborted");

      if (isCancelledByUser) {
        cancelRequestedRef.current = false;
        return;
      }

      cancelRequestedRef.current = false;
      const message = getSpeechRecognitionErrorMessage(recognitionError);
      setVoiceError(message);
      speakMessage(message, "critical");
    },
  });

  const { isListening, isSupported, transcript, startListening, stopListening } = speechRecognition;

  useEffect(() => {
    if (!isSupported) {
      setVoiceError(
        "Reconhecimento de voz indisponivel neste navegador. Use Chrome ou Edge para comandos de voz.",
      );
    }
  }, [isSupported, setVoiceError]);

  const cancelVoiceCommand = useCallback(() => {
    cancelRequestedRef.current = true;
    stopListening();
    cancel();
    speakMessage("Comando de voz cancelado. Pressione espaço para tentar novamente.");
  }, [cancel, speakMessage, stopListening]);

  const startVoiceCommand = useCallback(() => {
    cancel();
    setVoiceError("");
    startListening();
  }, [cancel, setVoiceError, startListening]);

  useEffect(() => {
    function handleSpaceToggle(event: KeyboardEvent) {
      if (event.code !== "Space" || event.repeat) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTypingField =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable === true;
      if (isTypingField) return;
      event.preventDefault();
      if (isListening) {
        cancelVoiceCommand();
      } else {
        startVoiceCommand();
      }
    }

    window.addEventListener("keydown", handleSpaceToggle);
    return () => window.removeEventListener("keydown", handleSpaceToggle);
  }, [cancelVoiceCommand, isListening, startVoiceCommand]);

  const runTypedCommand = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      runAssistantCommand(typedCommand);
      setTypedCommand("");
    },
    [runAssistantCommand, typedCommand],
  );

  return {
    isListening,
    isSupported,
    transcript,
    lastCommand,
    typedCommand,
    setTypedCommand,
    startVoiceCommand,
    cancelVoiceCommand,
    runTypedCommand,
  };
}
