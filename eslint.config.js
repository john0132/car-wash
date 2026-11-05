import pluginJs from "@eslint/js"
import prettierConfig from "eslint-config-prettier/flat"
import importPlugin from "eslint-plugin-import"
import pluginReact from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["app/javascript/**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  {
    ignores: [
      "app/javascript/shared/components/ui/**",
      "app/javascript/routes/**",
    ],
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pluginJs.configs.recommended,
  reactHooks.configs.flat.recommended,
  ...tseslint.configs.stylisticTypeChecked,
  ...tseslint.configs.recommendedTypeChecked,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  prettierConfig,
  {
    ...importPlugin.flatConfigs.recommended,
    ...importPlugin.flatConfigs.typescript,
    ...importPlugin.flatConfigs.react,
    settings: { "import/resolver": { typescript: {} } },
    rules: {
      "import/order": [
        "error",
        {
          pathGroups: [
            {
              pattern: "@/**",
              group: "external",
              position: "after",
            },
          ],
          "newlines-between": "always",
          named: true,
          alphabetize: { order: "asc" },
        },
      ],
      "import/first": "error",
      "import/extensions": [
        "error",
        "always",
        {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "react/prop-types": "off",
    },
  },
  // Architectural boundaries: admin and website are separate apps; shared is domain-free.
  {
    files: ["app/javascript/**/*.{ts,tsx}"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: import.meta.dirname,
          zones: [
            {
              target: "./app/javascript/shared",
              from: [
                "./app/javascript/admin",
                "./app/javascript/website",
                "./app/javascript/entrypoints",
                "./app/javascript/routes",
              ],
              message:
                "shared/ must stay app- and domain-independent: it may only import from shared/.",
            },
            {
              target: [
                "./app/javascript/admin",
                "./app/javascript/entrypoints/admin.tsx",
              ],
              from: "./app/javascript/website",
              message:
                "Admin must not import website code. Move genuinely reusable code to shared/.",
            },
            {
              target: [
                "./app/javascript/website",
                "./app/javascript/entrypoints/website.tsx",
              ],
              from: "./app/javascript/admin",
              message:
                "Website must not import admin code. Move genuinely reusable code to shared/.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },
]
