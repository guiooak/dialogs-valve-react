import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  {
    ignores: ["dist/", "node_modules/", "*.config.*"],
    plugins: {
      import: importPlugin,
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "import/no-default-export": "error",
    },
  },
  {
    files: ["demo-app/src/**/*.{ts,tsx}"],
    rules: {
      "import/no-default-export": "off",
    },
  },
);
