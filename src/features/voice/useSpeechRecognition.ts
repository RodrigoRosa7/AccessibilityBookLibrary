import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseVoiceIntent } from "./intentParser";
import type { ParsedIntent } from "../../types";

type SpeechError = SpeechRecognitionErrorCode | "start-failed" | "unknown";

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  currentRoute?: string;
  retryOnNetworkError?: boolean;
  maxNetworkRetries?: number;
  onIntent?: (intent: ParsedIntent, raw: string) => void;
  onTranscript?: (transcript: string) => void;
  onError?: (error: SpeechError) => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: SpeechError | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

function getSpeechRecognitionConstructor(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") {
    return null;
  }

  const userAgent = window.navigator?.userAgent ?? "";
  const isFirefox = /firefox/i.test(userAgent);

  if (isFirefox) {
    return null;
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionReturn {
  const {
    lang = "pt-BR",
    continuous = false,
    interimResults = true,
    currentRoute = "/",
    retryOnNetworkError = true,
    maxNetworkRetries = 1,
    onIntent,
    onTranscript,
    onError,
  } = options;

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onIntentRef = useRef(onIntent);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  const shouldListenRef = useRef(false);
  const networkRetryCountRef = useRef(0);

  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<SpeechError | null>(null);

  const SpeechRecognitionConstructor = useMemo(
    () => getSpeechRecognitionConstructor(),
    [],
  );

  const isSupported = Boolean(SpeechRecognitionConstructor);

  useEffect(() => {
    onIntentRef.current = onIntent;
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
  }, [onIntent, onTranscript, onError]);

  useEffect(() => {
    if (!SpeechRecognitionConstructor) {
      return undefined;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const nextError: SpeechError = event?.error ?? "unknown";

      if (
        nextError === "network" &&
        retryOnNetworkError &&
        shouldListenRef.current &&
        networkRetryCountRef.current < maxNetworkRetries
      ) {
        networkRetryCountRef.current += 1;
        recognition.stop();
        window.setTimeout(() => {
          try {
            if (shouldListenRef.current) {
              recognition.start();
            }
          } catch {
            // If start fails, the browser will emit another onerror event.
          }
        }, 350);
        return;
      }

      setError(nextError);
      onErrorRef.current?.(nextError);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interim += text;
        }
      }

      const normalizedFinal = finalTranscript.trim();
      setInterimTranscript(interim.trim());

      if (!normalizedFinal) {
        return;
      }

      setTranscript(normalizedFinal);
      onTranscriptRef.current?.(normalizedFinal);

      const parsedIntent = parseVoiceIntent(normalizedFinal, { currentRoute });
      onIntentRef.current?.(parsedIntent, normalizedFinal);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [
    SpeechRecognitionConstructor,
    lang,
    continuous,
    interimResults,
    currentRoute,
    retryOnNetworkError,
    maxNetworkRetries,
  ]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) {
      return;
    }

    setError(null);
    shouldListenRef.current = true;
    networkRetryCountRef.current = 0;

    try {
      recognitionRef.current.start();
    } catch (startError) {
      const rawName = (startError as Error)?.name?.toLowerCase();
      const nextError: SpeechError = (rawName as SpeechError) ?? "start-failed";
      setError(nextError);
      onErrorRef.current?.(nextError);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    shouldListenRef.current = false;
    networkRetryCountRef.current = 0;
    recognitionRef.current.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
