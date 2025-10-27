import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import checkFile from "eslint-plugin-check-file";
import n from "eslint-plugin-n";
import {defineConfig, globalIgnores} from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    plugins: {
      "check-file": checkFile,
      n: n,
    },
    rules: {
      "prefer-arrow-callback": ["error"],
      "prefer-template": ["error"],
      semi: ["error"],
      quotes: ["error", "double"],
      "no-undef": ["warn"],
      "n/no-process-env": ["error"],

      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{js,jsx,ts,tsx}": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],

      "check-file/folder-naming-convention": [
        "error",
        {
          "src/**/!(*)*": "NEXT_JS_APP_ROUTER_CASE",
        },
        {
          //
          errorMessage:
            // eslint-disable-next-line quotes
            `The folder "{{ target }}" does not match the KEBAB_CASE pattern`,
        },
      ],
    },
  },
]);

export default eslintConfig;
