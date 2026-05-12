import { VOICE_INTENTS } from "../../../../types";
import type { ParsedIntent, ParseVoiceIntentOptions } from "../../../../types";
import { toNormalizedInput } from "./normalize";
import { cartMatchers } from "./patterns/cart";
import { checkoutMatchers } from "./patterns/checkout";
import { goBackMatchers } from "./patterns/goBack";
import { helpMatchers } from "./patterns/help";
import { navigationMatchers } from "./patterns/navigation";
import { onboardingMatchers } from "./patterns/onboarding";
import { searchMatchers } from "./patterns/search";
import { speechControlMatchers } from "./patterns/speechControl";
import type { IntentMatcher, VoiceContext } from "./types";

const ALL_MATCHERS: IntentMatcher[] = [
  // Order is critical — see comments:
  // 1. Onboarding has exact-match commands, must be first.
  // 2. Speech control (rate) is a global modal-agnostic command, runs early.
  // 3. Cart intents before help/checkout to catch add/remove/clear early.
  // 4. Help (CLOSE_MODAL first) before checkout: "fechar pedido" = close, not checkout.
  // 5. Checkout after close modal.
  // 6. Navigation (open cart/books/home/logout) before search:
  //    "mostrar carrinho" is navigation, not search.
  // 7. Search matchers (read results, select book, open details, search).
  // 8. GO_BACK last among nav: "voltar resultados" → READ_PREVIOUS, not GO_BACK.
  ...onboardingMatchers,
  ...speechControlMatchers,
  ...cartMatchers,
  ...helpMatchers,
  ...checkoutMatchers,
  ...navigationMatchers,
  ...searchMatchers,
  ...goBackMatchers,
];

export function parseVoiceIntent(
  transcript: string,
  options: ParseVoiceIntentOptions = {},
): ParsedIntent {
  const ctx: VoiceContext = { currentRoute: options.currentRoute ?? "/" };
  const input = toNormalizedInput(transcript);

  if (!input.normalized) {
    return {
      intent: VOICE_INTENTS.UNKNOWN,
      entity: null,
      confidence: 0,
      transcript: "",
    };
  }

  for (const match of ALL_MATCHERS) {
    const result = match(input, ctx);
    if (result) return result;
  }

  return {
    intent: VOICE_INTENTS.UNKNOWN,
    entity: null,
    confidence: 0.3,
    transcript: input.normalized,
  };
}
