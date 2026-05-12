import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  VOICE_MUTE_STORAGE_KEY,
  isVoiceFeedbackMuted,
  setVoiceFeedbackMuted,
  subscribeVoiceFeedbackMute,
  toggleVoiceFeedbackMuted,
} from "./voiceMute";

describe("voiceMute singleton", () => {
  beforeEach(() => {
    setVoiceFeedbackMuted(false);
  });

  afterEach(() => {
    try {
      window.localStorage.removeItem(VOICE_MUTE_STORAGE_KEY);
    } catch {
      // jsdom storage may not always be writable; ignore
    }
  });

  it("starts unmuted by default", () => {
    expect(isVoiceFeedbackMuted()).toBe(false);
  });

  it("setVoiceFeedbackMuted flips the state and persists to localStorage", () => {
    setVoiceFeedbackMuted(true);

    expect(isVoiceFeedbackMuted()).toBe(true);
    expect(window.localStorage.getItem(VOICE_MUTE_STORAGE_KEY)).toBe("1");

    setVoiceFeedbackMuted(false);

    expect(isVoiceFeedbackMuted()).toBe(false);
    expect(window.localStorage.getItem(VOICE_MUTE_STORAGE_KEY)).toBe("0");
  });

  it("toggleVoiceFeedbackMuted returns the new state", () => {
    expect(toggleVoiceFeedbackMuted()).toBe(true);
    expect(toggleVoiceFeedbackMuted()).toBe(false);
  });

  it("notifies subscribers when the state changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeVoiceFeedbackMute(listener);

    setVoiceFeedbackMuted(true);
    setVoiceFeedbackMuted(true); // no-op: same value
    setVoiceFeedbackMuted(false);

    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    setVoiceFeedbackMuted(true);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
