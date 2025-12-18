import { useState, useEffect } from 'react';

interface PlatformSettings {
  [key: string]: any;
}

let cachedSettings: PlatformSettings | null = null;
let fetchPromise: Promise<PlatformSettings> | null = null;

export function useSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have cached settings, use them
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    // If there's already a fetch in progress, wait for it
    if (fetchPromise) {
      fetchPromise
        .then((data) => {
          setSettings(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
      return;
    }

    // Start a new fetch
    fetchPromise = fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        cachedSettings = data.settings;
        return data.settings;
      });

    fetchPromise
      .then((data) => {
        setSettings(data);
        setLoading(false);
        fetchPromise = null;
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        fetchPromise = null;
      });
  }, []);

  return { settings, loading, error };
}

// Helper function to get a specific setting value
export function getSetting(settings: PlatformSettings | null, key: string, defaultValue: any = null) {
  if (!settings || !settings[key]) {
    return defaultValue;
  }
  return settings[key];
}

// Helper function to invalidate the cache (call this after updating settings in admin)
export function invalidateSettingsCache() {
  cachedSettings = null;
  fetchPromise = null;
}
