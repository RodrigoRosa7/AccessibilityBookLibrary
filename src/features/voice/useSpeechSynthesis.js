import { useCallback, useMemo, useState } from "react";

function getSynthesis() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.speechSynthesis ?? null;
}

export function useSpeechSynthesis(options = {}) {
  const { lang = "pt-BR", rate = 1, pitch = 1, volume = 1 } = options;

  const synthesis = useMemo(() => getSynthesis(), []);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isSupported = Boolean(synthesis);

  const speak = useCallback(
    (text) => {
      if (!synthesis || !text) {
        return;
      }

      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

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
  }, [synthesis]);

  return {
    isSupported,
    isSpeaking,
    speak,
    cancel,
  };
}
