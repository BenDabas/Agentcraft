/**
 * Promote instrument styles that more than one course already shares.
 *
 * console.css holds what all courses share structurally. This adds
 * instruments.css: the reusable widget primitives — sliders and gauges,
 * the step-through log, the picker, the diagnosis drill — so a new course can
 * build an instrument without copying CSS.
 *
 * A rule moves only when its text is byte-identical in every course that has
 * it, and at least two courses have it. Anything unique to one course stays in
 * that course's sheet.
 *
 * `ALSO_PROMOTE` names selector prefixes that only one course uses today but
 * the next course reuses by name; they are listed explicitly rather than
 * inferred, so the promotion stays reviewable.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const COURSES = ['context-engineering', 'agentic-patterns', 'multi-agent-systems'];

const ALSO_PROMOTE = ['.drill', '.symptom', '.dg-', '.gauge', '.stackbar', '.sig-'];

function parse(css) {
  const blocks = [];
  let i = 0;
  while (i < css.length) {
    i += /^\s*/.exec(css.slice(i))[0].length;
    if (css.startsWith('/*', i)) {
      const e = css.indexOf('*/', i);
      i = e === -1 ? css.length : e + 2;
      continue;
    }
    if (i >= css.length) break;
    const brace = css.indexOf('{', i);
    if (brace === -1) break;
    const prelude = css.slice(i, brace).trim();
    let depth = 0;
    let j = brace;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    blocks.push({ prelude, text: css.slice(i, j + 1), at: prelude.startsWith('@') });
    i = j + 1;
  }
  return blocks;
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();

const sheets = Object.fromEntries(
  COURSES.map((s) => [s, parse(readFileSync(join(root, 'courses', s, 'theme.css'), 'utf8'))]),
);

// Count how many courses contain each exact rule text.
const counts = new Map();
for (const s of COURSES) {
  for (const b of sheets[s]) {
    if (b.at) continue; // leave at-rules (palette + breakpoints) with the course
    const k = norm(b.text);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
}

// Palette variables must never leave the course sheet — they are the identity.
const isPalette = (b) => b.prelude.startsWith(':root');
const named = (b) => ALSO_PROMOTE.some((p) => b.prelude.includes(p));

const promoted = [];
const seen = new Set();

for (const s of COURSES) {
  const keep = [];
  for (const b of sheets[s]) {
    const k = norm(b.text);
    const shareable = !b.at && !isPalette(b) && (counts.get(k) >= 2 || named(b));
    if (shareable) {
      if (!seen.has(k)) {
        seen.add(k);
        promoted.push(b.text);
      }
    } else {
      keep.push(b.text);
    }
  }
  writeFileSync(
    join(root, 'courses', s, 'theme.css'),
    `/* ${s} — accent palette and styles unique to this course's instruments.\n   Loads after shared/console.css and shared/instruments.css. */\n\n` +
      keep.join('\n') +
      '\n',
  );
  console.log(`${s}: ${keep.length} rules kept`);
}

writeFileSync(
  join(root, 'shared', 'instruments.css'),
  `/*\n * Agentcraft — reusable instrument primitives.\n *\n * Widget chrome used by more than one course: gauges and sliders, the\n * step-through log, the branching picker, the diagnosis drill. Courses style\n * only what is genuinely their own on top of this.\n */\n\n${promoted.join('\n')}\n`,
);
console.log(`shared/instruments.css: ${promoted.length} rules`);
