/**
 * Agentcraft — shared course shell.
 *
 * Every course page is the same application: a curriculum sidebar, per-lesson
 * rendering from <script type="text/html"> templates, local progress, a quiz
 * engine, a theme toggle and a mobile drawer. Only the curriculum data, the
 * interactive instruments and the final-exam verdict differ, so those are
 * passed in and the rest lives here once.
 *
 * A course calls:
 *
 *   Agentcraft.init({
 *     storageKey:  'agentcraft_xx_full_v1',   // where this course's ticks live
 *     sections:    [{ t, lessons: [{ id, t, m, tag }] }],
 *     quizzes:     { s1: [{ q, o, c, e }], final: [...] },
 *     instruments: { sim: fn(hostEl), ... },   // keyed by data-mount value
 *     verdict:     fn(pct) -> string,          // shown after the final exam
 *   });
 *
 * Progress is localStorage only — there is no backend. On an iOS home-screen
 * web clip that storage is evicted after roughly a week of not opening the
 * site, so the shell also offers an export/import of every course's progress.
 */
(function () {
  'use strict';

  var PROGRESS_PREFIX = 'agentcraft_';
  var LEGACY_PREFIX = 'console_';
  var THEME_KEY = PROGRESS_PREFIX + 'theme';

  /**
   * The site was called "The Console" before it was called Agentcraft, and its
   * progress keys carried that name. Carry anything saved under the old prefix
   * across on first load, once, so a rename never costs anyone their place.
   */
  function migrateLegacyKeys() {
    try {
      var moved = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(LEGACY_PREFIX) === 0) moved.push(k);
      }
      moved.forEach(function (k) {
        var target = PROGRESS_PREFIX + k.slice(LEGACY_PREFIX.length);
        if (localStorage.getItem(target) === null) {
          localStorage.setItem(target, localStorage.getItem(k));
        }
        localStorage.removeItem(k);
      });
    } catch (e) {}
  }

  function init(cfg) {
    migrateLegacyKeys();
    var SECTIONS = cfg.sections;
    var QUIZZES = cfg.quizzes || {};
    var INSTRUMENTS = cfg.instruments || {};

    /* ---------- ORDER ---------- */
    var ORDER = [];
    SECTIONS.forEach(function (s) {
      s.lessons.forEach(function (l) {
        ORDER.push(l.id);
      });
    });
    var TOTAL = ORDER.length;

    /* ---------- STORE ---------- */
    var store = { done: {}, last: null };
    try {
      var raw = localStorage.getItem(cfg.storageKey);
      if (raw) store = JSON.parse(raw);
      if (!store.done) store.done = {};
    } catch (e) {}
    function save() {
      try {
        localStorage.setItem(cfg.storageKey, JSON.stringify(store));
      } catch (e) {}
    }

    /* ---------- THEME ---------- */
    var root = document.documentElement;
    function curTheme() {
      return (
        root.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      );
    }
    function toggleTheme() {
      var n = curTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', n);
      try {
        localStorage.setItem(THEME_KEY, n);
      } catch (e) {}
    }
    // Two controls, one action: the sidebar button (labeled, easy to describe)
    // and the floating fab (always visible, no scrolling required to find it).
    var themeBtn = document.getElementById('themeBtn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    var themeFab = document.getElementById('themeFab');
    if (themeFab) themeFab.addEventListener('click', toggleTheme);
    try {
      var t = localStorage.getItem(THEME_KEY);
      if (t) root.setAttribute('data-theme', t);
    } catch (e) {}

    /* ---------- SIDEBAR ---------- */
    var curriculum = document.getElementById('curriculum');
    var collapsed = {};
    function buildSidebar() {
      curriculum.innerHTML = '';
      SECTIONS.forEach(function (sec, si) {
        var doneCount = sec.lessons.filter(function (l) {
          return store.done[l.id];
        }).length;
        var secEl = document.createElement('div');
        secEl.className = 'sec' + (collapsed[si] ? ' collapsed' : '');
        var head = document.createElement('button');
        head.className = 'sec-head';
        head.innerHTML =
          '<span class="caret">▼</span><span class="sx">S' +
          (si + 1) +
          '</span><span class="st">' +
          sec.t +
          '</span><span class="sc">' +
          doneCount +
          '/' +
          sec.lessons.length +
          '</span>';
        head.addEventListener('click', function () {
          collapsed[si] = !collapsed[si];
          secEl.classList.toggle('collapsed');
        });
        secEl.appendChild(head);
        var list = document.createElement('div');
        list.className = 'lessons';
        sec.lessons.forEach(function (l) {
          var b = document.createElement('button');
          b.className =
            'lrow' + (store.done[l.id] ? ' done' : '') + (l.id === current ? ' current' : '');
          b.setAttribute('data-id', l.id);
          var badge = l.tag
            ? '<span class="badge">' + l.tag + '</span>'
            : '<span class="lm">' + l.m + 'm</span>';
          b.innerHTML = '<span class="tick">✓</span><span class="lt">' + l.t + '</span>' + badge;
          b.addEventListener('click', function () {
            go(l.id);
            closeMenu();
          });
          list.appendChild(b);
        });
        secEl.appendChild(list);
        curriculum.appendChild(secEl);
      });
    }
    function refreshProgress() {
      var done = ORDER.filter(function (id) {
        return store.done[id];
      }).length;
      var pct = Math.round((done / TOTAL) * 100);
      document.getElementById('pfill').style.width = pct + '%';
      document.getElementById('pdone').textContent = done;
      document.getElementById('ptotal').textContent = TOTAL;
      document.getElementById('topPct').textContent = pct + '%';
    }

    /* ---------- LESSON RENDER ---------- */
    var current = null;
    var lessonEl = document.getElementById('lesson');
    var footerEl = document.getElementById('footer');
    function meta(id) {
      for (var i = 0; i < SECTIONS.length; i++) {
        var s = SECTIONS[i];
        for (var j = 0; j < s.lessons.length; j++) {
          if (s.lessons[j].id === id)
            return { sec: i, idx: j, l: s.lessons[j], secTitle: s.t };
        }
      }
      return null;
    }
    function go(id) {
      current = id;
      store.last = id;
      save();
      var m = meta(id);
      var tpl = document.querySelector('script[data-lesson="' + id + '"]');
      var crumb =
        '<div class="crumb"><span>Section ' +
        (m.sec + 1) +
        ' · ' +
        m.secTitle +
        '</span><span class="sep">/</span><span>Lesson ' +
        (m.idx + 1) +
        '</span><span class="sep">·</span><span class="dur">' +
        m.l.m +
        ' min</span></div>';
      lessonEl.innerHTML =
        crumb + '<h1>' + m.l.t + '</h1>' + (tpl ? tpl.innerHTML : '<p>Coming soon.</p>');
      mountWidgets();
      buildFooter(id);
      buildSidebar();
      refreshProgress();
      window.scrollTo({ top: 0, behavior: 'auto' });
      lessonEl.scrollIntoView({ block: 'start' });
    }
    function buildFooter(id) {
      var i = ORDER.indexOf(id);
      var prev = i > 0 ? ORDER[i - 1] : null;
      var next = i < TOTAL - 1 ? ORDER[i + 1] : null;
      footerEl.innerHTML = '';
      var prevBtn = document.createElement(prev ? 'button' : 'span');
      if (prev) {
        prevBtn.className = 'btn';
        prevBtn.innerHTML = '← Previous';
        prevBtn.addEventListener('click', function () {
          go(prev);
        });
      }
      footerEl.appendChild(prevBtn);
      var sp = document.createElement('span');
      sp.className = 'spacer';
      footerEl.appendChild(sp);
      var mainBtn = document.createElement('button');
      mainBtn.className = 'btn primary';
      var doneAlready = store.done[id];
      if (next) mainBtn.innerHTML = doneAlready ? 'Next lesson →' : 'Mark complete & continue →';
      else mainBtn.innerHTML = doneAlready ? '✓ Course complete' : '✓ Finish course';
      mainBtn.addEventListener('click', function () {
        store.done[id] = true;
        save();
        if (next) go(next);
        else {
          buildSidebar();
          refreshProgress();
          buildFooter(id);
        }
      });
      footerEl.appendChild(mainBtn);
      var lf = document.createElement('span');
      lf.className = 'lfmeta';
      lf.textContent = 'Lesson ' + (i + 1) + ' of ' + TOTAL;
      footerEl.appendChild(lf);
    }

    /* ---------- WIDGET MOUNTS ---------- */
    function mountWidgets() {
      Array.prototype.slice
        .call(lessonEl.querySelectorAll('[data-mount]'))
        .forEach(function (el) {
          var kind = el.getAttribute('data-mount');
          if (kind === 'quiz') buildQuiz(el, el.getAttribute('data-quiz'));
          else if (INSTRUMENTS[kind]) INSTRUMENTS[kind](el);
        });
    }

    /* ---------- QUIZ ---------- */
    function buildQuiz(host, qid) {
      var qs = QUIZZES[qid] || [];
      var isFinal = qid === 'final';
      var answered = {};
      var score = 0;
      var letters = ['A', 'B', 'C', 'D'];
      host.innerHTML =
        '<div class="quiz' +
        (isFinal ? ' quiz-final' : '') +
        '"><div class="qhead"><span class="t">' +
        (isFinal ? 'final_exam' : 'checkpoint') +
        '</span><span class="score" id="qs">0 / ' +
        qs.length +
        '</span></div><div class="qbody" id="qb"></div>' +
        (isFinal ? '<div class="verdict" id="qv"></div>' : '') +
        '</div>';
      var qb = host.querySelector('#qb');
      qs.forEach(function (item, qi) {
        var w = document.createElement('div');
        w.className = 'qitem';
        w.innerHTML =
          '<div class="qn"><span class="qx">Q' +
          (qi + 1) +
          '</span>' +
          item.q +
          '</div><div class="qopts">' +
          item.o
            .map(function (o, oi) {
              return (
                '<button class="qopt" data-qi="' +
                qi +
                '" data-oi="' +
                oi +
                '"><span class="mk">' +
                letters[oi] +
                '</span><span>' +
                o +
                '</span></button>'
              );
            })
            .join('') +
          '</div><div class="qexpl" id="qe-' +
          qi +
          '"></div>';
        qb.appendChild(w);
      });
      qb.addEventListener('click', function (e) {
        var btn = e.target.closest('.qopt');
        if (!btn) return;
        var qi = parseInt(btn.getAttribute('data-qi'), 10);
        var oi = parseInt(btn.getAttribute('data-oi'), 10);
        if (answered[qi]) return;
        answered[qi] = true;
        var item = qs[qi];
        Array.prototype.slice
          .call(btn.parentElement.querySelectorAll('.qopt'))
          .forEach(function (b, k) {
            b.disabled = true;
            if (k === item.c) b.classList.add('correct');
          });
        if (oi === item.c) score++;
        else btn.classList.add('wrong');
        host.querySelector('#qs').textContent = score + ' / ' + qs.length;
        var ex = host.querySelector('#qe-' + qi);
        ex.innerHTML = (oi === item.c ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + item.e;
        ex.classList.add('show');
        if (Object.keys(answered).length === qs.length && isFinal) {
          var v = host.querySelector('#qv');
          var pctv = Math.round((score / qs.length) * 100);
          v.innerHTML =
            'You scored ' +
            score +
            ' / ' +
            qs.length +
            ' (' +
            pctv +
            '%). ' +
            (cfg.verdict ? cfg.verdict(pctv) : '');
          v.classList.add('show');
        }
      });
    }

    /* ---------- MOBILE MENU ---------- */
    var sidebar = document.getElementById('sidebar');
    var scrim = document.getElementById('scrim');
    function closeMenu() {
      sidebar.classList.remove('open');
      scrim.classList.remove('show');
    }
    var menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        scrim.classList.toggle('show');
      });
    }
    if (scrim) scrim.addEventListener('click', closeMenu);

    /* ---------- COURSE SWITCHER ---------- */
    var cs = document.getElementById('courseSwitch');
    var csT = document.getElementById('csTrigger');
    if (cs && csT) {
      csT.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = cs.classList.toggle('open');
        csT.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function (e) {
        if (!cs.contains(e.target)) {
          cs.classList.remove('open');
          csT.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          cs.classList.remove('open');
          csT.setAttribute('aria-expanded', 'false');
        }
      });
    }

    /* ---------- BACKUP ---------- */
    mountBackup(function () {
      // Re-read this course's slice after an import and repaint.
      try {
        var raw2 = localStorage.getItem(cfg.storageKey);
        store = raw2 ? JSON.parse(raw2) : { done: {}, last: null };
        if (!store.done) store.done = {};
      } catch (e) {}
      buildSidebar();
      refreshProgress();
      buildFooter(current);
    });

    /* ---------- INIT ---------- */
    buildSidebar();
    refreshProgress();
    go(store.last && meta(store.last) ? store.last : ORDER[0]);
  }

  /**
   * Progress backup. Covers every course at once, because the thing worth
   * protecting is "my place in The Console", not one course's ticks.
   */
  function collectProgress() {
    var out = { kind: 'agentcraft-progress', version: 1, data: {} };
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(PROGRESS_PREFIX) === 0) out.data[k] = localStorage.getItem(k);
    }
    return out;
  }

  function mountBackup(onImported) {
    var host = document.getElementById('backup');
    if (!host) return;
    host.innerHTML =
      '<button class="theme-btn" id="bk-export">↓ Export progress</button>' +
      '<button class="theme-btn" id="bk-import">↑ Import progress</button>' +
      '<input type="file" id="bk-file" accept="application/json" hidden>';

    host.querySelector('#bk-export').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(collectProgress(), null, 2)], {
        type: 'application/json',
      });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'agentcraft-progress.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    var file = host.querySelector('#bk-file');
    host.querySelector('#bk-import').addEventListener('click', function () {
      file.click();
    });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(String(reader.result));
          if (!/^(agentcraft|the-console)-progress$/.test(parsed.kind)) throw new Error('not a progress file');
          Object.keys(parsed.data).forEach(function (k) {
            if (k.indexOf(PROGRESS_PREFIX) === 0) localStorage.setItem(k, parsed.data[k]);
          });
          onImported();
        } catch (e) {
          alert("That file isn't an Agentcraft progress export.");
        }
        file.value = '';
      };
      reader.readAsText(f);
    });
  }

  window.Agentcraft = { init: init, collectProgress: collectProgress };
})();
