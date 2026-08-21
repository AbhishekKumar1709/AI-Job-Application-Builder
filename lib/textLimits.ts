export const SHORT_TEXT_MAX = 200;
export const LONG_TEXT_MAX = 2000;

export function lengthError(value: string, max: number, label: string): string | null {
  return value.length > max ? `${label} is too long (max ${max} characters).` : null;
}
