import { Button } from "@primer/react";

export function VoiceButton({
  isListening,
  isSupported,
  onStart,
  onStop,
  disabled = false,
}) {
  if (!isSupported) {
    return (
      <Button aria-label="Reconhecimento de voz indisponivel" disabled>
        Voz indisponivel
      </Button>
    );
  }

  return (
    <Button
      aria-label={
        isListening
          ? "Parar reconhecimento de voz"
          : "Iniciar reconhecimento de voz"
      }
      onClick={isListening ? onStop : onStart}
      variant={isListening ? "danger" : "primary"}
      disabled={disabled}
    >
      {isListening ? "Parar voz" : "Comando de voz"}
    </Button>
  );
}
