import { VOICE_INTENTS } from "../../../../../types";
import type { IntentMatcher } from "../types";

const SPEECH_RATE_RE =
  /^(?:(?:aumentar|alterar|mudar|definir|colocar|ajustar)\s+)?velocidade(?:\s+(?:para|em|de))?\s+(\d+)(?:\s*(?:vezes?|x))?$/;

export const speechControlMatchers: IntentMatcher[] = [
  ({ normalized }) => {
    const match = normalized.match(SPEECH_RATE_RE);
    const captured = match?.[1];
    if (!captured) return null;

    return {
      intent: VOICE_INTENTS.SET_SPEECH_RATE,
      entity: captured,
      confidence: 0.93,
      transcript: normalized,
    };
  },
];
