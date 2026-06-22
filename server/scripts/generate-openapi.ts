import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildOpenApiDocument } from '../src/docs/openapi';

/** Writes the OpenAPI spec to server/openapi.json (committed, Postman-importable). */
const outPath = join(process.cwd(), 'openapi.json');
writeFileSync(outPath, JSON.stringify(buildOpenApiDocument(), null, 2) + '\n');
console.log(`✓ Wrote ${outPath}`);
