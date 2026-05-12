import { useCallback, useSyncExternalStore } from "react";
import {
  isVoiceFeedbackMuted,
  setVoiceFeedbackMuted,
  subscribeVoiceFeedbackMute,
  toggleVoiceFeedbackMuted,
} from "../services/voiceMute";

export interface UseVoiceFeedbackMuteReturn {
  muted: boolean;
  toggle: () => boolean;
  setMuted: (value: boolean) => void;
}

export function useVoiceFeedbackMute(): UseVoiceFeedbackMuteReturn {
  const muted = useSyncExternalStore(
    subscribeVoiceFeedbackMute,
    isVoiceFeedbackMuted,
    () => false,
  );

  const toggle = useCallback((): boolean => toggleVoiceFeedbackMuted(), []);
  const setMuted = useCallback(
    (value: boolean): void => setVoiceFeedbackMuted(value),
    [],
  );

  return { muted, toggle, setMuted };
}
