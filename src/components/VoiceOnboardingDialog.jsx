import { Button, Heading, Text } from "@primer/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../app/providers/AuthProvider.jsx";
import { useSpeechSynthesis } from "../features/voice/useSpeechSynthesis.js";
import { buildInitialVoicePresentation } from "../features/onboarding/voiceOnboarding.js";

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

  const presentationText = buildInitialVoicePresentation(user);

  const handlePlayPresentation = useCallback(() => {
    speak(presentationText);
  }, [presentationText, speak]);

  const handleComplete = useCallback(() => {
    completeVoiceOnboarding();
    setIsOpen(false);
    setDismissedForSession(false);
    cancel();
  }, [cancel, completeVoiceOnboarding]);

  const handleSkip = useCallback(() => {
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
    return () => {
      cancel();
    };
  }, [cancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="voice-onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-onboarding-title"
    >
      <section className="voice-onboarding-card">
        <Heading as="h2" id="voice-onboarding-title" sx={{ fontSize: 3 }}>
          Apresentação inicial por voz
        </Heading>

        <Text as="p" sx={{ color: "var(--color-muted)" }}>
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
            sx={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-bg)",
              borderColor: "var(--color-primary)",
              "&:hover:not(:disabled)": {
                backgroundColor: "var(--color-primary-strong)",
                borderColor: "var(--color-primary-strong)",
              },
            }}
          >
            {isSpeaking ? "Falando..." : "Ouvir novamente"}
          </Button>
          <Button className="app-button-primary" onClick={handleComplete}>
            Concluir apresentação
          </Button>
          <Button
            onClick={handleSkip}
            variant="invisible"
            sx={{ color: "var(--color-primary-strong)" }}
          >
            Pular por agora
          </Button>
        </div>
      </section>
    </div>
  );
}
