import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Override rules for Library.tsx to ignore specific errors
    overrides: [
      {
        files: ["Library.tsx"],
        rules: {
          // Add specific rules to disable here, e.g.:
          ""
        },
      },
    ],
  },
];

export default eslintConfig;
