import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface PrivateSpaceContextType {
  isUnlocked: boolean;
  hasPin: boolean;
  unlock: (pin: string) => boolean;
  lock: () => void;
  setPin: (pin: string) => void;
  changePin: (oldPin: string, newPin: string) => boolean;
  verifyPin: (pin: string) => boolean;
}

const PrivateSpaceContext = createContext<PrivateSpaceContextType | null>(null);

export function PrivateSpaceProvider({ children }: { children: ReactNode }) {
  const [storedPin, setStoredPin] = useLocalStorage<string | null>("private-space-pin", null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const hasPin = storedPin !== null;

  const verifyPin = useCallback((pin: string) => {
    return storedPin === pin;
  }, [storedPin]);

  const unlock = useCallback((pin: string) => {
    if (verifyPin(pin)) {
      setIsUnlocked(true);
      return true;
    }
    return false;
  }, [verifyPin]);

  const lock = useCallback(() => {
    setIsUnlocked(false);
  }, []);

  const setPin = useCallback((pin: string) => {
    setStoredPin(pin);
    setIsUnlocked(true);
  }, [setStoredPin]);

  const changePin = useCallback((oldPin: string, newPin: string) => {
    if (verifyPin(oldPin)) {
      setStoredPin(newPin);
      return true;
    }
    return false;
  }, [verifyPin, setStoredPin]);

  return (
    <PrivateSpaceContext.Provider value={{
      isUnlocked,
      hasPin,
      unlock,
      lock,
      setPin,
      changePin,
      verifyPin,
    }}>
      {children}
    </PrivateSpaceContext.Provider>
  );
}

export function usePrivateSpace() {
  const context = useContext(PrivateSpaceContext);
  if (!context) {
    throw new Error("usePrivateSpace must be used within PrivateSpaceProvider");
  }
  return context;
}
