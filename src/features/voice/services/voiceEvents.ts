export const VOICE_EVENT = {
  HELP_OPEN: "voice-help:open",
  ONBOARDING_REPLAY: "voice-onboarding:replay",
  ONBOARDING_COMPLETE: "voice-onboarding:complete",
  ONBOARDING_SKIP: "voice-onboarding:skip",
  ONBOARDING_CLOSED: "voice-onboarding:closed",
  MODAL_CLOSE: "app-modal:close",
  CART_OPEN_CHECKOUT_DIALOG: "cart:open-checkout-dialog",
  CART_CONFIRM_CHECKOUT: "cart:confirm-checkout",
  GUIDANCE_REPEAT: "voice-guidance:repeat",
} as const;

export type VoiceEventName = (typeof VOICE_EVENT)[keyof typeof VOICE_EVENT];

export function emitVoiceEvent<T = unknown>(
  name: VoiceEventName,
  eventInit?: CustomEventInit<T>,
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<T>(name, eventInit));
}

export function subscribeVoiceEvent<T = unknown>(
  name: VoiceEventName,
  handler: (event: CustomEvent<T>) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener: EventListener = handler as EventListener;
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}
