// eslint.config.js
// Flat config (ESLint 9+) for a browser-side ES6 module project.
// There is no build step and no framework, so the browser globals the site
// actually uses are declared explicitly rather than pulled in from a package.

export default [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        URLSearchParams: "readonly",
        IntersectionObserver: "readonly",
        Event: "readonly",
        MouseEvent: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },
];
