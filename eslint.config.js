// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    ignores: [
      "**/*.config.ts",
      "**/*.config.js",
      "**/setup-jest.ts",
      "**/jest.config.js",
      "**/angular.json",
      "**/tsconfig*.json",
      "**/*.spec.ts",
      "**/*.test.ts",
      "**/test/**",
      "**/tests/**",
      "dist/**",
      "coverage/**",
      "node_modules/**"
    ],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    ignores: [
      "coverage/**",
      "dist/**",
      "node_modules/**"
    ],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
