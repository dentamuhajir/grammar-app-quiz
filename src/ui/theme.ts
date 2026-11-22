export type ThemePreference = "system" | "light" | "dark";
export const THEME_STORAGE_KEY = "grammar-drill.theme.v1";

export function loadTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
  } catch { /* The system preference works when storage is unavailable. */ }
  return "system";
}

export function applyTheme(preference: ThemePreference) {
  const dark = preference === "dark"
    || preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = dark ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#181b22" : "#fbf6ea");
}

export function saveTheme(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch { /* The selected theme still applies to the current session. */ }
}
