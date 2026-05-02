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
import type { IntentMatcher, VoiceContext } from "./types";

const ALL_MATCHERS: IntentMatcher[] = [
  // Order is critical — see comments:
  // 1. Onboarding has exact-match commands, must be first.
  // 2. Cart intents before help/checkout to catch add/remove/clear early.
  // 3. Help (CLOSE_MODAL first) before checkout: "fechar pedido" = close, not checkout.
  // 4. Checkout after close modal.
  // 5. Navigation (open cart/books/home/logout) before search:
  //    "mostrar carrinho" is navigation, not search.
  // 6. Search matchers (read results, select book, open details, search).
  // 7. GO_BACK last among nav: "voltar resultados" → READ_PREVIOUS, not GO_BACK.
  ...onboardingMatchers,
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
