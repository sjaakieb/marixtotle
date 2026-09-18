export const MACRONS_LOWER = ["ā", "ē", "ī", "ō", "ū"] as const;
export const MACRONS_UPPER = ["Ā", "Ē", "Ī", "Ō", "Ū"] as const;
export const MACRONS = [...MACRONS_LOWER, ...MACRONS_UPPER] as const;

export type MacronChar = (typeof MACRONS)[number];

const baseToMacron: Record<string, string> = {
  a: "ā",
  e: "ē",
  i: "ī",
  o: "ō",
  u: "ū",
  A: "Ā",
  E: "Ē",
  I: "Ī",
  O: "Ō",
  U: "Ū",
};

const macronToBase: Record<string, string> = {
  ā: "a",
  ē: "e",
  ī: "i",
  ō: "o",
  ū: "u",
  Ā: "A",
  Ē: "E",
  Ī: "I",
  Ō: "O",
  Ū: "U",
};

export function getMacronForBase(char: string): string | undefined {
  return baseToMacron[char];
}

export function isMacron(char: string): boolean {
  return char in macronToBase;
}

/**
 * Insert char at cursor position inside an input element.
 * Returns the new string and new cursor position.
 */
export function insertAtCursor(
  value: string,
  selectionStart: number | null,
  selectionEnd: number | null,
  char: string,
): { value: string; cursor: number } {
  const start = selectionStart ?? value.length;
  const end = selectionEnd ?? value.length;
  const newValue = value.slice(0, start) + char + value.slice(end);
  return { value: newValue, cursor: start + char.length };
}

/**
 * Toggle the character before the cursor: a -> ā, ā -> a etc.
 * Useful for quick correction without moving cursor.
 */
export function toggleMacronBeforeCursor(
  value: string,
  cursor: number | null,
): { value: string; cursor: number } | null {
  if (cursor == null || cursor === 0) return null;
  const idx = cursor - 1;
  const ch = value[idx];
  if (ch in baseToMacron) {
    const newValue = value.slice(0, idx) + baseToMacron[ch] + value.slice(idx + 1);
    return { value: newValue, cursor };
  }
  if (ch in macronToBase) {
    const newValue = value.slice(0, idx) + macronToBase[ch] + value.slice(idx + 1);
    return { value: newValue, cursor };
  }
  return null;
}
