import { useVoiceAssistant } from "../features/voice/hooks/useVoiceAssistant";
import { VoiceAssistantPanel } from "../features/voice/components/VoiceAssistantPanel";

export function GlobalVoiceAssistant() {
  const {
    isListening,
    isSpeaking,
    isSupported,
    feedback,
    feedbackSeverity,
    voiceError,
    lastCommand,
    transcript,
    typedCommand,
    setTypedCommand,
    startVoiceCommand,
    cancelVoiceCommand,
    runTypedCommand,
    pathname,
  } = useVoiceAssistant();

  return (
    <VoiceAssistantPanel
      pathname={pathname}
      isListening={isListening}
      isSpeaking={isSpeaking}
      isSupported={isSupported}
      feedback={feedback}
      feedbackSeverity={feedbackSeverity}
      voiceError={voiceError}
      lastCommand={lastCommand}
      transcript={transcript}
      typedCommand={typedCommand}
      onTypedCommandChange={setTypedCommand}
      onTypedCommandSubmit={runTypedCommand}
      onStart={startVoiceCommand}
      onStop={cancelVoiceCommand}
    />
  );
}
