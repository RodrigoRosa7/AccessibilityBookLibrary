import { AppButton } from "../shared/ui/AppButton";

interface MuteFeedbackButtonProps {
  muted: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function MuteFeedbackButton({
  muted,
  onToggle,
  disabled = false,
}: MuteFeedbackButtonProps) {
  const label = muted ? "Mudo" : "Falando";
  const ariaLabel = muted
    ? "Feedback falado silenciado. Clique para ativar a fala do assistente."
    : "Feedback falado ativo. Clique para silenciar a fala do assistente.";

  return (
    <AppButton
      variant="secondary"
      aria-label={ariaLabel}
      aria-pressed={muted}
      onClick={onToggle}
      disabled={disabled}
    >
      <span aria-hidden="true" style={{ display: "inline-flex", marginRight: 6 }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 5 6 9H3v6h3l5 4z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {muted ? (
            <>
              <line
                x1="16"
                y1="9"
                x2="22"
                y2="15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="22"
                y1="9"
                x2="16"
                y2="15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <path
                d="M16 8a5 5 0 0 1 0 8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M19 5a9 9 0 0 1 0 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </span>
      <span>{label}</span>
    </AppButton>
  );
}
