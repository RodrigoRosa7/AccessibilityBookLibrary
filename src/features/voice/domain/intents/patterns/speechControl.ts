import { VOICE_INTENTS } from "../../../../../types";
import type { IntentMatcher } from "../types";

const SPEECH_RATE_RE =
  /^(?:(?:aumentar|alterar|mudar|definir|colocar|ajustar)\s+)?velocidade(?:\s+(?:para|em|de))?\s+(\d+)(?:\s*(?:vezes?|x))?$/;

const SPEECH_RATE_CYCLE_RE =
  /^(?:aumentar|alterar|mudar|trocar|ajustar|ciclar)\s+(?:a\s+)?velocidade(?:\s+(?:da|de)\s+fala)?$/;

const MUTE_FEEDBACK_RE =
  /^(?:silenciar|calar|mutar)(?:\s+(?:o\s+|a\s+)?(?:feedback|fala|voz|assistente))?$|^(?:desativar|desligar)\s+(?:o\s+|a\s+)?(?:feedback|fala|voz)$/;

const UNMUTE_FEEDBACK_RE =
  /^(?:ativar|ligar|reativar|habilitar)\s+(?:o\s+|a\s+)?(?:feedback|fala|voz)$|^voltar\s+a\s+falar$/;

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

  ({ normalized }) => {
    if (!SPEECH_RATE_CYCLE_RE.test(normalized)) return null;

    return {
      intent: VOICE_INTENTS.CYCLE_SPEECH_RATE,
      entity: null,
      confidence: 0.92,
      transcript: normalized,
    };
  },

  ({ normalized }) => {
    if (!MUTE_FEEDBACK_RE.test(normalized)) return null;

    return {
      intent: VOICE_INTENTS.MUTE_FEEDBACK,
      entity: null,
      confidence: 0.93,
      transcript: normalized,
    };
  },

  ({ normalized }) => {
    if (!UNMUTE_FEEDBACK_RE.test(normalized)) return null;

    return {
      intent: VOICE_INTENTS.UNMUTE_FEEDBACK,
      entity: null,
      confidence: 0.93,
      transcript: normalized,
    };
  },
];
