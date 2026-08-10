/**
 * Mechanically split a published-artifact course page into its parts.
 *
 * Verbatim only — this script never rewrites content, it just cuts the file on
 * known boundaries so the pieces can be recombined into a standalone site:
 *
 *   theme.css     the course's <style> block
 *   shell.html    the topbar / drawer / layout markup
 *   lessons.html  every <script type="text/html" data-lesson="..."> block
 *   app.js        the trailing application script (curriculum, quizzes, instruments)
 *
 * The Claude artifact host injects a "frame-runtime" script into <head>; it is
 * meaningless outside claude.ai and is dropped here.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const COURSES = [
  'context-engineering',
  'agentic-patterns',
  'multi-agent-systems',
];

/** Cut everything the artifact host added, leaving the authored document. */
function stripHost(html) {
  const out = html
    .replace(/<!-- frame-runtime -->[\s\S]*?<!-- \/frame-runtime -->/, '')
    .replace(/^[\s\S]*?<\/head>\s*<body>/, '');
  return out.trim();
}

function section(html, open, close, { greedy = false } = {}) {
  const start = html.indexOf(open);
  if (start === -1) return null;
  const from = start + open.length;
  const end = greedy ? html.lastIndexOf(close) : html.indexOf(close, from);
  if (end === -1) return null;
  return { body: html.slice(from, end), start, end: end + close.length };
}

const summary = [];

for (const slug of COURSES) {
  const raw = readFileSync(join(here, `${slug}.raw.html`), 'utf8');
  const doc = stripHost(raw);

  const title = section(doc, '<title>', '</title>')?.body.trim() ?? '';

  // The course's own stylesheet: the first <style> block in the body.
  const style = section(doc, '<style>', '</style>');

  // Lesson bodies. Each is a non-executing <script type="text/html"> template.
  const lessonRe =
    /<script type="text\/html" data-lesson="([^"]+)">([\s\S]*?)<\/script>/g;
  const lessons = [];
  let m;
  while ((m = lessonRe.exec(doc)) !== null) {
    lessons.push({ id: m[1], html: m[2] });
  }

  // Everything between the stylesheet and the first lesson template is markup.
  const firstLessonAt = doc.indexOf('<script type="text/html"');
  const shell = doc
    .slice(style.end, firstLessonAt)
    .replace(/<!--[= ]*LESSON CONTENT[= ]*-->/, '')
    .trim();

  // The application script is the last <script> that is not a template.
  const afterLessons = doc.slice(lessonRe.lastIndex || firstLessonAt);
  const appOpen = afterLessons.indexOf('<script>');
  const app =
    appOpen === -1
      ? ''
      : afterLessons.slice(appOpen + '<script>'.length, afterLessons.lastIndexOf('</script>'));

  const dir = join(root, 'courses', slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'theme.css'), style.body.trim() + '\n');
  writeFileSync(join(dir, 'shell.html'), shell + '\n');
  writeFileSync(
    join(dir, 'lessons.html'),
    lessons
      .map((l) => `<script type="text/html" data-lesson="${l.id}">${l.html}</script>`)
      .join('\n\n') + '\n',
  );
  writeFileSync(join(dir, 'app.js'), app.trim() + '\n');

  summary.push({
    slug,
    title,
    lessons: lessons.length,
    lessonIds: lessons.map((l) => l.id).join(','),
    cssKB: +(style.body.length / 1024).toFixed(1),
    shellKB: +(shell.length / 1024).toFixed(1),
    lessonsKB: +(lessons.reduce((n, l) => n + l.html.length, 0) / 1024).toFixed(1),
    appKB: +(app.length / 1024).toFixed(1),
  });
}

for (const s of summary) {
  console.log(`\n=== ${s.slug} — ${s.title}`);
  console.log(`    lessons: ${s.lessons}`);
  console.log(`    css ${s.cssKB}KB · shell ${s.shellKB}KB · lessons ${s.lessonsKB}KB · app ${s.appKB}KB`);
  console.log(`    ids: ${s.lessonIds}`);
}
