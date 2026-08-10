/**
 * Generate the four course pages and the hub from one course registry.
 *
 * Run once to scaffold. After that the generated .html files are the editable
 * source of truth — lesson templates live inside them, so serving the site
 * needs no build step at all. Re-running regenerates the chrome (sidebar,
 * course switcher, head) around each course's lessons.html.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

/**
 * The brand, in one place. Changing these two lines and re-running renames the
 * hub, every course page title and sidebar, and the web manifest.
 *
 * `STORAGE_PREFIX` is deliberately independent: it namespaces saved progress,
 * and changing it would orphan anyone's ticks. shared/shell.js migrates from
 * the old `console_` prefix, so leave this alone unless you also update that.
 */
export const BRAND = 'Agentcraft';
export const TAGLINE = 'AI Agent Engineering';
export const STORAGE_PREFIX = 'agentcraft_';

export const COURSES = [
  {
    n: '01',
    slug: 'context-engineering',
    name: 'Context Engineering',
    icon: '🎛️',
    key: STORAGE_PREFIX + 'ce_full_v1',
    lessons: 30,
    hours: '~2.5 hrs',
    blurb: 'Decide, on every turn, exactly what the model sees. The highest-leverage skill in building reliable agents.',
  },
  {
    n: '02',
    slug: 'agentic-patterns',
    name: 'Agentic Patterns',
    icon: '🔁',
    key: STORAGE_PREFIX + 'ap_full_v1',
    lessons: 33,
    hours: '~2.5 hrs',
    blurb: 'The reasoning and control shapes that turn a raw model into an agent that acts, checks itself and recovers.',
  },
  {
    n: '03',
    slug: 'multi-agent-systems',
    name: 'Multi-Agent Systems',
    icon: '🕸️',
    key: STORAGE_PREFIX + 'ma_full_v1',
    lessons: 34,
    hours: '~2.5 hrs',
    blurb: 'Designing systems where agents cooperate — topologies, communication, cost, and when not to build one.',
  },
  {
    n: '04',
    slug: 'evals-and-observability',
    name: 'Evals & Observability',
    icon: '📊',
    key: STORAGE_PREFIX + 'eo_full_v1',
    lessons: 33,
    hours: '~3 hrs',
    blurb: 'How you know any of it works. Eval sets, LLM-as-judge, tracing, regression gates and production drift.',
  },
];

function switcher(current) {
  const items = COURSES.map((c) => {
    if (c.slug === current.slug) {
      return `        <a class="cs-item current"><span class="cs-ic">${c.icon}</span><span class="cs-t"><b>${c.name}</b><span>Course ${c.n} · you're here</span></span><span class="cs-check">●</span></a>`;
    }
    return `        <a class="cs-item" href="./${c.slug}.html"><span class="cs-ic">${c.icon}</span><span class="cs-t"><b>${c.name}</b><span>Course ${c.n} · open →</span></span></a>`;
  }).join('\n');

  return `    <div class="course-switch" id="courseSwitch">
      <button class="cs-trigger" id="csTrigger" aria-haspopup="true" aria-expanded="false">
        <span class="cs-ic">${current.icon}</span>
        <span class="cs-tx"><span class="cs-name">${current.name}</span><span class="cs-meta">Course ${current.n} of 0${COURSES.length} · switch ▾</span></span>
        <span class="cs-caret">▾</span>
      </button>
      <div class="cs-menu" id="csMenu">
${items}
      </div>
    </div>`;
}

function page(course, lessons) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${course.name} — Full Course · ${BRAND}</title>
<meta name="description" content="${course.blurb}">
<meta name="theme-color" content="#0E1216">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${BRAND}">
<meta name="mobile-web-app-capable" content="yes">
<link rel="manifest" href="./manifest.webmanifest">
<link rel="icon" href="./icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="./icons/icon-180.png">
<link rel="stylesheet" href="./shared/console.css">
<link rel="stylesheet" href="./shared/instruments.css">
<link rel="stylesheet" href="./courses/${course.slug}/theme.css">
</head>
<body>

<button class="theme-fab" id="themeFab" aria-label="Toggle dark / light theme" title="Toggle dark / light theme">
  <span class="ic-light">🌙</span><span class="ic-dark">☀️</span>
