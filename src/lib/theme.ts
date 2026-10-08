export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "marixtotle-theme";

export function parseThemePreference(value: unknown): ThemePreference {
	if (value === "light" || value === "dark" || value === "system") {
		return value;
	}
	return "system";
}

/** Resolve whether dark mode should be active given a preference + OS setting. */
export function resolveIsDark(
	preference: ThemePreference,
	systemDark: boolean,
): boolean {
	if (preference === "dark") return true;
	if (preference === "light") return false;
	return systemDark;
}
