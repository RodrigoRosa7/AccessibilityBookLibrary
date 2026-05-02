import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  VOICE_ONBOARDING_VERSION,
  hasCompletedVoiceOnboarding,
  markVoiceOnboardingCompleted,
} from "../../features/onboarding/voiceOnboarding";
import type { User } from "../../types";

const AUTH_STORAGE_KEY = "webspeech-auth-user";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  completeVoiceOnboarding: () => void;
  shouldPlayVoiceOnboarding: boolean;
  voiceOnboardingVersion: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitialUser(): User | null {
  try {
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    return savedUser ? (JSON.parse(savedUser) as User) : null;
  } catch {
    return null;
  }
}

function clearRouteGuidanceSessionFlags(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const storage = window.sessionStorage;
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith("voice-guidance-played:")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => storage.removeItem(key));
  } catch {
    // noop: session storage may be unavailable
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);

  const login = (nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    clearRouteGuidanceSessionFlags();
  };

  const completeVoiceOnboarding = () => {
    if (!user) {
      return;
    }

    markVoiceOnboardingCompleted(user, { version: VOICE_ONBOARDING_VERSION });
    setUser((current) => (current ? { ...current } : current));
  };

  const isVoiceOnboardingCompleted = hasCompletedVoiceOnboarding(user, {
    version: VOICE_ONBOARDING_VERSION,
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      completeVoiceOnboarding,
      shouldPlayVoiceOnboarding: Boolean(user) && !isVoiceOnboardingCompleted,
      voiceOnboardingVersion: VOICE_ONBOARDING_VERSION,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, isVoiceOnboardingCompleted],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
