import type { AppDb } from "./collection";
import type { AppSettings } from "./schemas";

export const APP_SETTINGS_ID = "app";

const defaultSettings = (): AppSettings => ({
  id: APP_SETTINGS_ID,
  theme: "dark",
  language: "en",
  syncEnabled: false,
});

export function readAppSettings(db: AppDb): AppSettings {
  const existing = db.collections.settings.get(APP_SETTINGS_ID);
  if (existing) return existing;
  db.collections.settings.insert(defaultSettings());
  return db.collections.settings.get(APP_SETTINGS_ID) ?? defaultSettings();
}

export function applyManagedSyncGate(db: AppDb, isAuthenticated: boolean): AppSettings {
  const settings = readAppSettings(db);
  db.setSyncEnabled(Boolean(isAuthenticated && settings.syncEnabled));
  return settings;
}

export function setManagedSyncEnabled(
  db: AppDb,
  enabled: boolean,
  isAuthenticated: boolean,
): AppSettings {
  const current = readAppSettings(db);
  if (db.collections.settings.has(APP_SETTINGS_ID)) {
    db.collections.settings.update(APP_SETTINGS_ID, (draft) => {
      draft.syncEnabled = enabled;
    });
  } else {
    db.collections.settings.insert({ ...current, syncEnabled: enabled });
  }
  const next = readAppSettings(db);
  db.setSyncEnabled(Boolean(isAuthenticated && next.syncEnabled));
  return next;
}
