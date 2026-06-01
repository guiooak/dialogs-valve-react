export const DIALOG_DELAY_TO_CLOSE = 300;
export const DIALOG_MAIN_KEY = "dialog";
export const DIALOG_PROP_PREFIX_SEPARATOR = ".";
export const DIALOG_BOOLEAN_PREFIX = "bool.";
export const DIALOG_BOOLEAN_TRUE = `${DIALOG_BOOLEAN_PREFIX}true`;
export const DIALOG_BOOLEAN_FALSE = `${DIALOG_BOOLEAN_PREFIX}false`;
export const DIALOG_NUMBER_PREFIX = "number.";
// Validates the numeric payload *after* the `number.` prefix is stripped.
// Accepts integers, negatives, decimals and exponent notation (the forms a JS
// number produces via `String(value)`) so serialized numbers round-trip; it
// deliberately rejects hex, `Infinity`, `NaN` and empty payloads.
export const DIALOG_NUMBER_REGEX = /^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
