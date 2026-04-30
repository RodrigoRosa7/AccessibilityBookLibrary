import { Heading, Text } from "@primer/react";
import { AppButton } from "../shared/ui/AppButton";
import { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Accordion } from "../shared/ui/Accordion";
import { getPageVoiceGuidance } from "../features/contextual/pageVoiceGuidance";
import { useSpeechSynthesis } from "../features/voice/useSpeechSynthesis";
import {
  subscribeVoiceEvent,
  VOICE_EVENT,
} from "../features/voice/services/voiceEvents";

function getSessionKey(pathname: string): string {
  return `voice-guidance-played:${pathname}`;
}

export function RouteVoiceGuidance() {
  const location = useLocation();
  const { speak } = useSpeechSynthesis();
  const guidance = useMemo(
    () => getPageVoiceGuidance(location.pathname),
    [location.pathname],
  );

  const playGuidance = useCallback(() => {
    speak(guidance.speechText, { severity: "info" });
    try {
      sessionStorage.setItem(getSessionKey(location.pathname), "1");
    } catch {
      // noop
    }
  }, [guidance.speechText, location.pathname, speak]);

  const shouldAutoPlayCurrentRoute = useCallback(() => {
    try {
      if (sessionStorage.getItem(getSessionKey(location.pathname)) === "1") {
        return false;
      }
    } catch {
      // noop
    }

    if (typeof document !== "undefined") {
      const hasOnboardingModalOpen = document.querySelector(
        '[data-modal-id="voice-onboarding"]',
      );

      if (hasOnboardingModalOpen) {
        return false;
      }
    }

    return true;
  }, [location.pathname]);

  useEffect(() => {
    if (!shouldAutoPlayCurrentRoute()) {
      return;
    }

    playGuidance();
  }, [location.pathname, playGuidance, shouldAutoPlayCurrentRoute]);

  useEffect(() => {
    function handleRepeatGuidance() {
      playGuidance();
    }

    function handleOnboardingClosed() {
      if (!shouldAutoPlayCurrentRoute()) {
        return;
      }

      playGuidance();
    }

    const unsubRepeat = subscribeVoiceEvent(
      VOICE_EVENT.GUIDANCE_REPEAT,
      handleRepeatGuidance,
    );
    const unsubClosed = subscribeVoiceEvent(
      VOICE_EVENT.ONBOARDING_CLOSED,
      handleOnboardingClosed,
    );

    return () => {
      unsubRepeat();
      unsubClosed();
    };
  }, [playGuidance, shouldAutoPlayCurrentRoute]);

  return (
    <div className="route-voice-guidance">
      <Accordion
        className="route-voice-guidance-accordion"
        titleComponent={(summaryId) => (
          <Heading as="h2" id={summaryId} style={{ fontSize: 16 }}>
            {guidance.title}
          </Heading>
        )}
        summaryClassName="route-voice-guidance-summary"
        chevronClassName="route-voice-guidance-chevron"
        bodyClassName="route-voice-guidance-body"
        contentClassName="route-voice-guidance-content"
        isOpen={true}
      >
        <Text as="p" style={{ color: "var(--color-muted)" }}>
          {guidance.description}
        </Text>

        <div className="route-voice-guidance-actions">
          <AppButton variant="primary" onClick={playGuidance}>
            Ouvir instruções
          </AppButton>
        </div>

        <div className="command-chips">
          {guidance.commands.map((command) => (
            <span className="command-chip" key={command}>
              {command}
            </span>
          ))}
        </div>
      </Accordion>
    </div>
  );
}
