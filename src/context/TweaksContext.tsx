'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TweakValues {
  accentColor: string;
  showBadges: boolean;
  gridGap: number;
}

const DEFAULTS: TweakValues = {
  accentColor: '#F39200',
  showBadges: true,
  gridGap: 22,
};

interface TweaksContextType {
  tweaks: TweakValues;
  setTweak: <K extends keyof TweakValues>(key: K, value: TweakValues[K]) => void;
}

const TweaksContext = createContext<TweaksContextType | null>(null);

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [tweaks, setTweaks] = useState<TweakValues>(DEFAULTS);

  useEffect(() => {
    document.documentElement.style.setProperty('--orange', tweaks.accentColor);
  }, [tweaks.accentColor]);

  const setTweak = <K extends keyof TweakValues>(key: K, value: TweakValues[K]) => {
    setTweaks(prev => ({ ...prev, [key]: value }));
  };

  return (
    <TweaksContext.Provider value={{ tweaks, setTweak }}>
      {children}
    </TweaksContext.Provider>
  );
}

export function useTweaks() {
  const ctx = useContext(TweaksContext);
  if (!ctx) throw new Error('useTweaks must be used within TweaksProvider');
  return ctx;
}