</button>

<div class="topbar">
  <button class="mbtn" id="menuBtn">☰ Curriculum</button>
  <span class="tt">${course.name}</span>
  <span class="tp" id="topPct">0%</span>
</div>
<div class="scrim" id="scrim"></div>

<div class="layout">
  <aside class="sidebar" id="sidebar">
    <a class="sb-brand" href="./index.html" style="text-decoration:none;color:inherit"><span class="dot"></span><span class="name">${BRAND}</span></a>
${switcher(course)}
    <div class="sb-sub">full course · ${course.hours} · ${course.lessons} lessons</div>
    <div class="sb-progress">
      <div class="pl"><span>Course progress</span><span><b id="pdone">0</b>/<span id="ptotal">0</span> lessons</span></div>
      <div class="ptrack"><div class="pfill" id="pfill"></div></div>
    </div>
    <div class="curriculum" id="curriculum"></div>
    <button class="theme-btn" id="themeBtn">◐ Toggle theme</button>
    <div id="backup"></div>
  </aside>

  <div class="stage">
    <article class="lesson" id="lesson"></article>
    <div class="lesson-footer" id="footer"></div>
  </div>
</div>

<!-- ================= LESSON CONTENT ================= -->

${lessons.trim()}

<script src="./shared/shell.js"></script>
<script src="./courses/${course.slug}/course.js"></script>
</body>
</html>
`;
}

function hub() {
  const cards = COURSES.map(
    (c) => `      <a class="course" href="./${c.slug}.html" data-key="${c.key}" data-total="${c.lessons}">
        <span class="ic">${c.icon}</span>
        <span>
          <span class="num">Course ${c.n}</span>
          <h2>${c.name}</h2>
          <p>${c.blurb}</p>
          <span class="meta"><span>${c.lessons} lessons</span><span>${c.hours}</span><span class="done-note"></span></span>
        </span>
        <span class="cta"><span class="pct none">0%</span><span class="go">Start →</span></span>
        <span class="ctrack"><span class="cfill"></span></span>
      </a>`,
  ).join('\n');

  const totalLessons = COURSES.reduce((n, c) => n + c.lessons, 0);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${BRAND} — ${TAGLINE}</title>
<meta name="description" content="Four hands-on courses on building AI systems that work: context engineering, agentic patterns, multi-agent systems, and evals & observability.">
<meta name="theme-color" content="#0E1216">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${BRAND}">
<meta name="mobile-web-app-capable" content="yes">
<link rel="manifest" href="./manifest.webmanifest">
<link rel="icon" href="./icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="./icons/icon-180.png">
<link rel="stylesheet" href="./shared/hub.css">
</head>
<body>

<button class="theme-fab" id="themeFab" aria-label="Toggle dark / light theme" title="Toggle dark / light theme">
  <span class="ic-light">🌙</span><span class="ic-dark">☀️</span>
</button>

<div class="wrap">

  <div class="brand"><span class="dot"></span><span class="name">${BRAND}</span></div>
  <h1>Build AI systems that actually work.</h1>
  <p class="lede">Four hands-on courses, ${totalLessons} lessons. Each one has live instruments to play with, a checkpoint quiz per section and a final exam. Progress saves on this device — nothing is uploaded anywhere.</p>

  <div class="overall">
    <div class="row"><span>Total progress</span><span><b id="ov-done">0</b> / ${totalLessons} lessons</span></div>
    <div class="track"><div class="fill" id="ov-fill"></div></div>
  </div>

  <div class="grid" id="grid">
${cards}
  </div>

  <div class="note"><b>Suggested order:</b> 01 → 02 → 03 → 04. Each course stands alone, but they build: context engineering is the ground the patterns run on, multi-agent design is those patterns scaled out, and evals are how you find out whether any of it worked. If you only take one, take 01. If you already ship AI features and something feels unmeasurable, jump to 04.</div>

  <footer>
    <button class="btn" id="themeBtn">◐ Theme</button>
    <button class="btn" id="bk-export">↓ Export progress</button>
    <button class="btn" id="bk-import">↑ Import progress</button>
    <input type="file" id="bk-file" accept="application/json" hidden>
    <span class="sp"></span>
    <span class="fine">progress stored locally · no account, no server</span>
  </footer>

</div>

<script>
(function () {
  'use strict';
  var THEME_KEY = '${STORAGE_PREFIX}theme';
  var PREFIX = '${STORAGE_PREFIX}';
  var root = document.documentElement;

  try { var t = localStorage.getItem(THEME_KEY); if (t) root.setAttribute('data-theme', t); } catch (e) {}
  function toggleTheme() {
    var cur = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  document.getElementById('themeFab').addEventListener('click', toggleTheme);

  function paint() {
    var done = 0, total = 0;
    [].forEach.call(document.querySelectorAll('.course'), function (card) {
      var key = card.getAttribute('data-key');
      var lessons = parseInt(card.getAttribute('data-total'), 10);
      var n = 0;
      try {
        var raw = localStorage.getItem(key);
        if (raw) {
          var store = JSON.parse(raw);
          n = Object.keys(store.done || {}).filter(function (k) { return store.done[k]; }).length;
        }
      } catch (e) {}
      n = Math.min(n, lessons);
      done += n; total += lessons;

      var pct = Math.round((n / lessons) * 100);
      var pctEl = card.querySelector('.pct');
      pctEl.textContent = pct + '%';
      pctEl.className = 'pct ' + (pct === 0 ? 'none' : pct >= 100 ? 'done' : 'part');
      card.querySelector('.go').textContent =
        pct === 0 ? 'Start →' : pct >= 100 ? 'Review →' : 'Continue →';
      card.querySelector('.done-note').textContent = n > 0 ? n + ' done' : '';
      var fill = card.querySelector('.cfill');
      fill.style.width = pct + '%';
      fill.className = 'cfill' + (pct >= 100 ? ' complete' : '');
    });
    document.getElementById('ov-done').textContent = done;
    document.getElementById('ov-fill').style.width = Math.round((done / total) * 100) + '%';
  }

  /* ---- progress backup, same format the course pages read ---- */
  document.getElementById('bk-export').addEventListener('click', function () {
    var data = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(PREFIX) === 0) data[k] = localStorage.getItem(k);
    }
    var blob = new Blob([JSON.stringify({ kind: 'agentcraft-progress', version: 1, data: data }, null, 2)],
      { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'agentcraft-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  var file = document.getElementById('bk-file');
  document.getElementById('bk-import').addEventListener('click', function () { file.click(); });
  file.addEventListener('change', function () {
    var f = file.files && file.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        if (!/^(agentcraft|the-console)-progress$/.test(parsed.kind)) throw new Error('wrong file');
        Object.keys(parsed.data).forEach(function (k) {
          if (k.indexOf(PREFIX) === 0) localStorage.setItem(k, parsed.data[k]);
        });
        paint();
      } catch (e) {
        alert("That file isn't a Console progress export.");
      }
      file.value = '';
    };
    reader.readAsText(f);
  });

  paint();
})();
</script>
</body>
</html>
`;
}

function manifest() {
  return (
    JSON.stringify(
      {
        name: `${BRAND} — ${TAGLINE}`,
        short_name: BRAND,
        description:
          'Four hands-on courses on building AI systems that work: context engineering, agentic patterns, multi-agent systems, and evals & observability.',
        start_url: './index.html',
        scope: './',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#0E1216',
        theme_color: '#0E1216',
        icons: [
          { src: './icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: './icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: './icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      null,
      2,
    ) + '\n'
  );
}

writeFileSync(join(root, 'manifest.webmanifest'), manifest());
console.log('built manifest.webmanifest');

writeFileSync(join(root, 'index.html'), hub());
console.log('built index.html (hub)');

let built = 0;
for (const course of COURSES) {
  const lessonsPath = join(root, 'courses', course.slug, 'lessons.html');
  if (!existsSync(lessonsPath)) {
    console.log(`skip ${course.slug} — no lessons.html yet`);
    continue;
  }
  const lessons = readFileSync(lessonsPath, 'utf8');
  writeFileSync(join(root, `${course.slug}.html`), page(course, lessons));
  console.log(`built ${course.slug}.html (${course.lessons} lessons)`);
  built++;
}
console.log(`\n${built} page(s) written`);
