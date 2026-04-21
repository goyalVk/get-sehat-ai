// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@next/next/no-img-element": "off",        // img tag allow
      "react/no-unescaped-entities": "off",      // apostrophe allow
      "react-hooks/exhaustive-deps": "warn",     // warning only, not error
    }
  }
];

export default eslintConfig;