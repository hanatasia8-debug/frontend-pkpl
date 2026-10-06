/** Key-value map of site settings, e.g. `{ contact_email: "..." }`. */
export type SettingsMap = Record<string, unknown>;

export interface SettingsResponse {
  settings: SettingsMap;
}
