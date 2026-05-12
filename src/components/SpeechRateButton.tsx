import { AppButton } from "../shared/ui/AppButton";

interface SpeechRateButtonProps {
  speechRate: number;
  onCycle: () => void;
  disabled?: boolean;
}

export function SpeechRateButton({
  speechRate,
  onCycle,
  disabled = false,
}: SpeechRateButtonProps) {
  return (
    <AppButton
      variant="secondary"
      aria-label={`Velocidade da fala: ${speechRate} vezes. Clique para alternar.`}
      onClick={onCycle}
      disabled={disabled}
    >
      <span aria-live="polite">{speechRate}x</span>
    </AppButton>
  );
}
