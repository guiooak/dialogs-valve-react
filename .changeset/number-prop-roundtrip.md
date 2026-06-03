---
"@dialogs-valve/react": patch
---

Fix number prop round-tripping for negative and decimal (and exponent) values. `parsePropValue` previously validated with `/^number.\d+$/`, which only matched non-negative integers — so a serialized `number.-5` or `number.3.14` came back as a **string** instead of a number. The numeric payload is now matched against a grammar that accepts signs, decimals and exponent notation (the forms `String(value)` produces), while still rejecting hex, `Infinity`/`NaN` and empty payloads. The stray unescaped `.` in the old pattern is also gone.
