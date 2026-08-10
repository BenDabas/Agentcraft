/**
 * multi-agent-systems — curriculum, quiz banks and instruments.
 *
 * The shell (sidebar, progress, lesson rendering, quiz engine, drawer) is in
 * shared/shell.js. This file is the course itself.
 */
(function () {
  'use strict';

  /* ---------- DATA ---------- */
  var SECTIONS=[
      {t:"Foundations",lessons:[
        {id:"1-1",t:"Welcome & how this course works",m:5,tag:"start"},
        {id:"1-2",t:"What a multi-agent system is",m:6},
        {id:"1-3",t:"Why — and why not — multi-agent",m:7},
        {id:"1-4",t:"Single-agent first: the bar to clear",m:6},
        {id:"1-5",t:"Checkpoint",m:4,tag:"quiz"},
      ]},
      {t:"Core Topologies",lessons:[
        {id:"2-1",t:"The topology map",m:7,tag:"lab"},
        {id:"2-2",t:"Orchestrator–workers",m:9,tag:"lab"},
        {id:"2-3",t:"Pipeline (sequential)",m:6},
        {id:"2-4",t:"Parallel / map-reduce",m:7},
        {id:"2-5",t:"Network (decentralized)",m:6},
        {id:"2-6",t:"Checkpoint",m:4,tag:"quiz"},
      ]},
      {t:"Coordination & Communication",lessons:[
        {id:"3-1",t:"Handoffs",m:6},
        {id:"3-2",t:"Shared state vs message passing",m:7},
        {id:"3-3",t:"What context travels",m:7},
        {id:"3-4",t:"Roles & specialization",m:6},
        {id:"3-5",t:"Checkpoint",m:4,tag:"quiz"},
      ]},
      {t:"Protocols & Interop",lessons:[
        {id:"4-1",t:"MCP vs A2A",m:6},
        {id:"4-2",t:"The A2A idea",m:6},
        {id:"4-3",t:"Reading the landscape",m:6},
        {id:"4-4",t:"Checkpoint",m:4,tag:"quiz"},
      ]},
      {t:"Building It",lessons:[
        {id:"5-1",t:"The orchestrator loop in code",m:7},
        {id:"5-2",t:"Isolating worker context",m:7},
        {id:"5-3",t:"Synthesizing results",m:6},
        {id:"5-4",t:"Error handling across agents",m:6},
        {id:"5-5",t:"Checkpoint",m:4,tag:"quiz"},
      ]},
      {t:"Reliability, Cost & Security",lessons:[
        {id:"6-1",t:"Multi-agent failure modes",m:6},
        {id:"6-2",t:"Cost & latency of fan-out",m:6},
        {id:"6-3",t:"Observability & evals for a tree",m:6},
        {id:"6-4",t:"Security across agents",m:7},
        {id:"6-5",t:"Checkpoint",m:4,tag:"quiz"},
      ]},
      {t:"Design & Capstone",lessons:[
        {id:"7-1",t:"Choosing a topology (decision tool)",m:6,tag:"lab"},
        {id:"7-2",t:"Anti-patterns",m:6},
        {id:"7-3",t:"Final exam",m:8,tag:"exam"},
        {id:"7-4",t:"Wrap-up & the through-line",m:5},
      ]},
    ]

  var QUIZZES={
      s1:[
        {q:"What actually makes a system 'multi-agent' rather than one agent with many tools?",o:["It uses a bigger model","Multiple independent contexts each doing separate reasoning, coordinated together","It has more than 10 tools","It runs in the cloud"],c:1,e:"Separate windows doing separate reasoning is the defining trait. One window = one agent. (Lesson 1-2)"},
        {q:"Which is a legitimate reason to go multi-agent?",o:["It sounds more sophisticated","The task genuinely exceeds one clean context, or sub-tasks are independent/specialized","You have spare compute","To use a new framework"],c:1,e:"Context overflow, real parallelism, specialization, or risk isolation. Otherwise stay single-agent. (Lesson 1-3)"},
        {q:"The escalation ladder for choosing an architecture is:",o:["Multi-agent → agent → workflow → call","Call → workflow → single agent → multi-agent, only climbing when forced","Always multi-agent","Random"],c:1,e:"Climb only when the current rung genuinely can't hold the task. (Lesson 1-4)"},
      ],
      s2:[
        {q:"A lead agent decomposes a task, delegates to isolated workers, and synthesizes. Topology?",o:["Pipeline","Orchestrator–workers","Network","Single agent"],c:1,e:"Orchestrator–workers — Isolate as an architecture. (Lesson 2-2)"},
        {q:"Stages must run in a fixed order, each feeding the next (draft→edit→format). Topology?",o:["Parallel","Network","Pipeline","Orchestrator"],c:2,e:"Pipeline: sequential, specialized stages. Weakness: latency is the sum, errors propagate. (Lesson 2-3)"},
        {q:"Independent pieces run at the same time and are merged mechanically. Topology?",o:["Parallel / map-reduce","Pipeline","Network","Single agent"],c:0,e:"Fan-out/fan-in. Buys latency, not cost — you still pay for every worker. (Lesson 2-4)"},
        {q:"Agents talk peer-to-peer with no coordinator. Topology — and the main risk?",o:["Pipeline — slow","Network — loops, ping-pong, hard to bound","Orchestrator — bottleneck","Parallel — merge cost"],c:1,e:"Network: maximum flexibility, hardest to control. Use sparingly and bound hard. (Lesson 2-5)"},
      ],
      s3:[
        {q:"The single most important design decision in a handoff is…",o:["Which model the receiver uses","What scoped context travels with it — too little strands, too much rebloats","The UI color","How many tools exist"],c:1,e:"Scoping the handoff payload is pure context engineering. (Lesson 3-1)"},
        {q:"The main danger of a shared-state (blackboard) coordination model is…",o:["It's too fast","One agent writing a bad fact poisons every reader","It can't hold data","It needs no validation"],c:1,e:"Shared-state poisoning. Validate before writing; prefer message passing for isolation. (Lesson 3-2)"},
        {q:"Good specialization between agents requires…",o:["Slightly reworded prompts","Genuinely distinct tools, instructions, and context needs","At least ten agents","The same tools for all"],c:1,e:"If two agents could share one prompt and tool set, they should be one agent. (Lesson 3-4)"},
      ],
      s4:[
        {q:"MCP connects an agent to ___; A2A connects an agent to ___.",o:["other agents; tools","tools & data; other agents","the internet; the model","nothing; everything"],c:1,e:"MCP = tools/data ('USB-C for AI'); A2A = agent-to-agent delegation. (Lesson 4-1)"},
        {q:"The core idea of A2A is…",o:["Bigger context windows","Agents advertise capabilities and can discover & delegate to each other across boundaries","Replacing MCP","Training agents"],c:1,e:"Capability discovery + structured task delegation between agents. (Lesson 4-2)"},
        {q:"A useful first question about any new agent standard is…",o:["Who marketed it loudest","Does it connect to capabilities/data (MCP-shaped) or to other agents (A2A-shaped)?","How new it is","Its logo"],c:1,e:"Placing it as MCP-shaped vs A2A-shaped, plus governance, orients you fast. (Lesson 4-3)"},
      ],
      s5:[
        {q:"An orchestrator is essentially…",o:["A bigger model","An agent whose 'tools' are other agents: plan → dispatch to isolated workers → synthesize","A database","A single prompt"],c:1,e:"That three-step shape underlies every orchestration framework. (Lesson 5-1)"},
        {q:"Why must a worker return a DISTILLED result, not its full transcript?",o:["To save disk","Or the orchestrator's window fills with raw output — back to context rot","The API requires it","It doesn't matter"],c:1,e:"Isolate + Compress. Skip the distill and you rebuild the bloated window. (Lesson 5-2)"},
        {q:"Best practice when one worker fails mid-run?",o:["Crash the whole system","Isolate the failure — catch per-worker, decide retry/skip/abort, don't let it sink the others","Ignore all errors","Retry forever"],c:1,e:"Treat workers like unreliable network calls: timeouts, retries, graceful degradation. (Lesson 5-4)"},
      ],
      s6:[
        {q:"Parallel fan-out primarily buys you…",o:["Lower cost","Lower latency — but you still pay for every worker","Fewer bugs","A smaller model"],c:1,e:"Parallelism cuts wall-clock time, never total cost. Cost-sensitive? Fewer agents may win. (Lesson 6-2)"},
        {q:"Without tree-level tracing, a multi-agent system is…",o:["Faster","Nearly undebuggable — a wrong answer with no way to localize the cause","More secure","Cheaper"],c:1,e:"Build observability across the whole agent tree before scaling agents. (Lesson 6-3)"},
        {q:"'Injection propagation' in a multi-agent system means…",o:["Agents run faster","A hijacked worker's malicious output rides into the orchestrator or siblings","Better parallelism","Nothing"],c:1,e:"Treat inter-agent messages as untrusted; least privilege; gate side effects centrally. (Lesson 6-4)"},
      ],
      final:[
        {q:"The one rule governing multi-agent design is:",o:["More agents is better","It's a cost you pay only to buy what a single agent can't give you","Always use a network","Avoid orchestrators"],c:1,e:"Reach for it deliberately; clear the single-agent bar first. (Lessons 1-3, 1-4)"},
        {q:"A task needs a lead to plan and synthesize dynamically. Best topology?",o:["Pipeline","Orchestrator–workers","Network","Parallel with fixed merge"],c:1,e:"Dynamic planning + synthesis = orchestrator. (Lesson 2-2)"},
        {q:"Independent sub-tasks, no dynamic planning, mechanical merge. Best topology?",o:["Orchestrator","Pipeline","Parallel / map-reduce","Network"],c:2,e:"Fixed split + merge = parallel. (Lesson 2-4)"},
        {q:"The make-or-break skill at every agent boundary is…",o:["Choosing the model","Scoping what context crosses it","Naming the agents","Picking a framework"],c:1,e:"Pass distilled results and the goal, not raw transcripts. (Lessons 3-1, 3-3)"},
        {q:"MCP is to tools as A2A is to…",o:["models","other agents","databases","prompts"],c:1,e:"A2A standardizes agent-to-agent delegation the way MCP standardizes tool access. (Lesson 4-1)"},
        {q:"Skipping the 'distill' step when workers return results causes…",o:["Faster runs","Context rot in the orchestrator's window","Better accuracy","Lower cost"],c:1,e:"The orchestrator drowns in raw output — Isolate without Compress. (Lesson 5-2)"},
        {q:"Parallel fan-out and cost:",o:["It lowers cost","You still pay for every worker; it only lowers latency","It's always free","Cost is unpredictable"],c:1,e:"Parallelism buys time, not money. (Lesson 6-2)"},
        {q:"The cardinal multi-agent anti-pattern is:",o:["Using an orchestrator","Building multi-agent when a single agent would do","Tracing the tree","Isolating contexts"],c:1,e:"Start simple; the single-agent version first. (Lessons 1-4, 7-2)"},
      ],
    }

  /* ---------- INSTRUMENTS ---------- */
  function buildOrch(host){
      var steps=[
        {node:"lead",cls:"lead",k:"Lead · receive",v:"Task: build a competitive brief on Acme's new product. Too broad for one clean context — I'll decompose and delegate."},
        {node:"lead",cls:"lead",k:"Lead · plan",v:"Three independent sub-tasks: (A) pricing, (B) feature comparison, (C) recent market news."},
        {node:"wA",cls:"worker",k:"Dispatch → Worker A",v:"Worker A gets ONLY the pricing sub-task, in its own fresh context."},
        {node:"wB",cls:"worker",k:"Dispatch → Worker B",v:"Worker B researches features — isolated context, no pricing noise."},
        {node:"wC",cls:"worker",k:"Dispatch → Worker C",v:"Worker C scans market news — running in parallel with A and B."},
        {node:"wA",done:["wA"],cls:"ret",k:"Worker A → returns",v:"Distilled: \"Acme undercuts us ~12% on the base tier; premium is comparable.\""},
        {node:"wB",done:["wB"],cls:"ret",k:"Worker B → returns",v:"Distilled: \"They lead on integrations, lag on reporting.\""},
        {node:"wC",done:["wC"],cls:"ret",k:"Worker C → returns",v:"Distilled: \"Launch covered by 3 trade outlets; sentiment mixed on price.\""},
        {node:"lead",done:["lead","wA","wB","wC"],cls:"final",k:"Lead · synthesize",v:"Combine three short summaries — not thirty documents — into one brief. Done."},
      ];
      host.innerHTML='<div class="instrument"><div class="ihead"><span class="t">orchestrator_run · worked example</span></div><div class="ibody"><div class="loop-body">'
        +'<svg class="loop-svg" viewBox="0 0 200 170" role="img" aria-label="Orchestrator dispatching three workers">'
        +'<line class="edge" id="e-wA" x1="100" y1="42" x2="40" y2="120"></line>'
        +'<line class="edge" id="e-wB" x1="100" y1="46" x2="100" y2="118"></line>'
        +'<line class="edge" id="e-wC" x1="100" y1="42" x2="160" y2="120"></line>'
        +'<g class="node" id="n-lead" transform="translate(100,32)"><circle class="ring" r="24"></circle><text text-anchor="middle" dy="3">LEAD</text></g>'
        +'<g class="node" id="n-wA" transform="translate(40,132)"><circle class="ring" r="19"></circle><text text-anchor="middle" dy="3">A</text></g>'
        +'<g class="node" id="n-wB" transform="translate(100,132)"><circle class="ring" r="19"></circle><text text-anchor="middle" dy="3">B</text></g>'
        +'<g class="node" id="n-wC" transform="translate(160,132)"><circle class="ring" r="19"></circle><text text-anchor="middle" dy="3">C</text></g>'
        +'</svg><div class="loop-log" id="orch-log"></div></div></div>'
        +'<div class="loop-controls"><button class="btn primary" id="orch-next">Step →</button><button class="btn" id="orch-reset">↺ Reset</button><span class="cnt" id="orch-cnt">step 0 / '+steps.length+'</span></div></div>';
      var log=host.querySelector("#orch-log"),nb=host.querySelector("#orch-next"),rb=host.querySelector("#orch-reset"),cnt=host.querySelector("#orch-cnt"),shown=0;
      function render(){
        log.innerHTML="";
        var doneSet={};for(var i=0;i<shown;i++){(steps[i].done||[]).forEach(function(n){doneSet[n]=true;});}
        var active=shown>0?steps[shown-1].node:null;
        ["lead","wA","wB","wC"].forEach(function(n){
          var el=host.querySelector("#n-"+n);el.classList.remove("active","done");
          if(doneSet[n])el.classList.add("done");else if(n===active)el.classList.add("active");
        });
        ["wA","wB","wC"].forEach(function(n){var e=host.querySelector("#e-"+n);if(e){e.classList.toggle("hot",n===active);}});
        for(var j=0;j<shown;j++){var s=steps[j];var d=document.createElement("div");d.className="loop-step shown "+s.cls;d.innerHTML='<div class="lk">'+s.k+'</div><div class="lv">'+s.v+'</div>';log.appendChild(d);}
        log.scrollTop=log.scrollHeight;
        cnt.textContent="step "+shown+" / "+steps.length;nb.disabled=shown>=steps.length;nb.textContent=shown>=steps.length?"✓ Synthesized":"Step →";
      }
      nb.addEventListener("click",function(){if(shown<steps.length){shown++;render();}});
      rb.addEventListener("click",function(){shown=0;render();});
      render();
    }

  function buildTopology(host){
      var svgOrch='<svg viewBox="0 0 160 130"><line class="edge" x1="80" y1="30" x2="30" y2="95"></line><line class="edge" x1="80" y1="30" x2="80" y2="92"></line><line class="edge" x1="80" y1="30" x2="130" y2="95"></line><g class="node active"><circle class="ring" cx="80" cy="24" r="18"></circle><text x="80" y="27" text-anchor="middle">LEAD</text></g><g class="node"><circle class="ring" cx="30" cy="104" r="15"></circle><text x="30" y="107" text-anchor="middle">W</text></g><g class="node"><circle class="ring" cx="80" cy="104" r="15"></circle><text x="80" y="107" text-anchor="middle">W</text></g><g class="node"><circle class="ring" cx="130" cy="104" r="15"></circle><text x="130" y="107" text-anchor="middle">W</text></g></svg>';
      var svgPipe='<svg viewBox="0 0 160 130"><line class="edge" x1="34" y1="65" x2="62" y2="65"></line><line class="edge" x1="94" y1="65" x2="122" y2="65"></line><g class="node"><circle class="ring" cx="24" cy="65" r="16"></circle><text x="24" y="68" text-anchor="middle">A</text></g><g class="node active"><circle class="ring" cx="80" cy="65" r="16"></circle><text x="80" y="68" text-anchor="middle">B</text></g><g class="node"><circle class="ring" cx="136" cy="65" r="16"></circle><text x="136" y="68" text-anchor="middle">C</text></g></svg>';
      var svgPar='<svg viewBox="0 0 160 130"><line class="edge" x1="24" y1="65" x2="60" y2="30"></line><line class="edge" x1="24" y1="65" x2="60" y2="65"></line><line class="edge" x1="24" y1="65" x2="60" y2="100"></line><line class="edge" x1="100" y1="30" x2="136" y2="65"></line><line class="edge" x1="100" y1="65" x2="136" y2="65"></line><line class="edge" x1="100" y1="100" x2="136" y2="65"></line><g class="node"><circle class="ring" cx="20" cy="65" r="14"></circle><text x="20" y="68" text-anchor="middle">IN</text></g><g class="node active"><circle class="ring" cx="80" cy="30" r="13"></circle><text x="80" y="33" text-anchor="middle">W</text></g><g class="node active"><circle class="ring" cx="80" cy="65" r="13"></circle><text x="80" y="68" text-anchor="middle">W</text></g><g class="node active"><circle class="ring" cx="80" cy="100" r="13"></circle><text x="80" y="103" text-anchor="middle">W</text></g><g class="node"><circle class="ring" cx="140" cy="65" r="14"></circle><text x="140" y="68" text-anchor="middle">Σ</text></g></svg>';
      var svgNet='<svg viewBox="0 0 160 130"><line class="edge" x1="45" y1="35" x2="115" y2="35"></line><line class="edge" x1="45" y1="35" x2="45" y2="95"></line><line class="edge" x1="115" y1="35" x2="115" y2="95"></line><line class="edge" x1="45" y1="95" x2="115" y2="95"></line><line class="edge" x1="45" y1="35" x2="115" y2="95"></line><line class="edge" x1="115" y1="35" x2="45" y2="95"></line><g class="node"><circle class="ring" cx="45" cy="35" r="15"></circle><text x="45" y="38" text-anchor="middle">A</text></g><g class="node"><circle class="ring" cx="115" cy="35" r="15"></circle><text x="115" y="38" text-anchor="middle">B</text></g><g class="node"><circle class="ring" cx="45" cy="95" r="15"></circle><text x="45" y="98" text-anchor="middle">C</text></g><g class="node"><circle class="ring" cx="115" cy="95" r="15"></circle><text x="115" y="98" text-anchor="middle">D</text></g></svg>';
      var topos=[
        {id:"orch",tab:"Orchestrator",svg:svgOrch,h:"Orchestrator–workers",p:"A lead agent plans, delegates sub-tasks to isolated workers, and synthesizes their distilled results.",best:"BEST FOR: dynamic decomposition, research, most tasks",avoid:"WATCH: the lead is a bottleneck & single point of failure"},
        {id:"pipe",tab:"Pipeline",svg:svgPipe,h:"Pipeline (sequential)",p:"Work flows through specialized agents in a fixed order, each transforming the previous output.",best:"BEST FOR: genuinely sequential, staged transformations",avoid:"WATCH: latency is the sum; early errors propagate"},
        {id:"par",tab:"Parallel",svg:svgPar,h:"Parallel / map-reduce",p:"An input is split into independent pieces, processed simultaneously, then merged (Σ).",best:"BEST FOR: independent work; cutting wall-clock time; voting",avoid:"WATCH: you pay for every worker; needs a real merge step"},
        {id:"net",tab:"Network",svg:svgNet,h:"Network (decentralized)",p:"Agents talk peer-to-peer with no single coordinator; any agent can hand off to any other.",best:"BEST FOR: true peer negotiation with no natural boss",avoid:"WATCH: loops, ping-pong, hard to bound — use sparingly"},
      ];
      host.innerHTML='<div class="instrument"><div class="ihead"><span class="t">topology_explorer</span></div><div class="ibody"><div class="topo-tabs" id="topo-tabs"></div><div class="topo-view" id="topo-view"></div></div></div>';
      var tabs=host.querySelector("#topo-tabs"),view=host.querySelector("#topo-view");
      topos.forEach(function(t,i){var b=document.createElement("button");b.className="topo-tab"+(i===0?" active":"");b.textContent=t.tab;b.addEventListener("click",function(){Array.prototype.slice.call(tabs.children).forEach(function(x){x.classList.remove("active");});b.classList.add("active");show(t);});tabs.appendChild(b);});
      function show(t){view.innerHTML=t.svg+'<div class="topo-desc"><h4>'+t.h+'</h4><p>'+t.p+'</p><span class="topo-best">'+t.best+'</span><span class="topo-avoid">'+t.avoid+'</span></div>';}
      show(topos[0]);
    }

  function buildPicker(host){
      var recs={
        pipe:{n:"Pipeline (sequential)",w:"Your steps have a fixed order and each feeds the next. Wire them as staged agents — predictable and inspectable. Don't parallelize what's genuinely sequential."},
        orch:{n:"Orchestrator–workers",w:"A lead needs to decide the sub-tasks at runtime and weave the results together. Delegate to isolated workers and synthesize — the most broadly useful topology."},
        par:{n:"Parallel / map-reduce",w:"The split is fixed and the merge is mechanical — no runtime planning needed. Fan out for speed, then aggregate. Remember you pay for every worker."},
        net:{n:"Network (decentralized)",w:"There's genuinely no natural coordinator and agents must negotiate peer-to-peer. Powerful but the hardest to control — bound it hard, and double-check an orchestrator wouldn't do."},
      };
      var q=1;
      host.innerHTML='<div class="instrument picker"><div class="ihead"><span class="t">topology_selector</span></div><div class="ibody"><div id="pk-q"><div class="pq" id="pk-text"></div><div class="pq-sub" id="pk-sub"></div><div class="pick-opts" id="pk-opts"></div></div><div class="pick-result" id="pk-res"><div class="rt">Recommended starting topology</div><div class="rn" id="pk-name"></div><p id="pk-why"></p><button class="btn pick-reset" id="pk-reset">↺ Start over</button></div></div></div>';
      var res=host.querySelector("#pk-res");
      function opts(list,cb){var o=host.querySelector("#pk-opts");o.innerHTML="";list.forEach(function(it){var b=document.createElement("button");b.className="pick-opt";b.textContent=it.t;b.addEventListener("click",function(){cb(it.v);});o.appendChild(b);});}
      function show(r){host.querySelector("#pk-name").textContent=r.n;host.querySelector("#pk-why").textContent=r.w;res.classList.add("show");}
      function render(){
        res.classList.remove("show");
        if(q===1){host.querySelector("#pk-text").textContent="Must the steps happen in a fixed order, each feeding the next?";host.querySelector("#pk-sub").textContent="question 1 of 2";
          opts([{t:"Yes — it's a sequence of stages",v:"seq"},{t:"No — the sub-tasks are independent",v:"ind"}],function(v){if(v==="seq")show(recs.pipe);else{q=2;render();}});
        }else{host.querySelector("#pk-text").textContent="How is the work coordinated?";host.querySelector("#pk-sub").textContent="question 2 of 2";
          opts([{t:"A lead plans the split & synthesizes at runtime",v:"orch"},{t:"A fixed split then a mechanical merge",v:"par"},{t:"Agents negotiate peer-to-peer, no single boss",v:"net"}],function(v){show(recs[v]);});
        }
      }
      host.querySelector("#pk-reset").addEventListener("click",function(){q=1;render();});
      render();
    }

  /* ---------- GO ---------- */
  Agentcraft.init({
    storageKey: 'agentcraft_ma_full_v1',
    sections: SECTIONS,
    quizzes: QUIZZES,
    instruments: {
      orch: buildOrch,
      topology: buildTopology,
      picker: buildPicker,
    },
    verdict: function (pctv) {
      return pv>=87?"<b>Excellent.</b> You can design multi-agent systems — and, just as importantly, know when not to.":pv>=50?"<b>Solid.</b> Revisit the lessons flagged in the answers you missed.":"<b>Worth another pass.</b> Re-run Sections 1–2 (when to go multi-agent + the topologies), then retry.";
    },
  });
})();
