import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';

// Flat config — run with `bun run lint`.
const config = [
  { ignores: ['.next/**', 'out/**', 'build/**', 'public/**'] },
  ...nextCoreWebVitals,
  // Sanity Studio admin UI never renders through next/image, so the no-img-element LCP rationale doesn't apply here.
  { files: ['sanity/**'], rules: { '@next/next/no-img-element': 'off' } },
  prettier
];

export default config;
