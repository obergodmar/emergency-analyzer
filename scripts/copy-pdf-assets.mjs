import { createRequire } from 'node:module';
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const pdfRequire = createRequire(require.resolve('react-pdf'));
const root = dirname(pdfRequire.resolve('pdfjs-dist/package.json'));
mkdirSync('public/pdf-assets', { recursive: true });
cpSync(join(root, 'LICENSE'), 'public/pdf-assets/LICENSE');
cpSync(join(root, 'build/pdf.worker.min.mjs'), 'public/pdf.worker.min.mjs');
for (const directory of ['cmaps', 'standard_fonts', 'wasm'])
  cpSync(join(root, directory), join('public/pdf-assets', directory), { recursive: true });
