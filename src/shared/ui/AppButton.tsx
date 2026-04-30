import type { ButtonHTMLAttributes } from "react";
import styles from "./AppButton.module.css";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export function AppButton({
  variant = "secondary",
  className = "",
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      className={`interactive-button ${styles.button} ${styles[variant]} ${className}`.trim()}
    />
  );
}
