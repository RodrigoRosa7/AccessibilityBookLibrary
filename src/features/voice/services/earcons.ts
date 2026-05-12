let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

function playTone(freq: number, durationMs: number, gain = 0.12): void {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {
      // Autoplay policy may reject resume() before a user gesture.
      // The next gesture-driven call will succeed; silently ignore.
    });
  }
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + durationMs / 1000,
  );
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000);
}

export const playListenStart = (): void => playTone(880, 120);
export const playListenStop = (): void => playTone(440, 100);
