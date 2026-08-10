/**
 * Turn each extracted app.js into a course.js that supplies its data and
 * instruments to the shared shell.
 *
 * The curriculum data, the quiz banks, the instrument builders and the
 * final-exam verdict copy are lifted verbatim; everything else in the original
 * file was the shell, which now lives in shared/shell.js.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const COURSES = [
  { slug: 'context-engineering', key: 'console_ce_full_v1' },
  { slug: 'agentic-patterns', key: 'console_ap_full_v1' },
  { slug: 'multi-agent-systems', key: 'console_ma_full_v1' },
];

/** Slice from `open` to the brace/bracket that closes it. */
function balanced(src, open, openChar, closeChar) {
  const start = src.indexOf(open);
  if (start === -1) throw new Error(`missing: ${open}`);
  let depth = 0;
  let i = src.indexOf(openChar, start);
  const from = i;
  for (; i < src.length; i++) {
    if (src[i] === openChar) depth++;
    else if (src[i] === closeChar) {
      depth--;
      if (depth === 0) break;
    }
  }
  return { text: src.slice(start, i + 1), from, to: i + 1 };
}

for (const { slug, key } of COURSES) {
  const src = readFileSync(join(root, 'courses', slug, 'app.js'), 'utf8');

  const sections = balanced(src, 'var SECTIONS', '[', ']').text;
  const quizzes = balanced(src, 'var QUIZZES', '{', '}').text;

  // Which data-mount kinds this course uses, and the builder each maps to.
  const mounts = [];
  const mountRe = /(?:kind|k)===\"([a-z]+)\"\s*\)\s*(build[A-Za-z]+)\(/g;
  let mm;
  while ((mm = mountRe.exec(src)) !== null) {
    if (mm[1] !== 'quiz') mounts.push({ kind: mm[1], fn: mm[2] });
  }

  // Everything the shared shell now owns. Any other top-level function belongs
  // to the course — the instrument builders plus whatever helpers they call.
  const SHELL_FNS = new Set([
    'save',
    'curTheme',
    'sectionOf',
    'buildSidebar',
    'refreshProgress',
    'meta',
    'go',
    'buildFooter',
    'mountWidgets',
    'buildQuiz',
    'closeMenu',
  ]);

  const own = [...src.matchAll(/^ {2}function ([a-zA-Z]+)\(/gm)]
    .map((m) => m[1])
    .filter((name) => !SHELL_FNS.has(name));

  const builders = own.map((name) => balanced(src, `function ${name}(`, '{', '}').text);

  const missing = mounts.filter((m) => !own.includes(m.fn));
  if (missing.length) throw new Error(`${slug}: builders not found: ${missing.map((m) => m.fn)}`);

  // The final-exam verdict is course-specific copy embedded in the old quiz code.
  const verdictMatch = /var msg\s*=\s*([\s\S]*?);\s*\n/.exec(src);
  if (!verdictMatch) throw new Error(`${slug}: no verdict expression`);
  const verdict = verdictMatch[1].trim();

  const out = `/**
 * ${slug} — curriculum, quiz banks and instruments.
 *
 * The shell (sidebar, progress, lesson rendering, quiz engine, drawer) is in
 * shared/shell.js. This file is the course itself.
 */
(function () {
  'use strict';

  /* ---------- DATA ---------- */
  ${sections.replace(/\n/g, '\n  ')}

  ${quizzes.replace(/\n/g, '\n  ')}

  /* ---------- INSTRUMENTS ---------- */
${builders.map((b) => '  ' + b.replace(/\n/g, '\n  ')).join('\n\n')}

  /* ---------- GO ---------- */
  Console.init({
    storageKey: '${key}',
    sections: SECTIONS,
    quizzes: QUIZZES,
    instruments: {
${mounts.map((m) => `      ${m.kind}: ${m.fn},`).join('\n')}
    },
    verdict: function (pctv) {
      return ${verdict.replace(/\n/g, '\n      ')};
    },
  });
})();
`;

  writeFileSync(join(root, 'courses', slug, 'course.js'), out);
  console.log(
    `${slug}: ${sections.length + quizzes.length} bytes data, ` +
      `${mounts.length} instruments (${mounts.map((m) => m.kind).join(', ')})`,
  );
}
