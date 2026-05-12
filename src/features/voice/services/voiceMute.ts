const STORAGE_KEY = "webspeech-feedback-muted";

function readPersisted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function persist(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // Storage may be unavailable (private mode, quota); the in-memory
    // singleton is still authoritative for the current session.
  }
}

let muted = readPersisted();
const listeners = new Set<() => void>();

export function isVoiceFeedbackMuted(): boolean {
  return muted;
}

export function setVoiceFeedbackMuted(value: boolean): void {
  const next = Boolean(value);
  if (next === muted) return;
  muted = next;
  persist(muted);
  listeners.forEach((listener) => listener());
}

export function toggleVoiceFeedbackMuted(): boolean {
  setVoiceFeedbackMuted(!muted);
  return muted;
}

export function subscribeVoiceFeedbackMute(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const VOICE_MUTE_STORAGE_KEY = STORAGE_KEY;
