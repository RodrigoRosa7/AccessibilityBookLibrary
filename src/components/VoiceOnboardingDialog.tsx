import { Button, Heading, Text } from "@primer/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { useSpeechSynthesis } from "../features/voice/useSpeechSynthesis";
import { buildInitialVoicePresentation } from "../features/onboarding/voiceOnboarding";
import {
  subscribeVoiceEvent,
  emitVoiceEvent,
  VOICE_EVENT,
} from "../features/voice/services/voiceEvents";

export function VoiceOnboardingDialog() {
  const {
    user,
    shouldPlayVoiceOnboarding,
    completeVoiceOnboarding,
    voiceOnboardingVersion,
  } = useAuth();
  const { speak, cancel, isSpeaking } = useSpeechSynthesis();
  const [dismissedForSession, setDismissedForSession] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const hasAutoPlayedRef = useRef(false);
  const pendingCloseReasonRef = useRef<string | null>(null);
  const wasOpenRef = useRef(false);

  const presentationText = buildInitialVoicePresentation(user);

  const handlePlayPresentation = useCallback(() => {
    speak(presentationText);
  }, [presentationText, speak]);

  const handleComplete = useCallback(() => {
    pendingCloseReasonRef.current = "complete";
    completeVoiceOnboarding();
    setIsOpen(false);
    setDismissedForSession(false);
    cancel();
  }, [cancel, completeVoiceOnboarding]);

  const handleSkip = useCallback(() => {
    pendingCloseReasonRef.current = "skip";
    setDismissedForSession(true);
    setIsOpen(false);
    cancel();
  }, [cancel]);

  useEffect(() => {
    if (!shouldPlayVoiceOnboarding || dismissedForSession) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
  }, [dismissedForSession, shouldPlayVoiceOnboarding]);

  useEffect(() => {
    if (!isOpen || hasAutoPlayedRef.current) {
      return;
    }

    hasAutoPlayedRef.current = true;
    handlePlayPresentation();
  }, [handlePlayPresentation, isOpen]);

  useEffect(() => {
    if (shouldPlayVoiceOnboarding) {
      return;
    }

    hasAutoPlayedRef.current = false;
  }, [shouldPlayVoiceOnboarding]);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      return;
    }

    if (!wasOpenRef.current) {
      return;
    }

    const closeReason = pendingCloseReasonRef.current;
    pendingCloseReasonRef.current = null;
    wasOpenRef.current = false;

    if (!closeReason) {
      return;
    }

    emitVoiceEvent(VOICE_EVENT.ONBOARDING_CLOSED, {
      detail: { reason: closeReason },
    });
  }, [isOpen]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  useEffect(() => {
    function replayOnboarding() {
      handlePlayPresentation();
    }

    function completeOnboarding() {
      handleComplete();
    }

    function skipOnboarding() {
      handleSkip();
    }

    const unsubReplay = subscribeVoiceEvent(
      VOICE_EVENT.ONBOARDING_REPLAY,
      replayOnboarding,
    );
    const unsubComplete = subscribeVoiceEvent(
      VOICE_EVENT.ONBOARDING_COMPLETE,
      completeOnboarding,
    );
    const unsubSkip = subscribeVoiceEvent(
      VOICE_EVENT.ONBOARDING_SKIP,
      skipOnboarding,
    );
    const unsubClose = subscribeVoiceEvent(
      VOICE_EVENT.MODAL_CLOSE,
      skipOnboarding,
    );

    return () => {
      unsubReplay();
      unsubComplete();
      unsubSkip();
      unsubClose();
    };
  }, [handleComplete, handlePlayPresentation, handleSkip]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="voice-onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-onboarding-title"
      data-modal-id="voice-onboarding"
    >
      <section className="voice-onboarding-card">
        <Heading as="h2" id="voice-onboarding-title" style={{ fontSize: 20 }}>
          Apresentação inicial por voz
        </Heading>

        <Text as="p" style={{ color: "var(--color-muted)" }}>
          Versão da apresentação: {voiceOnboardingVersion}
        </Text>

        <Text as="p">
          Esta apresentação foi criada para orientar a navegação por voz na
          primeira entrada. Você pode ouvir novamente agora e concluir quando
          estiver pronto.
        </Text>

        <div className="voice-onboarding-actions">
          <Button
            className="app-button-primary"
            onClick={handlePlayPresentation}
            variant="primary"
          >
            {isSpeaking ? "Falando..." : "Ouvir novamente"}
          </Button>
          <Button className="app-button-secondary" onClick={handleComplete}>
            Concluir apresentação
          </Button>
          <Button onClick={handleSkip} variant="invisible">
            Pular por agora
          </Button>
        </div>
      </section>
    </div>
  );
}
