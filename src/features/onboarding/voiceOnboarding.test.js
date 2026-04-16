import { describe, expect, it } from "vitest";
import {
  VOICE_ONBOARDING_VERSION,
  buildInitialVoicePresentation,
  getVoiceOnboardingStorageKey,
  hasCompletedVoiceOnboarding,
  markVoiceOnboardingCompleted,
} from "./voiceOnboarding.js";

function createMemoryStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

describe("voice onboarding storage", () => {
  it("builds stable storage key per user and version", () => {
    const key = getVoiceOnboardingStorageKey(
      { id: 42, email: "ana@braillebooks.com" },
      VOICE_ONBOARDING_VERSION,
    );

    expect(key).toContain("webspeech-voice-onboarding");
    expect(key).toContain(VOICE_ONBOARDING_VERSION);
    expect(key.endsWith(":42")).toBe(true);
  });

  it("marks onboarding as completed and reads back the flag", () => {
    const storage = createMemoryStorage();
    const user = { email: "ana@braillebooks.com" };

    expect(hasCompletedVoiceOnboarding(user, { storage })).toBe(false);

    markVoiceOnboardingCompleted(user, { storage });

    expect(hasCompletedVoiceOnboarding(user, { storage })).toBe(true);
  });
});

describe("buildInitialVoicePresentation", () => {
  it("includes key guidance for first-time navigation", () => {
    const speech = buildInitialVoicePresentation({ name: "Ana" });

    expect(speech).toContain("Início");
    expect(speech).toContain("Livros");
    expect(speech).toContain("tecla espaço");
    expect(speech).toContain("Me ajude");
    expect(speech).toContain("Ouvir novamente");
    expect(speech).toContain("Concluir apresentação");
    expect(speech).toContain("Pular por agora");
  });
});
