import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    '.next/**',
    'out/**',
    '.npm-cache/**',
    '.sites-runtime/**',
    '.wrangler/**',
    '.agents/**',
    '.codex/**',
    'tmp/**',
    'next-env.d.ts',
  ]),
]);
