// GitHub Pages serves 404.html for unknown paths. Copying index.html there lets
// deep links such as /f1-dashboard/session/11388 boot the Angular router.
import { copyFileSync, existsSync } from 'node:fs';

const dir = process.argv[2] ?? 'dist/f1-dashboard/browser';
const index = `${dir}/index.html`;
if (!existsSync(index)) {
  console.error(`spa-fallback: ${index} not found; run the build first.`);
  process.exit(1);
}
copyFileSync(index, `${dir}/404.html`);
console.log(`spa-fallback: wrote ${dir}/404.html`);
