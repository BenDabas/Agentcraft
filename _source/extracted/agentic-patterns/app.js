(function(){
  "use strict";
  var SECTIONS=[
    {t:"Foundations",lessons:[
      {id:"1-1",t:"Welcome & how this course works",m:5,tag:"start"},
      {id:"1-2",t:"Call vs workflow vs agent",m:7},
      {id:"1-3",t:"Agent = Model + Harness",m:6},
      {id:"1-4",t:"Tools: the agent's hands",m:6},
      {id:"1-mcp",t:"MCP — the standard for tools & data",m:7},
      {id:"1-5",t:"Checkpoint",m:4,tag:"quiz"},
    ]},
    {t:"The Core Loop — ReAct",lessons:[
      {id:"2-1",t:"ReAct, stepped through",m:9,tag:"lab"},
      {id:"2-2",t:"The loop as harness code",m:7},
      {id:"2-rag",t:"Agentic RAG: retrieval as a tool",m:6},
      {id:"2-3",t:"Stopping conditions & guardrails",m:6},
      {id:"2-4",t:"Checkpoint",m:4,tag:"quiz"},
    ]},
    {t:"Reliability Patterns",lessons:[
      {id:"3-1",t:"Reflexion / self-critique",m:7},
      {id:"3-2",t:"Evaluator–optimizer",m:6},
      {id:"3-3",t:"Planning & decomposition",m:7},
      {id:"3-4",t:"Retries, fallbacks & recovery",m:6},
      {id:"3-5",t:"Checkpoint",m:4,tag:"quiz"},
    ]},
    {t:"Workflow Patterns",lessons:[
      {id:"4-1",t:"Prompt chaining",m:6},
      {id:"4-2",t:"Routing",m:6},
      {id:"4-3",t:"Parallelization & voting",m:6},
      {id:"4-4",t:"Checkpoint",m:4,tag:"quiz"},
    ]},
    {t:"Multi-Agent Systems",lessons:[
      {id:"5-1",t:"Orchestrator–workers",m:7},
      {id:"5-2",t:"Handoffs",m:6},
      {id:"5-3",t:"When multi-agent helps (and hurts)",m:6},
      {id:"5-4",t:"Checkpoint",m:4,tag:"quiz"},
    ]},
    {t:"Running in Production",lessons:[
      {id:"7-1",t:"Evals: measuring agent quality",m:7},
      {id:"7-2",t:"Observability & tracing",m:6},
      {id:"7-3",t:"Guardrails & prompt-injection defense",m:8},
      {id:"7-4",t:"Checkpoint",m:4,tag:"quiz"},
    ]},
    {t:"Choosing & Composing",lessons:[
      {id:"6-1",t:"Which pattern? (decision tool)",m:6,tag:"lab"},
      {id:"6-2",t:"Composing patterns",m:6},
      {id:"6-3",t:"Anti-patterns",m:6},
      {id:"6-4",t:"Final exam",m:8,tag:"exam"},
      {id:"6-5",t:"Wrap-up & next steps",m:5},
    ]},
  ];

  var QUIZZES={
    s1:[
      {q:"What distinguishes an agent from a workflow?",o:["The agent uses a bigger model","In an agent, the MODEL decides the control flow at runtime; a workflow's path is fixed by you","Agents don't use tools","Workflows are always slower"],c:1,e:"Who decides the next step: you (workflow) or the model at runtime (agent). (Lesson 1-2)"},
      {q:"'Agent = Model + Harness' — the harness provides…",o:["A better model","The loop, tool execution, state, and stopping rules","The training data","Nothing important"],c:1,e:"The harness turns per-step intelligence into reliable end-to-end behavior. (Lesson 1-3)"},
      {q:"Why is a tool's description considered context?",o:["It isn't","The model reads it every turn to decide what to call — so it's instruction that costs budget","Descriptions are only for humans","It's stored in the model weights"],c:1,e:"Tool defs ship into the window; write them like prompts. (Lesson 1-4)"},
      {q:"What problem does MCP (Model Context Protocol) solve?",o:["It makes models bigger","A standard way to connect agents to external tools & data, so integrations are reusable across apps","It replaces the agent loop","It trains the model"],c:1,e:"MCP is an open standard — 'USB-C for AI' — for exposing tools/resources to any MCP-compatible client. (Lesson 1-mcp)"},
    ],
    s2:[
      {q:"In ReAct, why read the Observation before the next Action?",o:["To lengthen the trace","So the model reacts to real results and corrects course instead of charging ahead","The API requires it","To spend more tokens"],c:1,e:"Observe-before-continue is what makes an agent adaptive. (Lesson 2-1)"},
      {q:"In the loop code, what signals the agent is done?",o:["A timer","The model returns no tool calls (just a final answer)","It always runs maxSteps","The user interrupts"],c:1,e:"No tool call → return the text. The maxSteps guard is the safety net. (Lesson 2-2)"},
      {q:"Which is a proper stopping condition?",o:["'It usually finishes in 4 steps'","A hard max-steps/token ceiling plus a clear done signal","Hoping it stops","Removing all tools"],c:1,e:"Never ship an unbounded loop. Bounds first, then behavior. (Lesson 2-3)"},
      {q:"'Agentic RAG' differs from classic RAG because…",o:["It uses no retrieval","Retrieval is a TOOL the agent calls when it decides — iteratively — not a one-shot lookup","It's always faster","It skips the model"],c:1,e:"The agent controls retrieval, reformulating and searching in the loop. (Lesson 2-rag)"},
    ],
    s3:[
      {q:"Reflexion improves quality by…",o:["Using a bigger model","Having the agent critique its own output and retry with the critique in context","Removing tools","Running faster"],c:1,e:"Self-critique fed back into context makes the retry informed. (Lesson 3-1)"},
      {q:"Evaluator–optimizer is most worth it when…",o:["Criteria are vague","You have explicit, checkable quality criteria","You never need quality","There are no tools"],c:1,e:"A crisp rubric makes a separate evaluator valuable; vague criteria add cost for little signal. (Lesson 3-2)"},
      {q:"Best way to handle a tool that throws mid-loop?",o:["Crash the whole run","Feed the error back as an observation so the agent can adapt","Ignore it silently","Retry forever with no limit"],c:1,e:"Return the error into the loop; a capable model often self-corrects. (Lesson 3-4)"},
    ],
    s4:[
      {q:"When the sequence of steps is known in advance, prefer…",o:["A multi-agent system","Prompt chaining (a fixed workflow)","An unbounded agent","More tools"],c:1,e:"Don't give the model control of a flow you already know — chain it. (Lesson 4-1)"},
      {q:"Routing works by…",o:["Running every handler always","Classifying the input, then dispatching to a specialized handler","Using one giant prompt","Random selection"],c:1,e:"Triage then dispatch — each specialist gets a lean, focused context. (Lesson 4-2)"},
      {q:"'Voting' parallelization trades…",o:["Quality for speed","Cost for reliability — run the same task N times and pick the best/majority","Nothing","Tools for memory"],c:1,e:"Extra calls buy reliability on high-stakes answers. (Lesson 4-3)"},
    ],
    s5:[
      {q:"Orchestrator–workers is essentially which context operation, scaled up?",o:["Write","Select","Compress","Isolate"],c:3,e:"Each worker gets its own lean, isolated window; the lead synthesizes summaries. (Lesson 5-1)"},
      {q:"The hard design question in a handoff is…",o:["Which model to use","What (scoped) context travels with it — too little strands the receiver, too much rebloats the window","The color of the UI","How many tools exist"],c:1,e:"Scoping the handoff payload is a context-engineering decision. (Lesson 5-2)"},
      {q:"You should reach for multi-agent when…",o:["Always — more agents is better","The task genuinely exceeds one clean context and sub-tasks are independent","A single ReAct loop already fits","You want it to look sophisticated"],c:1,e:"Default to the simplest thing that works; climb only when needed. (Lesson 5-3)"},
    ],
    s6:[
      {q:"'LLM-as-judge' evals are used to…",o:["Train the model","Score agent outputs against criteria at scale using a model as grader","Replace the agent","Speed up inference"],c:1,e:"A grader model scores outputs against a rubric — scalable, but validate it against human labels. (Lesson 7-1)"},
      {q:"The core job of observability / tracing in agents is to…",o:["Make agents faster","Record each step — prompts, tool calls, outputs — so you can see what actually happened","Remove the need for evals","Hide errors"],c:1,e:"You can't debug or improve what you can't see; trace every step. (Lesson 7-2)"},
      {q:"Best defense against an agent being hijacked by text in a fetched web page?",o:["A bigger model","Treat external content as data, use least-privilege tools, and gate side effects","More prompts","Ignore it"],c:1,e:"Indirect prompt injection; defend with trust boundaries and gated actions. (Lesson 7-3)"},
    ],
    final:[
      {q:"The defining feature of an agent (vs a workflow) is:",o:["A bigger context window","The model chooses its own control flow at runtime","It never fails","It uses no tools"],c:1,e:"Autonomy over the next step. (Lesson 1-2)"},
      {q:"In 'Agent = Model + Harness', shipping reliability is mostly about building…",o:["A better model","The harness — loop, tools, state, stopping rules","More prompts","Bigger datasets"],c:1,e:"A great harness makes a modest model reliable. (Lesson 1-3)"},
      {q:"The observe-before-continue step in ReAct exists to…",o:["Use tokens","Let the agent adapt to real results instead of guessing ahead","Satisfy the API","Slow things down"],c:1,e:"It's the source of adaptivity. (Lesson 2-1)"},
      {q:"Reflexion depends on which companion-course idea to work?",o:["Bigger models","Writing the critique back INTO the context for the retry","Removing all tools","Parallel calls"],c:1,e:"A pattern is only as good as the context it runs on. (Lesson 3-1)"},
      {q:"A task's steps are fully known ahead of time. Best choice?",o:["Multi-agent orchestra","Prompt chaining","Unbounded ReAct","Voting"],c:1,e:"Fixed path → wire it yourself. (Lesson 4-1)"},
      {q:"The recurring rule for choosing patterns is:",o:["Always go multi-agent","Start simple; climb call → workflow → agent → multi-agent only when forced","Add Reflexion everywhere","Never bound the loop"],c:1,e:"Simplest thing that works; each rung only when the last can't cope. (Lessons 5-3, 6-3)"},
      {q:"MCP matters to agent builders because it…",o:["Is a bigger model","Standardizes how tools & data connect to agents, making integrations reusable (now under the Linux Foundation's AAIF)","Replaces ReAct","Is required by law"],c:1,e:"An open, widely-adopted integration standard. (Lesson 1-mcp)"},
      {q:"An agent reads a document with hidden 'delete everything' instructions and acts on them. This is… + the guard?",o:["Distraction → compress","Indirect prompt injection → data-not-instructions, least privilege, gate side effects","A model bug","Normal behavior"],c:1,e:"Injection via untrusted content; defend with a trust boundary and gated actions. (Lesson 7-3)"},
    ],
  };

  var ORDER=[];SECTIONS.forEach(function(s){s.lessons.forEach(function(l){ORDER.push(l.id);});});
  var TOTAL=ORDER.length;

  var KEY="console_ap_full_v1";
  var store={done:{},last:null};
  try{var r=localStorage.getItem(KEY);if(r)store=JSON.parse(r);if(!store.done)store.done={};}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}

  var root=document.documentElement;
  function curTheme(){return root.getAttribute("data-theme")||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");}
  document.getElementById("themeBtn").addEventListener("click",function(){var n=curTheme()==="dark"?"light":"dark";root.setAttribute("data-theme",n);try{localStorage.setItem("console_theme",n);}catch(e){}});
  try{var t=localStorage.getItem("console_theme");if(t)root.setAttribute("data-theme",t);}catch(e){}

  var curriculum=document.getElementById("curriculum");
  var collapsed={};
  function buildSidebar(){
    curriculum.innerHTML="";
    SECTIONS.forEach(function(sec,si){
      var dc=sec.lessons.filter(function(l){return store.done[l.id];}).length;
      var secEl=document.createElement("div");secEl.className="sec"+(collapsed[si]?" collapsed":"");
      var head=document.createElement("button");head.className="sec-head";
      head.innerHTML='<span class="caret">▼</span><span class="sx">S'+(si+1)+'</span><span class="st">'+sec.t+'</span><span class="sc">'+dc+'/'+sec.lessons.length+'</span>';
      head.addEventListener("click",function(){collapsed[si]=!collapsed[si];secEl.classList.toggle("collapsed");});
      secEl.appendChild(head);
      var list=document.createElement("div");list.className="lessons";
      sec.lessons.forEach(function(l){
        var b=document.createElement("button");b.className="lrow"+(store.done[l.id]?" done":"")+(l.id===current?" current":"");
        var badge=l.tag?'<span class="badge">'+l.tag+'</span>':'<span class="lm">'+l.m+'m</span>';
        b.innerHTML='<span class="tick">✓</span><span class="lt">'+l.t+'</span>'+badge;
        b.addEventListener("click",function(){go(l.id);closeMenu();});
        list.appendChild(b);
      });
      secEl.appendChild(list);curriculum.appendChild(secEl);
    });
  }
  function refreshProgress(){
    var done=ORDER.filter(function(id){return store.done[id];}).length,pct=Math.round(done/TOTAL*100);
    document.getElementById("pfill").style.width=pct+"%";
    document.getElementById("pdone").textContent=done;
    document.getElementById("ptotal").textContent=TOTAL;
    document.getElementById("topPct").textContent=pct+"%";
  }

  var current=null,lessonEl=document.getElementById("lesson"),footerEl=document.getElementById("footer");
  function meta(id){for(var i=0;i<SECTIONS.length;i++){var s=SECTIONS[i];for(var j=0;j<s.lessons.length;j++){if(s.lessons[j].id===id)return{sec:i,idx:j,l:s.lessons[j],secTitle:s.t};}}return null;}
  function go(id){
    current=id;store.last=id;save();
    var m=meta(id),tpl=document.querySelector('script[data-lesson="'+id+'"]');
    var crumb='<div class="crumb"><span>Section '+(m.sec+1)+' · '+m.secTitle+'</span><span class="sep">/</span><span>Lesson '+(m.idx+1)+'</span><span class="sep">·</span><span class="dur">'+m.l.m+' min</span></div>';
    lessonEl.innerHTML=crumb+'<h1>'+m.l.t+'</h1>'+(tpl?tpl.innerHTML:'<p>Coming soon.</p>');
    mountWidgets();buildFooter(id);buildSidebar();refreshProgress();
    window.scrollTo({top:0,behavior:"auto"});lessonEl.scrollIntoView({block:"start"});
  }
  function buildFooter(id){
    var i=ORDER.indexOf(id),prev=i>0?ORDER[i-1]:null,next=i<TOTAL-1?ORDER[i+1]:null;
    footerEl.innerHTML="";
    var prevBtn=document.createElement(prev?"button":"span");
    if(prev){prevBtn.className="btn";prevBtn.innerHTML="← Previous";prevBtn.addEventListener("click",function(){go(prev);});}
    footerEl.appendChild(prevBtn);
    var sp=document.createElement("span");sp.className="spacer";footerEl.appendChild(sp);
    var mainBtn=document.createElement("button");mainBtn.className="btn primary";var da=store.done[id];
    if(next)mainBtn.innerHTML=(da?"Next lesson →":"Mark complete & continue →");
    else mainBtn.innerHTML=(da?"✓ Course complete":"✓ Finish course");
    mainBtn.addEventListener("click",function(){store.done[id]=true;save();if(next)go(next);else{buildSidebar();refreshProgress();buildFooter(id);}});
    footerEl.appendChild(mainBtn);
    var lf=document.createElement("span");lf.className="lfmeta";lf.textContent="Lesson "+(i+1)+" of "+TOTAL;footerEl.appendChild(lf);
  }

  function mountWidgets(){
    Array.prototype.slice.call(lessonEl.querySelectorAll("[data-mount]")).forEach(function(el){
      var k=el.getAttribute("data-mount");
      if(k==="loop")buildLoop(el);
      else if(k==="picker")buildPicker(el);
      else if(k==="quiz")buildQuiz(el,el.getAttribute("data-quiz"));
    });
  }

  function buildLoop(host){
    var steps=[
      {p:"thought",k:"Thought",v:"Meeting in Tel Aviv, question about an umbrella. I need today's forecast there. I'll check the weather tool."},
      {p:"action",k:"Action",v:"call <code>get_weather(city: \"Tel Aviv\", when: \"today\")</code>"},
      {p:"observation",k:"Observation",v:"{ condition: \"rain\", chance: 0.7, high: 19°C }"},
      {p:"thought",k:"Thought",v:"70% rain — high. But is the meeting outdoors, and does timing overlap? Let me check the calendar before answering."},
      {p:"action",k:"Action",v:"call <code>check_calendar(event: \"Tel Aviv meeting\")</code>"},
      {p:"observation",k:"Observation",v:"{ time: \"15:00\", location: \"outdoor terrace, Sarona\" }"},
      {p:"final",k:"Final answer",v:"Yes — bring an umbrella. 70% chance of rain this afternoon and your 3pm is on an outdoor terrace, so you'll be exposed right when it's most likely to rain."},
    ];
    host.innerHTML='<div class="instrument"><div class="ihead"><span class="t">react_loop · worked example</span></div><div class="ibody"><div class="loop-body"><svg class="loop-svg" viewBox="0 0 200 200" role="img" aria-label="ReAct loop: Think, Act, Observe"><defs><marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--line-strong)"></path></marker></defs><path d="M 100 42 A 58 58 0 0 1 150 128" fill="none" stroke="var(--line-strong)" stroke-width="1.5" marker-end="url(#ar)"></path><path d="M 148 132 A 58 58 0 0 1 52 132" fill="none" stroke="var(--line-strong)" stroke-width="1.5" marker-end="url(#ar)"></path><path d="M 50 128 A 58 58 0 0 1 100 42" fill="none" stroke="var(--line-strong)" stroke-width="1.5" marker-end="url(#ar)"></path><g class="loop-node" id="nd-thought" transform="translate(100,40)"><circle class="ring" r="26"></circle><text text-anchor="middle" dy="4">THINK</text></g><g class="loop-node" id="nd-action" transform="translate(155,135)"><circle class="ring" r="26"></circle><text text-anchor="middle" dy="4">ACT</text></g><g class="loop-node" id="nd-observation" transform="translate(45,135)"><circle class="ring" r="26"></circle><text text-anchor="middle" dy="4">OBSERVE</text></g></svg><div class="loop-log" id="lp-log"></div></div></div><div class="loop-controls"><button class="btn primary" id="lp-next">Step →</button><button class="btn" id="lp-reset">↺ Reset</button><span class="cnt" id="lp-cnt">step 0 / 7</span></div></div>';
    var log=host.querySelector("#lp-log"),nb=host.querySelector("#lp-next"),rb=host.querySelector("#lp-reset"),cnt=host.querySelector("#lp-cnt"),shown=0;
    function render(){
      log.innerHTML="";
      ["thought","action","observation"].forEach(function(p){host.querySelector("#nd-"+p).classList.remove("active");});
      for(var i=0;i<shown;i++){var s=steps[i];var d=document.createElement("div");d.className="loop-step shown "+s.p;d.innerHTML='<div class="lk">'+s.k+'</div><div class="lv">'+s.v+'</div>';log.appendChild(d);}
      if(shown>0&&shown<=steps.length){var a=steps[shown-1].p,np=a==="final"?"thought":a,node=host.querySelector("#nd-"+np);if(node)node.classList.add("active");log.scrollTop=log.scrollHeight;}
      cnt.textContent="step "+shown+" / "+steps.length;nb.disabled=shown>=steps.length;nb.textContent=shown>=steps.length?"✓ Task done":"Step →";
    }
    nb.addEventListener("click",function(){if(shown<steps.length){shown++;render();}});
    rb.addEventListener("click",function(){shown=0;render();});
    render();
  }

  function buildPicker(host){
    var recs={
      known:{n:"Prompt chaining (a workflow)",w:"The path is fixed, so don't hand the model control it doesn't need. Wire the steps explicitly — more predictable, cheaper, and far easier to debug."},
      uq:{n:"ReAct + Reflexion",w:"The model must choose its own steps and correctness matters. Run a ReAct loop so it reacts to results, wrapped in a self-critique retry to catch mistakes before returning."},
      ub:{n:"Orchestrator–workers",w:"Too big for one clean window. A lead decomposes and delegates to workers, each in its own isolated context, then synthesizes — Isolate as an architecture."},
    };
    var q=1;
    host.innerHTML='<div class="instrument picker"><div class="ihead"><span class="t">pattern_selector</span></div><div class="ibody"><div id="pk-q"><div class="pq" id="pk-text"></div><div class="pq-sub" id="pk-sub"></div><div class="pick-opts" id="pk-opts"></div></div><div class="pick-result" id="pk-res"><div class="rt">Recommended starting point</div><div class="rn" id="pk-name"></div><p id="pk-why"></p><button class="btn pick-reset" id="pk-reset">↺ Start over</button></div></div></div>';
    var res=host.querySelector("#pk-res");
    function opts(list,cb){var o=host.querySelector("#pk-opts");o.innerHTML="";list.forEach(function(it){var b=document.createElement("button");b.className="pick-opt";b.textContent=it.t;b.addEventListener("click",function(){cb(it.v);});o.appendChild(b);});}
    function show(r){host.querySelector("#pk-name").textContent=r.n;host.querySelector("#pk-why").textContent=r.w;res.classList.add("show");}
    function render(){
      res.classList.remove("show");
      if(q===1){host.querySelector("#pk-text").textContent="Is the sequence of steps known before you start?";host.querySelector("#pk-sub").textContent="question 1 of 2";
        opts([{t:"Yes — I know the steps up front",v:"yes"},{t:"No — it depends on what the agent finds",v:"no"}],function(v){if(v==="yes")show(recs.known);else{q=2;render();}});
      }else{host.querySelector("#pk-text").textContent="What's the harder constraint on this task?";host.querySelector("#pk-sub").textContent="question 2 of 2";
        opts([{t:"Getting the answer right (quality/correctness)",v:"q"},{t:"Sheer size — too much to fit one context",v:"b"}],function(v){show(v==="q"?recs.uq:recs.ub);});
      }
    }
    host.querySelector("#pk-reset").addEventListener("click",function(){q=1;render();});
    render();
  }

  function buildQuiz(host,qid){
    var qs=QUIZZES[qid]||[],isFinal=qid==="final",answered={},score=0,letters=["A","B","C","D"];
    host.innerHTML='<div class="quiz'+(isFinal?" quiz-final":"")+'"><div class="qhead"><span class="t">'+(isFinal?"final_exam":"checkpoint")+'</span><span class="score" id="qs">0 / '+qs.length+'</span></div><div class="qbody" id="qb"></div>'+(isFinal?'<div class="verdict" id="qv"></div>':'')+'</div>';
    var qb=host.querySelector("#qb");
    qs.forEach(function(item,qi){var w=document.createElement("div");w.className="qitem";w.innerHTML='<div class="qn"><span class="qx">Q'+(qi+1)+'</span>'+item.q+'</div><div class="qopts">'+item.o.map(function(o,oi){return '<button class="qopt" data-qi="'+qi+'" data-oi="'+oi+'"><span class="mk">'+letters[oi]+'</span><span>'+o+'</span></button>';}).join("")+'</div><div class="qexpl" id="qe-'+qi+'"></div>';qb.appendChild(w);});
    qb.addEventListener("click",function(e){
      var btn=e.target.closest(".qopt");if(!btn)return;
      var qi=parseInt(btn.getAttribute("data-qi"),10),oi=parseInt(btn.getAttribute("data-oi"),10);
      if(answered[qi])return;answered[qi]=true;var item=qs[qi];
      Array.prototype.slice.call(btn.parentElement.querySelectorAll(".qopt")).forEach(function(b,k){b.disabled=true;if(k===item.c)b.classList.add("correct");});
      if(oi===item.c)score++;else btn.classList.add("wrong");
      host.querySelector("#qs").textContent=score+" / "+qs.length;
      var ex=host.querySelector("#qe-"+qi);ex.innerHTML=(oi===item.c?"<b>Correct.</b> ":"<b>Not quite.</b> ")+item.e;ex.classList.add("show");
      if(Object.keys(answered).length===qs.length&&isFinal){
        var v=host.querySelector("#qv"),pv=Math.round(score/qs.length*100);
        var msg=pv>=83?"<b>Excellent.</b> You've got the agentic-patterns toolkit down.":pv>=50?"<b>Solid.</b> Revisit the lessons flagged in the answers you missed.":"<b>Worth another pass.</b> Re-run Sections 1–2 (foundations + ReAct), then retry.";
        v.innerHTML="You scored "+score+" / "+qs.length+" ("+pv+"%). "+msg;v.classList.add("show");
      }
    });
  }

  var sidebar=document.getElementById("sidebar"),scrim=document.getElementById("scrim");
  function closeMenu(){sidebar.classList.remove("open");scrim.classList.remove("show");}
  document.getElementById("menuBtn").addEventListener("click",function(){sidebar.classList.toggle("open");scrim.classList.toggle("show");});
  scrim.addEventListener("click",closeMenu);

  var cs=document.getElementById("courseSwitch"),csT=document.getElementById("csTrigger");
  if(cs&&csT){
    csT.addEventListener("click",function(e){e.stopPropagation();var open=cs.classList.toggle("open");csT.setAttribute("aria-expanded",open?"true":"false");});
    document.addEventListener("click",function(e){if(!cs.contains(e.target)){cs.classList.remove("open");csT.setAttribute("aria-expanded","false");}});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"){cs.classList.remove("open");csT.setAttribute("aria-expanded","false");}});
  }

  buildSidebar();refreshProgress();
  go(store.last&&meta(store.last)?store.last:ORDER[0]);
})();
