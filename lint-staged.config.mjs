import path from 'node:path';

/**
 * Monorepo lint-staged config. ESLint 9 flat config resolves relative to the
 * working directory, so we `cd` into the owning package and pass file paths
 * relative to it. Prettier resolves its own config per file. Run from the repo
 * root by the husky pre-commit hook.
 */
const inPackage = (pkg, files) => {
  // Single-quote each path: inside the double-quoted `bash -c` argument these
  // survive lint-staged's command parser (string-argv) and are handled by bash.
  const rel = files.map((f) => `'${path.relative(pkg, f)}'`).join(' ');
  // `npx` resolves the package-local eslint/prettier binaries after the cd.
  return [`bash -c "cd ${pkg} && npx eslint --fix ${rel} && npx prettier --write ${rel}"`];
};

export default {
  'server/**/*.{ts,mjs,js}': (files) => inPackage('server', files),
  'client/**/*.{ts,tsx,mjs,js}': (files) => inPackage('client', files),
  // Root-level docs/config (non-recursive: '*' does not cross '/')
  '*.{json,md,yml,yaml}': (files) =>
    [`prettier --write ${files.map((f) => JSON.stringify(f)).join(' ')}`],
};
