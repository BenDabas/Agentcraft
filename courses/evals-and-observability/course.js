/**
 * evals-and-observability — curriculum, quiz banks and instruments.
 *
 * The shell (sidebar, progress, lesson rendering, quiz engine, drawer) is in
 * shared/shell.js. This file is the course itself.
 */
(function () {
  'use strict';

  /* ---------- DATA ---------- */
  var SECTIONS = [
    { t:"Why Evals Exist", lessons:[
      {id:"1-1", t:"Welcome & how this course works", m:5, tag:"start"},
      {id:"1-2", t:"The vibe-check trap", m:6},
      {id:"1-3", t:"What an eval actually is", m:6},
      {id:"1-4", t:"Three loops: offline, online, human", m:6},
      {id:"1-5", t:"Checkpoint", m:4, tag:"quiz"},
    ]},
    { t:"Building the Eval Set", lessons:[
      {id:"2-1", t:"Your cases are in production, not your imagination", m:6},
      {id:"2-2", t:"Anatomy of a case", m:5},
      {id:"2-3", t:"A failure taxonomy beats a score", m:6},
      {id:"2-4", t:"How many cases is enough", m:6},
      {id:"2-5", t:"Keeping the set honest", m:6},
      {id:"2-6", t:"Checkpoint", m:4, tag:"quiz"},
    ]},
    { t:"Scoring & Judges", lessons:[
      {id:"3-1", t:"The scorer ladder", m:5},
      {id:"3-2", t:"Deterministic scorers, and when they're plenty", m:6},
      {id:"3-3", t:"Writing an LLM judge", m:7},
      {id:"3-4", t:"How judges lie to you", m:7},
      {id:"3-5", t:"Drill: name the judge bias", m:7, tag:"lab"},
      {id:"3-6", t:"Calibrating a judge against humans", m:6},
      {id:"3-7", t:"Checkpoint", m:5, tag:"quiz"},
    ]},
    { t:"Tracing & Observability", lessons:[
      {id:"4-1", t:"A log says what happened; a trace says where", m:5},
      {id:"4-2", t:"Spans, attributes, and an agent's shape", m:6},
      {id:"4-3", t:"Lab: find the bad span", m:8, tag:"lab"},
      {id:"4-4", t:"What to record on every call", m:6},
      {id:"4-5", t:"Cost and latency are eval metrics too", m:5},
      {id:"4-6", t:"Checkpoint", m:4, tag:"quiz"},
    ]},
    { t:"Shipping & Production", lessons:[
      {id:"5-1", t:"The regression gate", m:6},
      {id:"5-2", t:"Lab: tune the gate", m:8, tag:"lab"},
      {id:"5-3", t:"Proxy signals from real users", m:6},
      {id:"5-4", t:"Silent degradation & model upgrades", m:6},
      {id:"5-5", t:"When the eval set becomes the spec", m:5},
      {id:"5-6", t:"Checkpoint", m:5, tag:"quiz"},
    ]},
    { t:"Capstone", lessons:[
      {id:"6-1", t:"The eval design checklist", m:6},
      {id:"6-2", t:"Final exam", m:9, tag:"exam"},
      {id:"6-3", t:"Wrap-up & where to go next", m:5},
    ]},
  ];

  var QUIZZES = {
    s1:[
      {q:"Your agent \"seems better\" after a prompt change. What has that observation actually established?",o:["The change is an improvement","Nothing measurable — you looked at a handful of outputs you already expected to like","That the model got smarter","That the regression risk is zero"],c:1,e:"Vibe checks sample a tiny, biased set of cases you thought of. They can't detect the regression on the cases you didn't think of."},
      {q:"The minimum parts of an eval are:",o:["A prompt and a human","Inputs, a way to run them, and a scorer that returns a comparable number","A dashboard","A fine-tuned model"],c:1,e:"Task inputs, an execution path, and a scorer. Without a scorer that yields comparable numbers you have a demo, not an eval."},
      {q:"Offline evals and production monitoring differ mainly in that…",o:["Offline evals are more accurate","Offline evals answer 'did this change break anything?'; monitoring answers 'is it working right now, on real traffic?'","Monitoring replaces evals","Only one of them needs a scorer"],c:1,e:"They answer different questions on different data. You need both — a pre-merge gate and a live signal."},
    ],
    s2:[
      {q:"The best first source of eval cases is:",o:["Cases you invent at your desk","Real production traffic — especially the requests that already went wrong","A public benchmark","Synthetic data only"],c:1,e:"Real traffic carries the distribution and the weird edge cases you'd never invent. Start from logs and complaints."},
      {q:"A case whose expected output is \"a good, helpful answer\" is a problem because…",o:["It's too long","There's nothing a scorer can check — the expectation isn't operationalized","Good answers don't exist","It needs a bigger model"],c:1,e:"A case needs a checkable expectation: a required fact, a forbidden claim, a schema, a rubric. Otherwise no scorer can grade it."},
      {q:"Why is a failure taxonomy more useful than a single aggregate score?",o:["It's easier to compute","A score says you got worse; a taxonomy says which kind of wrong, which tells you what to fix","Scores are always wrong","It avoids needing cases"],c:1,e:"'78%' is not actionable. 'Refusals up 4×, factual errors flat' is."},
      {q:"You've been tuning prompts against the same 40 cases for two months. The risk is:",o:["The set is too big","You're overfitting to the set — it stops predicting production behaviour","Nothing, that's the point","Scorers wear out"],c:1,e:"An eval set you optimize against becomes training data. Keep a held-out slice and refresh from live traffic."},
    ],
    s3:[
      {q:"You're checking that a response is valid JSON with a required field. The right scorer is:",o:["An LLM judge","A deterministic check — parse it and assert","A human reviewer","A vibe check"],c:1,e:"Climb the ladder only as far as you must. If code can decide it, code should decide it: free, instant, perfectly repeatable."},
      {q:"Your judge is given answer A then answer B and picks B most of the time regardless of quality. This is:",o:["Verbosity bias","Position bias","Self-preference","Score clustering"],c:1,e:"Position bias. Mitigate by swapping the order and averaging, or scoring each answer independently."},
      {q:"Your 1–10 judge gives almost everything a 7. The practical consequence is:",o:["The judge is well calibrated","It can't discriminate — regressions hide inside the flat band","Scores are too high","Nothing"],c:1,e:"Central-tendency clustering. Prefer few discrete levels or pairwise comparison; a scale nobody uses the ends of has no resolution."},
      {q:"Before trusting a judge on 5,000 cases, the necessary step is:",o:["Use the largest model available","Measure its agreement with human labels on a sample, and fix the rubric until it agrees","Run it twice","Raise the temperature"],c:1,e:"A judge is itself a model that needs evaluating. Agreement with humans on a labelled sample is the calibration step."},
    ],
    s4:[
      {q:"The reason a trace beats a pile of log lines for an agent is:",o:["It's prettier","It preserves the causal tree — which call produced which input, nested and timed","It's smaller","It replaces evals"],c:1,e:"An agent's failure is usually about where in the chain the truth got lost. A trace keeps that structure; flat logs destroy it."},
      {q:"A user reports a wrong answer. The most common relationship between the symptom and the cause in a trace is:",o:["They're in the same span","The symptom appears in the final generation, but the cause is upstream — bad retrieval, a stale tool result","There is no cause","The model span is always at fault"],c:1,e:"The last span shows the damage. Walk upstream to where the wrong material entered the context."},
      {q:"Which set is worth recording on every model call?",o:["Just the output","Model & version, tokens in/out, cost, latency, tool calls, and the assembled prompt","Only errors","Only cost"],c:1,e:"Without version, tokens and the actual prompt you cannot explain a regression after the fact — and after the fact is when you'll need to."},
    ],
    s5:[
      {q:"Your gate runs 50 cases and fails when the pass rate drops 3 points below baseline, with a scorer that disagrees with itself ~5% of the time. The likely outcome is:",o:["Clean, reliable signal","Frequent false alarms — and it still misses real regressions half the time","No alarms ever","Faster CI"],c:1,e:"On 50 cases the noise in a two-run comparison is wider than 3 points, so you get both: red builds on clean PRs and missed regressions. Widening the tolerance only trades one for the other. (Lesson 5-2)"},
      {q:"The most useful production proxy signals include:",o:["Server uptime","Retries, edits, thumbs-down, abandonment and escalation to a human","CPU load","Bundle size"],c:1,e:"Behavioural signals are unlabelled but abundant, and they move before anyone files a bug."},
      {q:"You upgrade the underlying model and your eval scores hold steady. What still deserves a check?",o:["Nothing, ship it","Cost, latency, format/tone drift and the cases your set doesn't cover","Only accuracy","The logo"],c:1,e:"Equal accuracy can hide doubled cost, slower responses or a changed voice. And your set never covered everything."},
      {q:"A gate that blocks merges must, above all, be:",o:["Strict","Trusted — low enough false-alarm rate that a red build means something","Fast","Invisible"],c:1,e:"An untrusted gate is worse than no gate: it gets bypassed, and the bypass habit outlives the bad threshold."},
    ],
    final:[
      {q:"The single reason 'it looks better to me' can't replace an eval:",o:["It's slow","It samples a few cases you already expected to like, so it cannot see the regressions you didn't imagine","Humans can't judge quality","It costs money"],c:1,e:"Vibe checks are biased samples of a distribution you don't control. (Lesson 1-2)"},
      {q:"Where should the first version of your eval set come from?",o:["Invented examples","Production traffic, weighted toward what already failed","A public leaderboard","The model itself"],c:1,e:"Real traffic carries the real distribution and the real edge cases. (Lesson 2-1)"},
      {q:"A case's expected output must be:",o:["A perfect answer written by hand","Operationalized into something a scorer can actually check","At least a paragraph","Approved by a committee"],c:1,e:"Required facts, forbidden claims, a schema, a rubric — something checkable. (Lesson 2-2)"},
      {q:"You need to know whether a summary keeps the source's key claims. The lowest rung of the scorer ladder that can do this is:",o:["Exact match","A heuristic overlap metric","An LLM judge with a rubric","A human panel"],c:2,e:"Semantic faithfulness resists exact match and n-gram overlap; a rubric-driven judge is the right rung — calibrated first. (Lessons 3-1, 3-3)"},
      {q:"Two judge failures that most often flatter a worse answer are:",o:["Position bias and verbosity bias","Latency and cost","Overfitting and leakage","Drift and clustering"],c:0,e:"Order effects and a preference for longer, hedged prose. Swap positions, and score against a rubric rather than an impression. (Lesson 3-4)"},
      {q:"An agent quotes a stale policy. The trace shows retrieval returned a 2023 document ranked first, and the final generation faithfully used it. The fix belongs in:",o:["The generation prompt","Retrieval — filter or rank by recency; downstream steps can't recover from bad material","The judge","The model choice"],c:1,e:"Symptom at the end, cause upstream. Fix where the wrong material entered. (Lesson 4-3)"},
      {q:"Your gate's false-alarm rate is 30%. The most likely real-world consequence:",o:["Higher quality","The team learns to bypass red builds, so the gate stops protecting anything","Fewer regressions","Faster reviews"],c:1,e:"Trust is the gate's actual currency. Widen the set or loosen the threshold until red means something. (Lessons 5-1, 5-2)"},
      {q:"You've optimized prompts against the same eval set for months and production complaints haven't fallen. The most likely explanation:",o:["The scorer is broken","You've overfit the set; it no longer represents production","Users are wrong","The model regressed"],c:1,e:"An eval set you tune against becomes training data. Hold out a slice and refresh from live traffic. (Lessons 2-5, 5-5)"},
    ],
  };

  /* ---------- INSTRUMENTS ---------- */

  /** Normal CDF via an Abramowitz–Stegun erf approximation. */
  function phi(z) {
    var s = z < 0 ? -1 : 1;
    var x = Math.abs(z) / Math.SQRT2;
    var t = 1 / (1 + 0.3275911 * x);
    var y =
      1 -
      ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
        0.254829592) *
        t *
        Math.exp(-x * x);
    return 0.5 * (1 + s * y);
  }

  function buildGate(host) {
    var BASELINE = 0.9; // true pass rate of the current build
    var knobs = [
      {key:"n", name:"Eval set size (cases)", min:20, max:1000, step:20, val:50, fmt:function(v){return v;}},
      {key:"tol", name:"Allowed drop vs baseline", min:1, max:15, step:1, val:3, fmt:function(v){return v+" pts";}},
      {key:"flake", name:"Scorer flakiness", min:0, max:20, step:1, val:5, fmt:function(v){return v+"%";}},
      {key:"reg", name:"Size of a real regression", min:1, max:20, step:1, val:5, fmt:function(v){return v+" pts";}},
    ];
    var vals = {};
    knobs.forEach(function (k) { vals[k.key] = k.val; });

    host.innerHTML =
      '<div class="instrument"><div class="ihead"><span class="t">regression_gate · baseline pass rate <b>90%</b></span><span class="t" id="gt-n">n = 50</span></div>' +
      '<div class="ibody">' +
      '<div class="gate-out">' +
      '<div class="gate-card" id="gc-fa"><div class="gl">False alarm on a clean PR</div><div class="gv" id="gv-fa">—</div><p class="gh">Chance the gate goes red when nothing actually changed.</p></div>' +
      '<div class="gate-card" id="gc-det"><div class="gl">Catches a real regression</div><div class="gv" id="gv-det">—</div><p class="gh">Chance the gate goes red when quality genuinely dropped.</p></div>' +
      '</div>' +
      '<div class="sliders" id="gt-sliders"></div>' +
      '<div class="preset-row">' +
      '<span class="preset" data-p="tiny">↺ 50 cases, 3-point tolerance</span>' +
      '<span class="preset" data-p="sane">↺ What it actually takes</span>' +
      '<span class="preset" data-p="noisy">↺ …then make the judge flaky</span>' +
      '</div>' +
      '<div class="readout"><div class="rt">Diagnosis</div><div class="rmsg" id="gt-read">—</div></div>' +
      '</div></div>';

    var sliders = host.querySelector("#gt-sliders");
    knobs.forEach(function (k) {
      var row = document.createElement("div");
      row.className = "slider-row";
      row.innerHTML =
        '<span class="swatch" style="background:var(--accent)"></span><div><div class="rlabel"><span class="nm">' +
        k.name +
        '</span><span class="val" id="gv-' + k.key + '">' + k.fmt(k.val) +
        '</span></div><input type="range" min="' + k.min + '" max="' + k.max +
        '" step="' + k.step + '" value="' + k.val + '" id="gs-' + k.key +
        '" aria-label="' + k.name + '"></div>';
      sliders.appendChild(row);
      row.querySelector("input").addEventListener("input", function () {
        vals[k.key] = parseInt(this.value, 10);
        host.querySelector("#gv-" + k.key).textContent = k.fmt(vals[k.key]);
        render();
      });
    });

    function band(card, v, goodBelow, badAbove) {
      var el = host.querySelector(card);
      el.classList.remove("good", "warn", "bad");
      el.classList.add(v <= goodBelow ? "good" : v >= badAbove ? "bad" : "warn");
    }

    function render() {
      var n = vals.n;
      var tol = vals.tol / 100;
      var f = vals.flake / 100;
      var r = vals.reg / 100;

      // A gate compares this run against a baseline run measured the same way,
      // so both sides carry sampling noise and the scorer's flakiness cancels
      // out of the expected difference. What flakiness does instead is nastier:
      // it pulls both rates toward 50% (more variance) AND shrinks the real gap
      // to r*(1-2f) — more noise measuring a smaller signal.
      var clean = BASELINE * (1 - f) + (1 - BASELINE) * f;
      var trueBroken = Math.max(0, BASELINE - r);
      var broken = trueBroken * (1 - f) + (1 - trueBroken) * f;

      // Standard deviation of the difference between two independent runs.
      var sd = Math.sqrt((clean * (1 - clean)) / n + (broken * (1 - broken)) / n);
      var effect = clean - broken; // observable gap, after flakiness attenuation

      // Trip when the measured drop exceeds the allowance.
      var fa = sd > 0 ? phi(-tol / sd) : 0;
      var det = sd > 0 ? phi((effect - tol) / sd) : effect > tol ? 1 : 0;

      host.querySelector("#gt-n").textContent = "n = " + n;
      host.querySelector("#gv-fa").textContent = Math.round(fa * 100) + "%";
      host.querySelector("#gv-det").textContent = Math.round(det * 100) + "%";
      band("#gc-fa", fa * 100, 5, 20);
      band("#gc-det", 100 - det * 100, 20, 50);

      var msg = host.querySelector("#gt-read");
      if (fa > 0.2 && det > 0.8) {
        msg.innerHTML = "<b style='color:var(--bad)'>Red every other week.</b> It does catch regressions — but it cries wolf so often that people will start merging through it. An ignored gate protects nothing.";
      } else if (fa > 0.2) {
        msg.innerHTML = "<b style='color:var(--bad)'>Mostly noise.</b> High false alarms and it still misses real regressions. The set is too small to support this threshold.";
      } else if (det < 0.4) {
        msg.innerHTML = "<b style='color:var(--warn)'>Quiet and blind.</b> Almost never a false alarm, but a genuine " + vals.reg + "-point drop usually sails through. Widen the set or tighten the threshold.";
      } else if (fa <= 0.05 && det >= 0.8) {
        msg.innerHTML = "<b style='color:var(--signal)'>Trustworthy.</b> Rarely wrong when it's red, and it catches a " + vals.reg + "-point drop most of the time. This is the zone worth blocking merges on.";
      } else {
        msg.textContent = "Workable. Red usually means something, though a smaller regression than " + vals.reg + " points can still slip past.";
      }
    }

    var presets = {
      tiny: {n:50, tol:3, flake:5, reg:5},
      sane: {n:1000, tol:3, flake:2, reg:5},
      noisy: {n:1000, tol:3, flake:16, reg:5},
    };
    Array.prototype.slice.call(host.querySelectorAll(".preset")).forEach(function (b) {
      b.addEventListener("click", function () {
        var p = presets[this.getAttribute("data-p")];
        knobs.forEach(function (k) {
          vals[k.key] = p[k.key];
          host.querySelector("#gs-" + k.key).value = p[k.key];
          host.querySelector("#gv-" + k.key).textContent = k.fmt(p[k.key]);
        });
        render();
      });
    });

    render();
  }

  function buildTrace(host) {
    var spans = [
      {d:0, kind:"agent", name:"agent.run", det:"“What’s your refund window for the Pro plan?”", ms:"4.2s"},
      {d:1, kind:"llm", name:"llm.plan", det:"Decides to look up the refund policy before answering.", ms:"380ms"},
      {d:1, kind:"retrieve", name:"retrieve.docs", det:"query “refund policy” → 4 chunks. Top hit: <code>policy_v1.md</code> (last edited 2023-04).", ms:"120ms", culprit:true},
      {d:1, kind:"llm", name:"llm.decide", det:"Reads the top chunk, decides it has what it needs.", ms:"410ms"},
      {d:1, kind:"tool", name:"tool.get_order", det:"Order found, purchased 12 days ago.", ms:"90ms"},
      {d:1, kind:"llm", name:"llm.compose", det:"Answers “you have 30 days” — faithfully quoting the chunk it was given.", ms:"900ms"},
      {d:1, kind:"llm", name:"judge.check", det:"Tone and helpfulness rubric → pass. Nothing in the rubric checks facts.", ms:"300ms"},
      {d:0, kind:"agent", name:"agent.done", det:"Returned to user. The real policy has been 14 days since 2024.", ms:"—"},
    ];
    var CULPRIT = 2;

    host.innerHTML =
      '<div class="instrument"><div class="ihead"><span class="t">trace · run <b>7f2c91</b> · reported wrong</span><span class="t" id="tr-cnt">span 0 / ' + spans.length + '</span></div>' +
      '<div class="ibody"><div class="trace-list" id="tr-list"></div>' +
      '<div class="trace-ask" id="tr-ask" style="display:none">Which span is the root cause?</div>' +
      '<div class="trace-verdict" id="tr-verdict"></div></div>' +
      '<div class="loop-controls"><button class="btn primary" id="tr-next">Step →</button><button class="btn" id="tr-reset">↺ Reset</button><span class="cnt" id="tr-hint">walk the trace</span></div></div>';

    var list = host.querySelector("#tr-list");
    var nextBtn = host.querySelector("#tr-next");
    var resetBtn = host.querySelector("#tr-reset");
    var ask = host.querySelector("#tr-ask");
    var verdict = host.querySelector("#tr-verdict");
    var hint = host.querySelector("#tr-hint");
    var shown = 0;
    var answered = false;

    var explain = {
      2: "<b>Correct — retrieval.</b> A 2023 document ranked first and nothing downstream could recover: every later step behaved reasonably given what it was handed. Fix it where the wrong material entered — filter or rank by recency, and expire stale docs.",
      5: "<b>This is the symptom, not the cause.</b> <code>llm.compose</code> quoted “30 days” faithfully from the chunk it was given. Swapping models or rewriting this prompt would not help. Walk further upstream.",
      6: "<b>A real second bug, but not the cause.</b> The judge passed a factually wrong answer because its rubric only scored tone — worth fixing, and a good lesson in what your scorer isn't checking. The wrong fact still entered earlier.",
    };

    function paint() {
      list.innerHTML = "";
      spans.forEach(function (s, i) {
        var el = document.createElement(answered || i !== CULPRIT ? "div" : "button");
        var pickable = shown >= spans.length && !answered;
        el.className =
          "tspan kind-" + s.kind +
          (i < shown ? " shown" : "") +
          (pickable ? " pickable" : "") +
          (answered && s.culprit ? " culprit revealed" : "");
        el.innerHTML =
          '<span class="tdepth">' + (s.d === 0 ? "▸" : "└") + '</span>' +
          '<span><span class="tname">' + s.name + '</span><span class="tdet">' + s.det + '</span></span>' +
          '<span class="tms">' + s.ms + '</span>';
        if (pickable) {
          el.addEventListener("click", function () { choose(i); });
          el.style.cursor = "pointer";
        }
        list.appendChild(el);
      });

      // Make every row clickable once the walk is done, not just the culprit.
      if (shown >= spans.length && !answered) {
        Array.prototype.slice.call(list.children).forEach(function (el, i) {
          el.classList.add("pickable");
          el.onclick = function () { choose(i); };
        });
      }

      host.querySelector("#tr-cnt").textContent = "span " + Math.min(shown, spans.length) + " / " + spans.length;
      nextBtn.disabled = shown >= spans.length;
      nextBtn.textContent = shown >= spans.length ? "✓ Trace complete" : "Step →";
      ask.style.display = shown >= spans.length && !answered ? "block" : "none";
      hint.textContent = answered ? "root cause identified" : shown >= spans.length ? "pick a span" : "walk the trace";
    }

    function choose(i) {
      if (answered) return;
      answered = true;
      paint();
      var el = list.children[i];
      if (el) el.classList.add("chosen");
      verdict.innerHTML =
        explain[i] ||
        "<b>Not this one.</b> This span did its job with what it was given. The wrong fact entered at <code>retrieve.docs</code> — a 2023 policy ranked first — and everything after it was faithful to bad material.";
      verdict.classList.add("show");
    }

    nextBtn.addEventListener("click", function () {
      if (shown < spans.length) { shown++; paint(); }
    });
    resetBtn.addEventListener("click", function () {
      shown = 0; answered = false;
      verdict.classList.remove("show");
      verdict.innerHTML = "";
      paint();
    });

    paint();
  }

  function buildBias(host) {
    var drills = [
      {s:"You show the judge two candidate answers and ask which is better. You then swap their order and ask again — and it picks whichever one came second, both times.",o:["Position bias","Self-preference","Verbosity bias","Score clustering"],c:0,e:"<b>Position bias.</b> Order is influencing the verdict more than quality. Fix: run both orders and average, or score each answer independently against a rubric."},
      {s:"Your judge runs on the same model family that produced one of the candidates. That candidate wins far more often than human raters agree it should.",o:["Position bias","Self-preference","Verbosity bias","Score clustering"],c:1,e:"<b>Self-preference.</b> Models tend to favour their own style of output. Fix: judge with a different model, or use pairwise human-anchored calibration to measure the skew."},
      {s:"The answers that score highest are long, thoroughly hedged, and full of caveats. Spot-checking shows the short answers were more often correct.",o:["Position bias","Self-preference","Verbosity bias","Score clustering"],c:2,e:"<b>Verbosity bias.</b> Length and hedging read as thoroughness. Fix: state conciseness in the rubric, and score correctness separately from style."},
      {s:"Across 400 cases your 1–10 judge has given 7 to almost everything. Two builds you know differ noticeably score 7.1 and 7.2.",o:["Position bias","Self-preference","Verbosity bias","Score clustering"],c:3,e:"<b>Score clustering.</b> The judge avoids the ends of the scale, so it has almost no resolution. Fix: few discrete levels (fail / weak / pass), or pairwise comparison instead of absolute scoring."},
      {s:"A response your team considers clearly correct is marked wrong. Reading the judge's reasoning: it expected the currency written as “ILS” and the answer said “₪”.",o:["Position bias","Underspecified rubric","Verbosity bias","Self-preference"],c:1,e:"<b>Underspecified rubric.</b> Not really a bias — the judge followed instructions that didn't say what counts as equivalent. Fix: enumerate acceptable variants, and treat every disagreement with a human as a rubric bug first."},
    ];
    var i = 0, answered = false;
    host.innerHTML = '<div class="instrument drill"><div class="ihead"><span class="t">judge_diagnostics</span></div><div class="dgi" id="dgi"></div></div>';
    var body = host.querySelector("#dgi");

    function render() {
      var d = drills[i];
      body.innerHTML =
        '<div class="symptom"><span class="qi">SYMPTOM</span>' + d.s + '</div>' +
        '<div class="dg-sub">what is going wrong with this judge?</div>' +
        '<div class="dg-opts">' +
        d.o.map(function (o, x) { return '<button class="dg-opt" data-x="' + x + '">' + o + '</button>'; }).join("") +
        '</div><div class="dg-expl" id="dg-expl"></div>' +
        '<div class="dg-controls"><button class="btn" id="dg-next" disabled>Next symptom →</button><span class="cnt">' + (i + 1) + ' / ' + drills.length + '</span></div>';
      answered = false;
      Array.prototype.slice.call(body.querySelectorAll(".dg-opt")).forEach(function (b) {
        b.addEventListener("click", function () {
          if (answered) return;
          answered = true;
          var x = parseInt(this.getAttribute("data-x"), 10);
          Array.prototype.slice.call(body.querySelectorAll(".dg-opt")).forEach(function (bb, k) {
            bb.disabled = true;
            if (k === d.c) bb.classList.add("correct");
          });
          if (x !== d.c) this.classList.add("wrong");
          var ex = body.querySelector("#dg-expl");
          ex.innerHTML = d.e;
          ex.classList.add("show");
          body.querySelector("#dg-next").disabled = false;
          if (i === drills.length - 1) body.querySelector("#dg-next").textContent = "✓ Drill complete";
        });
      });
      body.querySelector("#dg-next").addEventListener("click", function () {
        if (i < drills.length - 1) { i++; render(); }
      });
    }
    render();
  }

  /* ---------- GO ---------- */
  Agentcraft.init({
    storageKey: 'agentcraft_eo_full_v1',
    sections: SECTIONS,
    quizzes: QUIZZES,
    instruments: {
      gate: buildGate,
      trace: buildTrace,
      bias: buildBias,
    },
    verdict: function (pctv) {
      return pctv >= 83
        ? "<b>Excellent.</b> You can build a measurement loop other people will trust — the rarest of the four skills in this set."
        : pctv >= 50
          ? "<b>Solid.</b> Revisit the lessons flagged in the answers you missed, especially anything on judges or thresholds, and you're set."
          : "<b>Worth another pass.</b> Re-run Sections 2 and 3 — the eval set and the scorer ladder — then retry.";
    },
  });
})();
