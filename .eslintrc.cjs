// `pnpm lint` (eslint 8) had no config at all, so CI failed before linting a
// line. Recommended TypeScript rules only; these are type declarations.
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { node: true, es2022: true },
  ignorePatterns: ['dist/'],
  rules: {
    // Existing declarations (social-ingest, ...) use `any` and `{}`. Warn so
    // they surface without blocking; tighten once they are typed.
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-types': 'warn',
  },
};
