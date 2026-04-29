import type { NormalizedInput } from "./types";

export function normalizeText(text: unknown): string {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toNormalizedInput(transcript: string): NormalizedInput {
  return { raw: transcript, normalized: normalizeText(transcript) };
}
