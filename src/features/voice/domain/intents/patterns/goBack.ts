import { VOICE_INTENTS } from "../../../../../types";
import type { IntentMatcher } from "../types";

// GO_BACK must be checked AFTER search result matchers, otherwise
// "voltar resultados" fires GO_BACK instead of READ_PREVIOUS_SEARCH_RESULTS.
export const goBackMatchers: IntentMatcher[] = [
  ({ normalized }) => {
    if (/(voltar|pagina anterior|retornar)/.test(normalized)) {
      return {
        intent: VOICE_INTENTS.GO_BACK,
        entity: null,
        confidence: 0.9,
        transcript: normalized,
      };
    }
    return null;
  },
];
