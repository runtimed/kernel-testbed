#!/usr/bin/env tsx
/**
 * Generate markdown files from conformance data
 *
 * Run after `next build` to generate markdown versions of each page
 * alongside the HTML output in out/
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ConformanceMatrix } from '../src/types/report.js';
import {
  renderSummaryMatrixMarkdown,
  renderKernelDetailMarkdown,
  renderLlmsTxt,
  renderLlmsFullTxt,
} from '../src/lib/markdown-renderers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(__dirname, '..');
const outDir = path.join(siteDir, 'out');
const dataPath = path.join(siteDir, 'public/data/conformance-matrix.json');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath: string, content: string) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  ✓ ${path.relative(outDir, filePath)}`);
}

async function main() {
  console.log('Generating markdown files...\n');

  // Load conformance data
  if (!fs.existsSync(dataPath)) {
    console.error('Error: conformance-matrix.json not found at', dataPath);
    console.error('Run `npm run fetch-data` first');
    process.exit(1);
  }

  const raw = fs.readFileSync(dataPath, 'utf-8');
  const matrix: ConformanceMatrix = JSON.parse(raw);

  console.log(`Found ${matrix.reports.length} kernel reports\n`);

  // Generate llms.txt
  writeFile(path.join(outDir, 'llms.txt'), renderLlmsTxt(matrix));

  // Generate llms-full.txt
  writeFile(path.join(outDir, 'llms-full.txt'), renderLlmsFullTxt(matrix));

  // Generate index.md (summary)
  writeFile(path.join(outDir, 'index.md'), renderSummaryMatrixMarkdown(matrix));

  // Generate per-kernel markdown files
  const kernelDir = path.join(outDir, 'kernel');
  ensureDir(kernelDir);

  for (const report of matrix.reports) {
    const fileName = `${encodeURIComponent(report.kernel_name)}.md`;
    writeFile(
      path.join(kernelDir, fileName),
      renderKernelDetailMarkdown(report)
    );
  }

  console.log(`\nDone! Generated ${3 + matrix.reports.length} files`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
