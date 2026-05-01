import { VOICE_INTENTS } from "../../../../../types";
import type { IntentMatcher } from "../types";

export const onboardingMatchers: IntentMatcher[] = [
  ({ normalized }) => {
    if (/^ouvir novamente$/.test(normalized)) {
      return {
        intent: VOICE_INTENTS.REPLAY_VOICE_ONBOARDING,
        entity: null,
        confidence: 0.93,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (/^concluir(\s+(a\s+)?apresentacao)?$/.test(normalized)) {
      return {
        intent: VOICE_INTENTS.COMPLETE_VOICE_ONBOARDING,
        entity: null,
        confidence: 0.93,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (/^(pular|pular por agora)$/.test(normalized)) {
      return {
        intent: VOICE_INTENTS.SKIP_VOICE_ONBOARDING,
        entity: null,
        confidence: 0.93,
        transcript: normalized,
      };
    }
    return null;
  },
];
