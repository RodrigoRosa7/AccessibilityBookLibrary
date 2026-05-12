import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import { VoiceAssistantPanel } from "./VoiceAssistantPanel";

const noop = vi.fn();

const defaultProps = {
  pathname: "/books",
  isListening: false,
  isSpeaking: false,
  isSupported: true,
  feedback: "",
  feedbackSeverity: "info" as const,
  voiceError: "",
  lastCommand: "",
  transcript: "",
  typedCommand: "",
  speechRate: 1,
  muted: false,
  onTypedCommandChange: noop,
  onTypedCommandSubmit: noop,
  onStart: noop,
  onStop: noop,
  onCycleSpeechRate: noop,
  onToggleMute: noop,
};

describe("VoiceAssistantPanel accessibility", () => {
  it("has no axe violations in idle state", async () => {
    const { container } = render(<VoiceAssistantPanel {...defaultProps} />);
    const results = await axe.run(container);
    if (results.violations.length > 0) {
      console.error(
        "Axe violations:",
        JSON.stringify(
          results.violations.map((v) => ({
            id: v.id,
            description: v.description,
            nodes: v.nodes.map((n) => n.html),
          })),
          null,
          2,
        ),
      );
    }
    expect(results.violations).toHaveLength(0);
  });

  it("has no axe violations while listening", async () => {
    const { container } = render(
      <VoiceAssistantPanel {...defaultProps} isListening={true} />,
    );
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });

  it("has no axe violations when voice is unsupported", async () => {
    const { container } = render(
      <VoiceAssistantPanel {...defaultProps} isSupported={false} />,
    );
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });

  it("has no axe violations while muted", async () => {
    const { container } = render(
      <VoiceAssistantPanel {...defaultProps} muted={true} />,
    );
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
