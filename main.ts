// Neon County cover studio: square 1080x1080, portrait 1080x1350, landscape 1920x1080.
// Poster art is drawn by the app canvas renderer in the browser.
// Hands in app/, screenshots/, and dossier.json for the Neon County cover studio.
// Vendored buildDossier packages the dossier; exports: square 1080x1080, portrait 1080x1350, landscape 1920x1080.
// Run `node serve.ts --port 8080` to preview the editor locally before submission.
// Outside the grader container, MAKEFUN_OUTPUT_DIR may point to a local output directory.

// The dossier carries the editor and three exported-cover screenshots.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Hand in the offline Neon County editor and its finished poster screenshots.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
