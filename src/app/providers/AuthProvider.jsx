import { createContext, useContext, useMemo, useState } from "react";
import {
  VOICE_ONBOARDING_VERSION,
  hasCompletedVoiceOnboarding,
  markVoiceOnboardingCompleted,
} from "../../features/onboarding/voiceOnboarding.js";

const AUTH_STORAGE_KEY = "webspeech-auth-user";

const AuthContext = createContext(undefined);

function getInitialUser() {
  try {
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);

  const login = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const completeVoiceOnboarding = () => {
    if (!user) {
      return;
    }

    markVoiceOnboardingCompleted(user, {
      version: VOICE_ONBOARDING_VERSION,
    });
    setUser((currentUser) => (currentUser ? { ...currentUser } : currentUser));
  };

  const isVoiceOnboardingCompleted = hasCompletedVoiceOnboarding(user, {
    version: VOICE_ONBOARDING_VERSION,
  });

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      completeVoiceOnboarding,
      shouldPlayVoiceOnboarding: Boolean(user) && !isVoiceOnboardingCompleted,
      voiceOnboardingVersion: VOICE_ONBOARDING_VERSION,
    }),
    [user, isVoiceOnboardingCompleted],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
