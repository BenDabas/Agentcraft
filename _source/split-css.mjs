/**
 * Split the three extracted course stylesheets into one shared sheet plus a
 * small per-course sheet, without rewriting a single declaration.
 *
 * A rule block is "shared" when its exact text appears in all three courses.
 * Everything else is course-specific — which in practice means the accent
 * variables and the styles for that course's own instruments.
 *
 * Load order is shared first, course second, so the per-course :root blocks
 * override the shared palette and instrument rules simply add on.
 *
 * @media blocks are recursed into, so the common half of a breakpoint stays
 * shared even when one course adds instrument rules to it.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const COURSES = ['context-engineering', 'agentic-patterns', 'multi-agent-systems'];

/**
 * Parse a stylesheet into top-level blocks. Each block is either a plain rule
 * ({selector, text}) or an at-rule with nested children.
 */
function parse(css) {
  const blocks = [];
  let i = 0;

  while (i < css.length) {
    // Skip whitespace and comments between blocks.
    const ws = /^\s*/.exec(css.slice(i))[0];
    i += ws.length;
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i);
      i = end === -1 ? css.length : end + 2;
      continue;
    }
    if (i >= css.length) break;

    const braceAt = css.indexOf('{', i);
    if (braceAt === -1) break;
    const prelude = css.slice(i, braceAt).trim();

    // Walk to the matching close brace.
    let depth = 0;
    let j = braceAt;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    const body = css.slice(braceAt + 1, j);
    const text = css.slice(i, j + 1);

    if (prelude.startsWith('@media') || prelude.startsWith('@supports')) {
      blocks.push({ kind: 'at', prelude, children: parse(body), text });
    } else {
      blocks.push({ kind: 'rule', prelude, text });
    }
    i = j + 1;
  }
  return blocks;
}

/** Normalize for comparison — whitespace differences are not real differences. */
const norm = (s) => s.replace(/\s+/g, ' ').trim();

const parsed = Object.fromEntries(
  COURSES.map((slug) => [
    slug,
    parse(readFileSync(join(root, 'courses', slug, 'theme.css'), 'utf8')),
  ]),
);

/** Flatten a rule list to a set of normalized texts, for membership tests. */
function ruleTexts(blocks, into = new Set()) {
  for (const b of blocks) {
    if (b.kind === 'at') {
      for (const c of b.children) into.add(b.prelude + '||' + norm(c.text));
    } else {
      into.add(norm(b.text));
    }
  }
  return into;
}

const textSets = Object.fromEntries(
  COURSES.map((slug) => [slug, ruleTexts(parsed[slug])]),
);

const inAll = (key) => COURSES.every((slug) => textSets[slug].has(key));

/** Partition one course's blocks into [shared, own]. */
function partition(blocks) {
  const shared = [];
  const own = [];
  for (const b of blocks) {
    if (b.kind === 'at') {
      const s = [];
      const o = [];
      for (const c of b.children) {
        (inAll(b.prelude + '||' + norm(c.text)) ? s : o).push(c.text);
      }
      if (s.length) shared.push(`${b.prelude} {\n${s.join('\n')}\n}`);
      if (o.length) own.push(`${b.prelude} {\n${o.join('\n')}\n}`);
    } else {
      (inAll(norm(b.text)) ? shared : own).push(b.text);
    }
  }
  return { shared, own };
}

// The shared sheet is taken from the first course, so ordering matches an
// original file rather than being invented here.
const base = partition(parsed[COURSES[0]]);
writeFileSync(
  join(root, 'shared', 'console.css'),
  `/*\n * Agentcraft — shared stylesheet.\n *\n * Every rule here is byte-identical across all four courses. Course-specific\n * accent variables and instrument styles live in courses/<slug>/theme.css,\n * which loads after this file.\n */\n\n${base.shared.join('\n')}\n`,
);

const report = [{ slug: COURSES[0], shared: base.shared.length, own: base.own.length }];
writeFileSync(join(root, 'courses', COURSES[0], 'theme.css'), ownHeader(COURSES[0]) + base.own.join('\n') + '\n');

for (const slug of COURSES.slice(1)) {
  const p = partition(parsed[slug]);
  writeFileSync(join(root, 'courses', slug, 'theme.css'), ownHeader(slug) + p.own.join('\n') + '\n');
  report.push({ slug, shared: p.shared.length, own: p.own.length });
}

function ownHeader(slug) {
  return `/* ${slug} — accent palette and instrument styles. Loads after shared/console.css. */\n\n`;
}

console.log('shared rules:', base.shared.length);
for (const r of report) console.log(`  ${r.slug}: ${r.own} own rules (${r.shared} matched shared)`);
