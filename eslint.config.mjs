import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';

// Flat config — run with `bun run lint`.
const config = [
  { ignores: ['.next/**', 'out/**', 'build/**', 'public/**'] },
  ...nextCoreWebVitals,
  prettier
];

export default config;
