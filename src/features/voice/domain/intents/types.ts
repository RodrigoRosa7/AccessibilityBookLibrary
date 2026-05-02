import type { ParsedIntent, VoiceContext } from "../../../../types";

export type { ParsedIntent, VoiceContext };

export type IntentMatcher = (
  input: NormalizedInput,
  ctx: VoiceContext,
) => ParsedIntent | null;

export interface NormalizedInput {
  raw: string;
  normalized: string;
}
