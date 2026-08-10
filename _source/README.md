# _source — provenance and scaffolding

Nothing in here is needed to run, edit or deploy the site. It records where
courses 01–03 came from and how they were taken apart.

## What's here

- `*.raw.html` — the three published Claude artifacts, exactly as fetched.
- `extracted/<slug>/` — each artifact's original `app.js` and `shell.html`,
  before they were split into `shared/shell.js` + `courses/<slug>/course.js`.
  Kept so any extraction mistake can be checked against the original.

## The scaffolding pipeline

These ran **once**, in this order, to turn three standalone artifact pages into
the site. They are recorded for reference, not as a build:

1. `extract.mjs` — cut each artifact into theme CSS, shell markup, lesson
   templates and app JS. Drops the Claude artifact host's `frame-runtime` shim.
2. `split-css.mjs` — move every rule that was byte-identical across all three
   courses into `shared/console.css`.
3. `split-js.mjs` — lift each course's curriculum data, quiz banks and
   instrument builders into `courses/<slug>/course.js`; the rest of the original
   `app.js` was the shell and became `shared/shell.js`.
4. `promote-instruments.mjs` — move widget styles used by more than one course
   into `shared/instruments.css`.

Steps 1–4 are **not idempotent** — they read files that later steps rewrote, so
re-running them now would produce nonsense. If you ever need to redo the split,
start from the `*.raw.html` files.

## Safe to re-run any time

- `build-pages.mjs` — regenerates the hub and each course page's chrome (head,
  sidebar, course switcher) around `courses/<slug>/lessons.html`. This is also
  the single source of truth for the course registry: titles, icons, lesson
  counts, storage keys, blurbs.
  **Caution:** it overwrites the page files, so lesson prose edited directly in
  `<slug>.html` is lost unless `lessons.html` was updated too.
- `make-icons.mjs` — regenerates `icons/`.
