import type { User } from "../../types";

export const VOICE_ONBOARDING_VERSION = "2026-04";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface OnboardingOptions {
  storage?: StorageLike | null;
  version?: string;
}

type UserLike = Partial<Pick<User, "id" | "email" | "name">> | null | undefined;

function normalizeUserKey(user: UserLike): string {
  if (!user) {
    return "anonymous";
  }

  const base = String(user.id ?? user.email ?? user.name ?? "anonymous");
  return base.trim().toLowerCase();
}

function getStorage(storageOverride?: StorageLike | null): StorageLike | null {
  if (storageOverride) {
    return storageOverride;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage ?? null;
}

export function getVoiceOnboardingStorageKey(
  user: UserLike,
  version: string = VOICE_ONBOARDING_VERSION,
): string {
  return `webspeech-voice-onboarding:${version}:${normalizeUserKey(user)}`;
}

export function hasCompletedVoiceOnboarding(
  user: UserLike,
  options: OnboardingOptions = {},
): boolean {
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

export function markVoiceOnboardingCompleted(
  user: UserLike,
  options: OnboardingOptions = {},
): void {
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

export function buildInitialVoicePresentation(user: UserLike): string {
  const userName = String(user?.name ?? "").trim();
  const greeting = userName ? `Olá, ${userName}.` : "Olá.";

  return [
    `${greeting} Bem-vindo à livraria online com assistente por voz.`,
    "No menu principal, você pode abrir Início, Livros, Carrinho e Pedidos.",
    "Para falar com o assistente, pressione a tecla espaço.",
    "Se pressionar espaço novamente, o comando de voz é cancelado.",
    "Comandos básicos: 'Abrir livros', 'Abrir carrinho', 'Abrir pedidos' e 'Voltar para início'.",
    "Quando precisar, diga 'Me ajude' para ouvir os comandos disponíveis.",
    "Ao final desta apresentação, diga 'Ouvir novamente' para escutar de novo.",
    "Diga 'Concluir apresentação' para fechar esta modal e continuar.",
    "Diga 'Pular por agora' para fechar esta modal e continuar depois.",
  ].join(" ");
}
