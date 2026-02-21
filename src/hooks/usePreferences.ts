import { useState, useCallback, useEffect } from 'react';
import type { Preferences } from '../types';
import { defaultPreferences, PREFERENCES_VERSION } from '../data/defaults';

const STORAGE_KEY = 'travel-optimizer-prefs';

function loadFromStorage(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Preferences;
    if (parsed.version !== PREFERENCES_VERSION) {
      // Schema migration: for now just reset to defaults
      return defaultPreferences;
    }
    return parsed;
  } catch {
    return defaultPreferences;
  }
}

function saveToStorage(prefs: Preferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(loadFromStorage);

  useEffect(() => {
    saveToStorage(preferences);
  }, [preferences]);

  const updatePreferences = useCallback((updated: Preferences) => {
    setPreferences(updated);
  }, []);

  const loadDefaults = useCallback(() => {
    setPreferences(defaultPreferences);
  }, []);

  return { preferences, updatePreferences, loadDefaults };
}
