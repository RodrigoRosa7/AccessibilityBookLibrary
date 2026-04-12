export const VOICE_ONBOARDING_VERSION = "2026-04";

function normalizeUserKey(user) {
  if (!user) {
    return "anonymous";
  }

  const base = String(user.id ?? user.email ?? user.name ?? "anonymous");
  return base.trim().toLowerCase();
}

function getStorage(storageOverride) {
  if (storageOverride) {
    return storageOverride;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage ?? null;
}

export function getVoiceOnboardingStorageKey(
  user,
  version = VOICE_ONBOARDING_VERSION,
) {
  return `webspeech-voice-onboarding:${version}:${normalizeUserKey(user)}`;
}

export function hasCompletedVoiceOnboarding(user, options = {}) {
  const storage = getStorage(options.storage);
  if (!storage || !user) {
    return false;
  }

  try {
    return (
      storage.getItem(getVoiceOnboardingStorageKey(user, options.version)) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function markVoiceOnboardingCompleted(user, options = {}) {
  const storage = getStorage(options.storage);
  if (!storage || !user) {
    return;
  }

  try {
    storage.setItem(getVoiceOnboardingStorageKey(user, options.version), "1");
  } catch {
    // noop: avoid breaking auth flow when storage is unavailable
  }
}

export function buildInitialVoicePresentation(user) {
  const userName = String(user?.name ?? "").trim();
  const greeting = userName ? `Olá, ${userName}.` : "Olá.";

  return [
    `${greeting} Bem-vindo à livraria online com assistente por voz.`,
    "No menu principal, você pode abrir Início, Livros, Carrinho e Pedidos.",
    "Para falar com o assistente, pressione a tecla espaço.",
    "Se pressionar espaço novamente, o comando de voz é cancelado.",
    "Comandos básicos: 'Abrir livros', 'Abrir carrinho', 'Abrir pedidos' e 'Voltar para início'.",
    "Quando precisar, diga 'Me ajude' para ouvir os comandos disponíveis.",
    "Você pode repetir esta apresentação no botão 'ouvir novamente' ou executando o comando 'repetir instruções'.",
  ].join(" ");
}
