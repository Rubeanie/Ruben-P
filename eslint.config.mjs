import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';

// Flat config (ESLint 9 / Next 16 — `next lint` was removed, run via `bun run lint`).
const config = [
  { ignores: ['.next/**', 'out/**', 'build/**', 'public/**'] },
  ...nextCoreWebVitals,
  prettier
];

export default config;
