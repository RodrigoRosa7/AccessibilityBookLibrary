// Public API re-export — keeps all consumers unchanged while the
// implementation lives in domain/intents/.
export { parseVoiceIntent } from "./domain/intents/parseIntent";
export { VOICE_INTENTS } from "../../types";
export type { ParsedIntent, ParseVoiceIntentOptions } from "../../types";
