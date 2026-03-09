import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseVoiceIntent } from "./intentParser.js";

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useSpeechRecognition(options = {}) {
  const {
    lang = "pt-BR",
    continuous = false,
    interimResults = true,
    onIntent,
    onTranscript,
    onError,
  } = options;

  const recognitionRef = useRef(null);
  const onIntentRef = useRef(onIntent);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);

  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

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

    recognition.onerror = (event) => {
      const nextError = event?.error ?? "unknown";
      setError(nextError);
      if (onErrorRef.current) {
        onErrorRef.current(nextError);
      }
    };

    recognition.onresult = (event) => {
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

      if (onTranscriptRef.current) {
        onTranscriptRef.current(normalizedFinal);
      }

      const parsedIntent = parseVoiceIntent(normalizedFinal);
      if (onIntentRef.current) {
        onIntentRef.current(parsedIntent, normalizedFinal);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [SpeechRecognitionConstructor, lang, continuous, interimResults]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) {
      return;
    }

    setError(null);
    recognitionRef.current.start();
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

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
