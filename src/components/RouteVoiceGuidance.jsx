import { Button, Heading, Text } from "@primer/react";
import { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
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
    <section
      className="route-voice-guidance"
      aria-labelledby="route-voice-guidance-title"
    >
      <details className="route-voice-guidance-accordion" open>
        <summary className="route-voice-guidance-summary">
          <div>
            <Heading
              as="h2"
              id="route-voice-guidance-title"
              sx={{ fontSize: 2 }}
            >
              {guidance.title}
            </Heading>
          </div>
          <span className="route-voice-guidance-chevron" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>

        <div className="route-voice-guidance-body">
          <div className="route-voice-guidance-content">
            <Text as="p" sx={{ color: "var(--color-muted)" }}>
              {guidance.description}
            </Text>
          </div>

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

          <ul className="voice-help-list route-voice-guidance-list">
            {guidance.commands.map((command) => (
              <li key={command}>
                <Text as="p">{command}</Text>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </section>
  );
}
