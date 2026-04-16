import { Button, Heading, Text } from "@primer/react";
import { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Accordion } from "./Accordion.jsx";
import { getPageVoiceGuidance } from "../features/contextual/pageVoiceGuidance.js";
import { useSpeechSynthesis } from "../features/voice/useSpeechSynthesis.js";

function getSessionKey(pathname) {
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

  useEffect(() => {
    try {
      if (sessionStorage.getItem(getSessionKey(location.pathname)) === "1") {
        return;
      }
    } catch {
      // noop
    }

    playGuidance();
  }, [location.pathname, playGuidance]);

  useEffect(() => {
    function handleRepeatGuidance() {
      playGuidance();
    }

    window.addEventListener("voice-guidance:repeat", handleRepeatGuidance);

    return () => {
      window.removeEventListener("voice-guidance:repeat", handleRepeatGuidance);
    };
  }, [playGuidance]);

  return (
    <div className="route-voice-guidance">
      <Accordion
        className="route-voice-guidance-accordion"
        titleComponent={(summaryId) => (
          <Heading as="h2" id={summaryId} sx={{ fontSize: 2 }}>
            {guidance.title}
          </Heading>
        )}
        summaryClassName="route-voice-guidance-summary"
        chevronClassName="route-voice-guidance-chevron"
        bodyClassName="route-voice-guidance-body"
        contentClassName="route-voice-guidance-content"
        isOpen={true}
      >
        <Text as="p" sx={{ color: "var(--color-muted)" }}>
          {guidance.description}
        </Text>

        <div className="route-voice-guidance-actions">
          <Button
            className="app-button-primary"
            onClick={playGuidance}
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
            Ouvir instruções
          </Button>
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
