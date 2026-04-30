import { Button } from "@primer/react";

interface VoiceButtonProps {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function VoiceButton({
  isListening,
  isSpeaking,
  isSupported,
  onStart,
  onStop,
  disabled = false,
}: VoiceButtonProps) {
  if (!isSupported) {
    return (
      <Button
        className="app-button-primary"
        aria-label="Reconhecimento de voz indisponível"
        disabled
      >
        Voz indisponível
      </Button>
    );
  }

  const buttonLabel = isListening ? "Parar voz" : "Microfone";
  const buttonClassName = [
    "voice-button",
    isListening ? "voice-button-listening" : "",
    isSpeaking ? "voice-button-speaking" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Button
      className={`${buttonClassName} app-button-primary`}
      aria-label={
        isListening
          ? "Parar reconhecimento de voz"
          : "Iniciar reconhecimento de voz"
      }
      aria-pressed={isListening}
      onClick={isListening ? onStop : onStart}
      variant={isListening ? "danger" : "primary"}
      disabled={disabled}
    >
      <span className="voice-icon" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 11.5a6 6 0 0 0 12 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 17.5V21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 21h5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="voice-button-label">{buttonLabel}</span>
    </Button>
  );
}
