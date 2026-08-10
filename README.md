# Agentcraft

Four hands-on courses on building AI systems that work — 130 lessons, live
interactive instruments, checkpoint quizzes and a final exam per course.

| # | Course | Lessons | Instruments |
|---|--------|---------|-------------|
| 01 | Context Engineering | 30 | context-budget simulator, failure-diagnosis drill |
| 02 | Agentic Patterns | 33 | ReAct loop stepper, pattern selector |
| 03 | Multi-Agent Systems | 34 | orchestrator stepper, topology explorer, topology selector |
| 04 | Evals & Observability | 33 | regression-gate simulator, trace explorer, judge-bias drill |

Courses 01–03 began life as Claude artifacts and were moved here verbatim.
Course 04 was written for this site.

## Running it

```bash
npm start
```

This opens your default browser at <http://localhost:4300/> automatically. No
`npm install` step — there are no dependencies; `package.json` exists only to
give the project a `start` script.

Equivalent without npm: `node serve.mjs`. Pass a different port with
`node serve.mjs 8080` (or `npm start -- 8080`), or skip the auto-open with
`node serve.mjs --no-open`.

The site is plain static files, so you can also open `index.html` straight from
disk. The only thing that actually needs a server is the web manifest (i.e.
installing it to a home screen) — everything else works from `file://` too.

## Publishing a live link (GitHub Pages)

```bash
git init
git add -A
git commit -m "Agentcraft"
gh repo create agentcraft --public --source=. --push
gh api repos/:owner/agentcraft/pages -X POST -f "build_type=workflow" \
  -f "source[branch]=main" -f "source[path]=/" 2>/dev/null || \
gh repo edit --enable-pages   # older gh versions: enable via repo Settings → Pages instead
```

Or without the `gh` CLI: create a new repo at <https://github.com/new>, then

```bash
git init
git add -A
git commit -m "Agentcraft"
git remote add origin https://github.com/<you>/agentcraft.git
git branch -M main
git push -u origin main
```

then in the repo's **Settings → Pages**, set Source to the `main` branch, root
folder. GitHub gives you a `https://<you>.github.io/agentcraft/` link a minute
or two later — that's the "prod" URL, and every future `git push` updates it.

## Deploying

Upload the folder. That's the whole procedure — any static host works (Vercel,
Netlify, GitHub Pages, Cloudflare Pages, an S3 bucket). No build step, no
server-side anything, no environment variables.

`_source/` is provenance and one-time scaffolding scripts; it isn't needed at
runtime and can be excluded from a deploy.

## Layout

```
index.html                     hub — course cards with progress
<course-slug>.html             one page per course, lesson templates inline
shared/
  console.css                  structural styles, identical for every course
  instruments.css              reusable widget primitives (gauges, sliders, steppers, drills)
  hub.css                      the hub's own palette and layout
  shell.js                     the course application: sidebar, progress, lessons, quizzes, backup
courses/<course-slug>/
  theme.css                    accent palette + styles for this course's own instruments
  course.js                    curriculum data, quiz banks, instrument builders
  lessons.html                 lesson templates (the copy that gets built into the page)
icons/                         generated PNGs + SVG favicon
manifest.webmanifest           installable-to-home-screen metadata
serve.mjs                      zero-dependency dev server
_source/                       raw artifact HTML + the scripts that split it up
```

Every course page is the same application. `shared/shell.js` owns the sidebar,
progress tracking, lesson rendering, the quiz engine, the theme toggle and the
mobile drawer; a course supplies only its data and its instruments:

```js
Agentcraft.init({
  storageKey: 'agentcraft_xx_full_v1',
  sections: SECTIONS,      // [{ t, lessons: [{ id, t, m, tag }] }]
  quizzes: QUIZZES,        // { s1: [{ q, o, c, e }], final: [...] }
  instruments: { gate: buildGate },   // keyed by the lesson's data-mount value
  verdict: (pct) => '…',   // shown after the final exam
});
```

## Editing

**Lesson prose** — edit the `<script type="text/html" data-lesson="…">` block
directly in `<course-slug>.html`. That file is the source of truth; the copy in
`courses/<slug>/lessons.html` is only what the scaffolder built from.

**Curriculum, quizzes, instruments** — edit `courses/<slug>/course.js`. Lesson
ids in `SECTIONS` must match the `data-lesson` attributes in the page.

**Adding a lesson** — add an entry to `SECTIONS` and a matching
`<script type="text/html" data-lesson="…">` block. A lesson with no template
renders "Coming soon" rather than breaking.

**Adding an instrument** — write a `build*(hostEl)` function in `course.js`,
register it in the `instruments` map, and drop `<div data-mount="yourkey"></div>`
into a lesson. Reuse the classes in `shared/instruments.css` and you inherit the
existing look.

**Regenerating page chrome** — if you change the course registry (titles, lesson
counts, the switcher), run:

```bash
node _source/build-pages.mjs
```

This rewrites every page's `<head>`, sidebar and course switcher around the
lesson templates in `courses/<slug>/lessons.html`. It will overwrite lesson edits
you made directly in the page files, so either keep `lessons.html` in sync or
don't re-run it.

## Progress

Progress lives in `localStorage` under `agentcraft_*` keys — one per course, plus
the theme. There is no account and nothing leaves the device.

That has one consequence worth knowing: an iOS home-screen web clip has its
local storage evicted after roughly a week of not being opened, and these are
multi-hour courses. Both the hub and every course sidebar therefore offer
**Export progress** / **Import progress**, which round-trips every course's ticks
through a small JSON file.

## Regenerating the icons

```bash
node _source/make-icons.mjs
```

Writes `icons/icon-{180,192,512}.png` and `icons/icon.svg`. The PNG encoder is
hand-rolled on `node:zlib`, so this needs no image libraries.
