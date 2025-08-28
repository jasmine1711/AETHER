import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node, // so Node.js globals like __dirname are allowed
    },
    rules: {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-undef": "error",
      "semi": ["error", "always"],
    quotes: ["error", "double"],


    },
  },
];
