/* The Creator Crew - interactive UI prototype (no build step, no dependencies).
   Instagram is SIMULATED: connect, consent and sync use the sample data in data.js. */
(function () {
  "use strict";
  var D = window.CC;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var fmt = function (n) { return n.toLocaleString("en-US"); };
  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var hourLabel = function (h) { return (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? " AM" : " PM"); };
  var iso = function (d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); };
  var dayIdx = function (d) { return (d.getDay() + 6) % 7; };       // Mon=0
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- state ---------- */
  function defaults() {
    return {
      connected: false, allowPublish: true,
      drafts: [
        { id: 1, text: "3 things I changed in my morning routine (and the one I quit). Save this for tomorrow.", tags: "#morningroutine #creatorlife", tone: "Motivational" },
        { id: 2, text: "Behind the scenes of a 20-second Reel: 41 takes, 1 keeper.", tags: "#behindthescenes #reels", tone: "Funny" },
        { id: 3, text: "My desk setup under 200: what I'd buy again.", tags: "#desksetup #budgetfinds", tone: "Professional" }
      ],
      nextId: 4, schedule: [], goals: { weekly: 4, reach: 120000 }, dismissed: []
    };
  }
  var state = (function () { try { var s = JSON.parse(localStorage.getItem("cc-state")); if (s && s.goals) return s; } catch (e) { } return defaults(); })();
  function save() { try { localStorage.setItem("cc-state", JSON.stringify(state)); } catch (e) { } }

  /* ---------- derived insights ---------- */
  var weekStart = (function () { var d = new Date(D.today); d.setDate(d.getDate() - dayIdx(d)); return d; })();
  function postsThisWeek() { var ws = iso(weekStart); return D.posts.filter(function (p) { return p.date >= ws; }).length; }
  function reach28() { return D.daily.slice(-28).reduce(function (s, x) { return s + x.reach; }, 0); }
  function avgOf(a, k) { return a.reduce(function (s, p) { return s + p[k]; }, 0) / (a.length || 1); }

  function bestCells() {                       // next 7 days x bands, scored by follower activity, future only
    var now = new Date(), out = [];
    for (var off = 0; off < 7; off++) {
      var d = new Date(D.today); d.setDate(d.getDate() + off);
      D.bands.forEach(function (h, b) {
        if (off === 0 && h <= now.getHours()) return;
        out.push({ date: iso(d), off: off, hour: h, score: D.heat[dayIdx(d)][b], dow: dayIdx(d), d: d });
      });
    }
    out.sort(function (a, b) { return b.score - a.score || a.off - b.off; });
    return out;
  }
  function slotText(c) { return (c.off === 0 ? "Today" : c.off === 1 ? "Tomorrow" : DAYS[c.dow]) + " " + hourLabel(c.hour); }

  function comboStats() {                       // which topic x format wins for this creator
    var m = {};
    D.posts.forEach(function (p) { var k = p.topic + "|" + p.format; (m[k] = m[k] || []).push(p); });
    return Object.keys(m).map(function (k) {
      var a = m[k]; return { topic: k.split("|")[0], format: k.split("|")[1], n: a.length, lift: avgOf(a, "vsAvg"), saves: avgOf(a, "saves") / avgOf(a, "reach") };
    }).filter(function (c) { return c.n >= 2; }).sort(function (a, b) { return b.lift - a.lift; });
  }
  function ideas() {
    var list = comboStats().slice(0, 4).map(function (c, i) {
      return {
        id: "c" + i, format: c.format, topic: c.topic, lift: c.lift,
        title: "A " + c.format.toLowerCase() + " on " + c.topic.toLowerCase(),
        why: c.n + " of your " + c.format.toLowerCase() + "s on this topic earned " + c.lift.toFixed(1) + "× your average engagement."
      };
    });
    var lastCar = D.posts.filter(function (p) { return p.format === "Carousel"; })[0];
    if (lastCar) {
      var gap = Math.round((D.today - new Date(lastCar.date)) / 864e5);
      if (gap >= 5) list.push({ id: "g1", format: "Carousel", topic: "Budget finds", lift: 0, title: "Bring back a carousel this week", why: "Your last carousel was " + gap + " days ago. Carousels get you the most saves per view." });
    }
    return list.filter(function (i) { return state.dismissed.indexOf(i.id) < 0; });
  }

  /* ---------- toast / dialog ---------- */
  var toastTimer;
  function toast(msg, undo) {
    var h = $("#toast-host"); clearTimeout(toastTimer);
    h.innerHTML = '<div class="toast" role="status"><span>' + esc(msg) + '</span>' + (undo ? '<button id="undo">Undo</button>' : "") + "</div>";
    if (undo) $("#undo").onclick = function () { undo(); h.innerHTML = ""; };
    toastTimer = setTimeout(function () { h.innerHTML = ""; }, 5000);
  }
  var dlg = $("#dlg");
  function openDlg(html, bind) { dlg.innerHTML = html; if (!dlg.open) dlg.showModal(); if (bind) bind(dlg); }
  function closeDlg() { if (dlg.open) dlg.close(); }
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDlg(); });

  /* ---------- routing ---------- */
  var NAV = [["today", "Today"], ["ideas", "Ideas"], ["create", "Create"], ["calendar", "Calendar"], ["vault", "Draft vault"], ["results", "Results"], ["retention", "Retention check"]];
  var createState = { prompt: "", tone: "Funny", variants: null, sel: -1, text: "", tags: "", draftId: null, err: "" };

  function route() { return (location.hash.replace(/^#\/?/, "") || "today").split("?")[0]; }
  function go(r) { location.hash = "#/" + r; }
  window.addEventListener("hashchange", render);

  function render() {
    var app = $("#app");
    if (!state.connected) { app.innerHTML = connectView(); bindConnect(); document.title = "Connect Instagram - The Creator Crew"; return; }
    var r = route(); if (!NAV.some(function (n) { return n[0] === r; })) r = "today";
    var links = function (cls) { return NAV.map(function (n) { return '<a href="#/' + n[0] + '"' + (n[0] === r ? ' aria-current="page"' : "") + ">" + n[1] + "</a>"; }).join(""); };
    var acct = '<span class="rec" aria-hidden="true"></span><b>@' + D.handle + '</b><div class="muted small">Synced just now</div><div class="muted small">Demo: sample data</div>';
    app.innerHTML =
      '<div class="shell"><aside class="rail"><div class="brand">THE CREATOR<br>CREW<small>Content assistant</small></div>' +
      '<nav class="nav" aria-label="Main">' + links() + "</nav>" +
      '<div class="acct">' + acct + '<div style="margin-top:10px"><button class="btn ghost small" id="disc">Disconnect</button></div></div></aside>' +
      '<main id="view" tabindex="-1"><div class="mobile-acct"><span>' + acct + '</span><button class="btn ghost small" id="disc2">Disconnect</button></div><div id="page"></div></main></div>' +
      '<nav class="tabbar" aria-label="Main">' + links() + "</nav>";
    var V = { today: today, ideas: ideasPage, create: create, calendar: calendar, vault: vault, results: results, retention: retention }[r];
    var name = NAV.filter(function (n) { return n[0] === r; })[0][1];
    document.title = name + " - The Creator Crew";
    V($("#page"));
    $("#disc").onclick = $("#disc2").onclick = disconnectDlg;
    window.scrollTo(0, 0);
  }

  /* ---------- connect flow ---------- */
  function slateRows(s) {
    var row = function (k, v, done) { return '<div class="srow"><dt>' + k + '</dt><dd class="' + (done ? "" : "pending") + '">' + v + "</dd></div>"; };
    return row("PRODUCTION", "The Creator Crew", true) + row("ACCOUNT", s.account || "Waiting", !!s.account) + row("POSTS READ", s.posts != null ? fmt(s.posts) : "Waiting", s.posts != null) +
      row("INSIGHTS", s.insights || "Waiting", !!s.insights) + row("YOUR STYLE", s.style || "Waiting", !!s.style) + row("TAKE", s.take || "Ready", true);
  }
  function connectView() {
    return '<div class="connect"><div><div class="slate" id="slate"><div class="arm"></div><dl style="margin:0" id="slaterows">' + slateRows({}) + "</dl></div></div>" +
      '<div><h1>See what works. Post what\'s next.</h1><p>Connect your Instagram and The Creator Crew reads how your posts perform, learns your voice, and tells you what to post and when.</p>' +
      '<ul><li><b>We read:</b> your profile, posts, and insights like reach, saves and shares.</li><li><b>We can post for you:</b> only the drafts you schedule, and only if you allow it.</li><li><b>We never:</b> see your password, message your followers or post without your approval.</li></ul>' +
      '<div class="row"><button class="btn" id="go">Connect Instagram</button><button class="btn ghost" id="personal">I have a personal account</button></div>' +
      '<p class="muted small" style="margin-top:14px">Needs a Business or Creator account. Switching is free and keeps your followers.</p><div id="msg" role="status"></div></div></div>';
  }
  function bindConnect() {
    $("#personal").onclick = function () {
      openDlg('<h2>Switch to a Creator account</h2><ol><li>Open Instagram, then Settings and privacy.</li><li>Tap Account type and tools.</li><li>Choose Switch to professional account, then Creator.</li><li>Come back here and connect.</li></ol><p class="muted small">Instagram only shares insights for professional accounts.</p><div class="row" style="margin-top:16px"><button class="btn" id="x">Got it</button></div>', function () { $("#x").onclick = closeDlg; });
    };
    $("#go").onclick = function () {
      openDlg('<div class="fakehead">instagram.com — demo of the permission screen</div><h2>Allow The Creator Crew to access @' + D.handle + '?</h2>' +
        '<div class="perm"><input type="checkbox" checked disabled id="p1"><label for="p1" style="margin:0"><b>Read your profile and posts</b><br><span class="muted small">Required. Captions, formats, dates.</span></label></div>' +
        '<div class="perm"><input type="checkbox" checked disabled id="p2"><label for="p2" style="margin:0"><b>Read your insights</b><br><span class="muted small">Required. Reach, saves, shares, when followers are active.</span></label></div>' +
        '<div class="perm"><input type="checkbox" checked id="p3"><label for="p3" style="margin:0"><b>Publish posts you schedule</b><br><span class="muted small">Optional. Without it we remind you to post instead.</span></label></div>' +
        '<div class="row" style="margin-top:18px"><button class="btn" id="allow">Allow</button><button class="btn ghost" id="deny">Cancel</button></div>',
        function () {
          $("#deny").onclick = function () { closeDlg(); $("#msg").innerHTML = '<p class="err">Instagram access was not allowed. Connect again to continue.</p>'; };
          $("#allow").onclick = function () { state.allowPublish = $("#p3").checked; closeDlg(); sync(); };
        });
    };
  }
  function sync() {
    $("#go").disabled = true; $("#personal").disabled = true; $("#msg").innerHTML = '<p role="status">Reading your account…</p>';
    var s = {}, rows = $("#slaterows"), slate = $("#slate");
    var paint = function () { rows.innerHTML = slateRows(s); };
    var steps = [
      function () { s.account = "@" + D.handle; s.take = "1"; },
      function () { s.posts = 0; },
      function () { s.posts = Math.round(D.posts.length * 3.7); },
      function () { s.insights = "Reach, saves, shares"; },
      function () { s.style = "Learned from " + D.posts.length + " captions"; s.take = "1 · Done"; },
      function () { slate.classList.add("clap"); $("#msg").innerHTML = '<p role="status"><b>Connected.</b> Opening your dashboard…</p>'; },
      function () { state.connected = true; save(); go("today"); render(); }
    ];
    var i = 0;
    (function next() { steps[i](); paint(); i++; if (i < steps.length) setTimeout(next, reduceMotion ? 30 : 650); })();
  }
  function disconnectDlg() {
    openDlg('<h2>Disconnect Instagram?</h2><p>We will delete your synced posts, insights and learned style from The Creator Crew. Your Instagram account is not changed, and your drafts stay.</p><div class="row" style="margin-top:18px"><button class="btn danger" id="yes">Disconnect</button><button class="btn ghost" id="no">Keep connected</button></div>', function () {
      $("#no").onclick = closeDlg;
      $("#yes").onclick = function () { state.connected = false; save(); closeDlg(); go("connect"); render(); };
    });
  }

  /* ---------- Today ---------- */
  function lineChart(series, w, h, label) {
    var pad = { l: 38, r: 8, t: 10, b: 22 }, max = Math.max.apply(null, series.map(function (s) { return s.reach; })) * 1.1;
    var x = function (i) { return pad.l + (w - pad.l - pad.r) * i / (series.length - 1); };
    var y = function (v) { return pad.t + (h - pad.t - pad.b) * (1 - v / max); };
    var pts = series.map(function (s, i) { return x(i).toFixed(1) + "," + y(s.reach).toFixed(1); });
    var grid = [0, .5, 1].map(function (f) { var v = max * f; return '<line x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--line)"/><text x="' + (pad.l - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="11" fill="var(--steel)">' + (v >= 1000 ? Math.round(v / 1000) + "k" : Math.round(v)) + "</text>"; }).join("");
    return '<div class="rel" id="chartwrap"><svg class="chart" id="line" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(label) + '">' + grid +
      '<polyline fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round" points="' + pts.join(" ") + '"/>' +
      '<line id="cur" y1="' + pad.t + '" y2="' + (h - pad.b) + '" stroke="var(--ink)" stroke-dasharray="3 3" style="display:none"/><circle id="dot" r="5" fill="var(--tape)" stroke="var(--ink)" stroke-width="2" style="display:none"/>' +
      '<text x="' + pad.l + '" y="' + (h - 5) + '" font-size="11" fill="var(--steel)">' + fmtDate(series[0].date) + '</text><text x="' + (w - pad.r) + '" y="' + (h - 5) + '" text-anchor="end" font-size="11" fill="var(--steel)">' + fmtDate(series[series.length - 1].date) + "</text></svg><div class='tip' id='tip' style='display:none'></div></div>";
  }
  function fmtDate(s) { var d = new Date(s + "T00:00:00"); return d.getDate() + " " + MONTHS[d.getMonth()]; }
  function bindLine(series, w, h) {
    var svg = $("#line"), tip = $("#tip"), pad = { l: 38, r: 8, t: 10, b: 22 }, max = Math.max.apply(null, series.map(function (s) { return s.reach; })) * 1.1;
    function at(ev) {
      var b = svg.getBoundingClientRect(), px = (ev.clientX - b.left) / b.width * w;
      var i = Math.max(0, Math.min(series.length - 1, Math.round((px - pad.l) / (w - pad.l - pad.r) * (series.length - 1))));
      var cx = pad.l + (w - pad.l - pad.r) * i / (series.length - 1), cy = pad.t + (h - pad.t - pad.b) * (1 - series[i].reach / max);
      $("#cur").setAttribute("x1", cx); $("#cur").setAttribute("x2", cx); $("#cur").style.display = "";
      $("#dot").setAttribute("cx", cx); $("#dot").setAttribute("cy", cy); $("#dot").style.display = "";
      tip.style.display = ""; tip.style.left = (cx / w * b.width) + "px"; tip.style.top = (cy / h * b.height) + "px";
      tip.textContent = fmtDate(series[i].date) + ": " + fmt(series[i].reach) + " reached";
    }
    svg.addEventListener("pointermove", at); svg.addEventListener("pointerdown", at);
    svg.addEventListener("pointerleave", function () { tip.style.display = "none"; $("#cur").style.display = "none"; $("#dot").style.display = "none"; });
  }
  function heatGrid() {
    var h = '<div class="heat" role="img" aria-label="When your followers are most active, by weekday and time"><div></div>' + D.bands.map(function (b) { return '<div class="colh">' + hourLabel(b).replace(" ", "") + "</div>"; }).join("");
    var top = bestCells().slice(0, 3).map(function (c) { return c.dow + "-" + c.hour; });
    DAYS.forEach(function (d, i) {
      h += '<div class="lab">' + d + "</div>";
      D.heat[i].forEach(function (v, b) {
        var best = top.indexOf(i + "-" + D.bands[b]) >= 0;
        h += '<div class="h" title="' + d + " " + hourLabel(D.bands[b]) + ": " + v + '% as active as your peak" style="opacity:' + (0.12 + v / 100 * .88).toFixed(2) + (best ? ";background:var(--tape);opacity:1;outline:2px solid var(--ink)" : "") + '"></div>';
      });
    });
    return h + "</div>";
  }
  var range = 28;
  function today(el) {
    var hr = new Date().getHours(), hi = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
    var wk = postsThisWeek(), g = state.goals, best = bestCells()[0], idea = ideas()[0], r28 = reach28();
    var series = D.daily.slice(-range);
    el.innerHTML =
      '<div class="page-head"><div><h1>' + hi + ", " + D.name + '.</h1><p class="muted">You posted ' + wk + " of " + g.weekly + " this week. Your reach over the last 28 days is " + fmt(r28) + ".</p></div></div>" +
      '<div class="grid g2"><div class="next stack"><h2>Post next: ' + slotText(best) + '</h2>' +
      '<p class="muted">' + (best.score >= 85 ? "Your followers are most active then." : "One of your three most active windows this week.") + " Posting here beats a random slot by about " + Math.round((best.score / avgOfHeat() - 1) * 100) + "%.</p>" +
      (idea ? '<p><span class="hl">' + esc(idea.title) + "</span></p><p class=\"muted small\">" + esc(idea.why) + "</p>" : "") +
      '<div class="row"><button class="btn" id="wr">Write the caption</button><button class="btn ghost" id="mi">More ideas</button></div></div>' +
      '<div class="block"><h3>Goals</h3><div>Posts this week <b>' + wk + " / " + g.weekly + '</b><div class="bar"><i style="width:' + Math.min(100, wk / g.weekly * 100) + '%"></i></div></div>' +
      '<div style="margin-top:16px">Reach in 28 days <b>' + fmt(r28) + " / " + fmt(g.reach) + '</b><div class="bar"><i style="width:' + Math.min(100, r28 / g.reach * 100) + '%"></i></div></div>' +
      '<button class="btn ghost small" id="eg" style="margin-top:14px">Change goals</button></div></div>' +
      '<div class="grid g2" style="margin-top:34px"><div class="block"><div class="row spread"><h2>Reach per day</h2><div class="row"><button class="chip" data-r="28" aria-pressed="' + (range === 28) + '">28 days</button><button class="chip" data-r="56" aria-pressed="' + (range === 56) + '">56 days</button></div></div>' + lineChart(series, 640, 240, "Daily reach over the last " + range + " days") + '</div>' +
      '<div class="block"><h2>When your followers are active</h2><p class="muted small" style="margin-bottom:10px">Highlighted: your best three windows from now.</p>' + heatGrid() + "</div></div>" +
      '<div class="block" style="margin-top:34px"><div class="row spread"><h2>Your top posts</h2><a href="#/results">See all results</a></div><div class="grid g3" style="margin-top:8px">' +
      D.posts.slice().sort(function (a, b) { return b.vsAvg - a.vsAvg; }).slice(0, 3).map(function (p) { return '<div class="sheet"><span class="chip">' + p.format + '</span><h3 style="margin:10px 0 6px">' + esc(p.caption) + '</h3><div class="num">' + p.vsAvg.toFixed(1) + '×</div><div class="muted small">your average engagement · ' + fmt(p.reach) + " reached</div></div>"; }).join("") + "</div></div>";
    bindLine(series, 640, 240);
    $("#wr").onclick = function () { if (idea) { createState = { prompt: idea.title, tone: "Motivational", variants: null, sel: -1, text: "", tags: "", draftId: null, err: "" }; } go("create"); };
    $("#mi").onclick = function () { go("ideas"); };
    $("#eg").onclick = goalsDlg;
    $$("[data-r]").forEach(function (b) { b.onclick = function () { range = +b.dataset.r; render(); }; });
  }
  function avgOfHeat() { var a = [].concat.apply([], D.heat); return a.reduce(function (s, v) { return s + v; }, 0) / a.length; }
  function goalsDlg() {
    openDlg('<h2>Your goals</h2><label for="gw">Posts per week</label><input id="gw" type="number" min="1" max="21" value="' + state.goals.weekly + '"><label for="gr">Reach in 28 days</label><input id="gr" type="number" min="1000" step="1000" value="' + state.goals.reach + '"><div id="ge"></div><div class="row" style="margin-top:18px"><button class="btn" id="gs">Save goals</button><button class="btn ghost" id="gc">Cancel</button></div>', function () {
      $("#gc").onclick = closeDlg;
      $("#gs").onclick = function () {
        var w = +$("#gw").value, r = +$("#gr").value;
        if (!(w >= 1 && w <= 21)) { $("#ge").innerHTML = '<p class="err">Posts per week must be between 1 and 21.</p>'; return; }
        if (!(r >= 1000)) { $("#ge").innerHTML = '<p class="err">Reach goal must be at least 1,000.</p>'; return; }
        state.goals = { weekly: w, reach: r }; save(); closeDlg(); render(); toast("Goals saved");
      };
    });
  }

  /* ---------- Ideas ---------- */
  var ideaFilter = "All";
  function ideasPage(el) {
    var all = ideas(), list = all.filter(function (i) { return ideaFilter === "All" || i.format === ideaFilter; });
    el.innerHTML = '<div class="page-head"><div><h1>Ideas from your results</h1><p class="muted">Built from what already worked on your account, ranked by how much more engagement it earned than your average.</p></div></div>' +
      '<div class="row" role="group" aria-label="Filter by format" style="margin-bottom:10px">' + ["All", "Reel", "Carousel", "Photo"].map(function (f) { return '<button class="chip" data-f="' + f + '" aria-pressed="' + (ideaFilter === f) + '">' + (f === "All" ? "All formats" : f + "s") + "</button>"; }).join("") + "</div>" +
      (list.length ? list.map(function (i) { return '<div class="item"><div><span class="chip">' + i.format + '</span> <h3 style="display:inline;margin-left:6px">' + esc(i.title) + '</h3><p class="muted" style="margin-top:6px">' + esc(i.why) + '</p></div><div class="row"><button class="btn small" data-use="' + i.id + '">Write it</button><button class="btn ghost small" data-no="' + i.id + '">Not for me</button></div></div>'; }).join("") :
        '<div class="empty">No ideas for this format yet. Try All formats, or post a few more and check back.</div>');
    $$("[data-f]").forEach(function (b) { b.onclick = function () { ideaFilter = b.dataset.f; render(); }; });
    $$("[data-use]").forEach(function (b) { b.onclick = function () { var i = all.filter(function (x) { return x.id === b.dataset.use; })[0]; createState = { prompt: i.title, tone: "Motivational", variants: null, sel: -1, text: "", tags: "", draftId: null, err: "" }; go("create"); }; });
    $$("[data-no]").forEach(function (b) { b.onclick = function () { var id = b.dataset.no; state.dismissed.push(id); save(); render(); toast("Idea removed", function () { state.dismissed = state.dismissed.filter(function (x) { return x !== id; }); save(); render(); }); }; });
  }

  /* ---------- Create ---------- */
  var TONES = ["Funny", "Professional", "Aesthetic", "Motivational"];
  var TPL = {
    Funny: ["Me pretending {p} is totally under control", "{p}? Plot twist: nobody asked, but here we are", "Update: {p} is going great (it is not)"],
    Professional: ["Key takeaways from {p}", "How {p} drives measurable results", "What I'd do differently with {p}"],
    Aesthetic: ["soft light, slow days: {p}", "{p}, but make it dreamy", "quiet moments. {p}"],
    Motivational: ["{p}: start before you feel ready", "Every big win begins with {p}", "{p}. Show up again tomorrow."]
  };
  var avgLen = Math.round(avgOf(D.posts.slice().sort(function (a, b) { return b.vsAvg - a.vsAvg; }).slice(0, 10).map(function (p) { return { l: p.caption.length + 55 }; }), "l"));
  function fit(t) { return Math.max(35, Math.min(98, Math.round(100 - Math.abs(t.length - avgLen) / avgLen * 70))); }
  function tagsFrom(p) { var seen = {}, out = []; (p.toLowerCase().match(/[a-z0-9]+/g) || []).forEach(function (w) { if (w.length > 3 && !seen[w] && ["with", "that", "this", "your"].indexOf(w) < 0) { seen[w] = 1; out.push("#" + w); } }); return out.slice(0, 5).join(" "); }
  function create(el) {
    var c = createState;
    el.innerHTML = '<div class="page-head"><div><h1>Create</h1><p class="muted">Describe the post, pick a tone, and choose the version that sounds most like you.</p></div></div>' +
      '<div class="grid g2"><div><label for="pr">What is the post about?</label><textarea id="pr" maxlength="600" placeholder="Example: my 5 AM morning routine as a creator">' + esc(c.prompt) + "</textarea>" +
      '<div class="muted small"><span id="pc">' + c.prompt.length + "</span> / 500 characters</div>" +
      '<label id="tl">Tone</label><div class="row" role="group" aria-labelledby="tl">' + TONES.map(function (t) { return '<button class="chip" data-t="' + t + '" aria-pressed="' + (c.tone === t) + '">' + t + "</button>"; }).join("") + "</div>" +
      '<div id="ce">' + (c.err ? '<p class="err" role="alert">' + c.err + "</p>" : "") + '</div><button class="btn" id="gen" style="margin-top:16px">Generate captions</button></div>' +
      '<div id="out">' + (c.variants ? outHtml(c) : '<div class="empty">Your three caption options will appear here, ranked by how well they match your voice.</div>') + "</div></div>";
    var pr = $("#pr");
    pr.oninput = function () { c.prompt = pr.value; $("#pc").textContent = pr.value.trim().length; $("#pc").style.color = pr.value.trim().length > 500 ? "var(--rec)" : ""; };
    $$("[data-t]").forEach(function (b) { b.onclick = function () { c.tone = b.dataset.t; $$("[data-t]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); }; });
    $("#gen").onclick = function () {
      var p = pr.value.trim();
      if (!p) { c.err = "Describe the post first. Even a few words work."; c.variants = null; render(); $("#pr").focus(); return; }
      if (p.length > 500) { c.err = "That's " + (p.length - 500) + " characters over the 500 limit. Shorten the description."; render(); return; }
      c.err = ""; c.prompt = p; var tg = tagsFrom(p);
      c.variants = TPL[c.tone].map(function (t, i) { var text = t.replace("{p}", p); return { text: text, tags: tg, fit: fit(text) - i * 3 }; }).sort(function (a, b) { return b.fit - a.fit; });
      c.sel = 0; c.text = c.variants[0].text; c.tags = tg; render();
    };
    bindOut();
  }
  function outHtml(c) {
    return '<h3 style="margin-bottom:10px">Pick a version</h3><div class="stack">' + c.variants.map(function (v, i) { return '<button class="variant" data-v="' + i + '" aria-pressed="' + (c.sel === i) + '"><div>' + esc(v.text) + '</div><div class="muted small" style="margin-top:6px">Matches your voice: <b>' + v.fit + "%</b></div></button>"; }).join("") + "</div>" +
      '<label for="ct">Edit before you save</label><textarea id="ct">' + esc(c.text) + '</textarea><div class="muted small"><span id="cc">' + c.text.length + '</span> / 2,200 characters</div>' +
      '<label for="tg">Hashtags</label><input type="text" id="tg" value="' + esc(c.tags) + '"><div class="muted small"><span id="tc2">' + tagCount(c.tags) + '</span> / 30 hashtags</div><div id="se"></div>' +
      '<div class="row" style="margin-top:16px"><button class="btn" id="sd">Save draft</button><button class="btn ghost" id="sc">Schedule</button></div>';
  }
  function tagCount(s) { return (s.match(/#\w+/g) || []).length; }
  function bindOut() {
    var c = createState; if (!c.variants) return;
    $$("[data-v]").forEach(function (b) { b.onclick = function () { c.sel = +b.dataset.v; c.text = c.variants[c.sel].text; $("#ct").value = c.text; $("#cc").textContent = c.text.length; $$("[data-v]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); }; });
    $("#ct").oninput = function () { c.text = $("#ct").value; $("#cc").textContent = c.text.length; };
    $("#tg").oninput = function () { c.tags = $("#tg").value; $("#tc2").textContent = tagCount(c.tags); };
    function valid() {
      if (!c.text.trim()) { $("#se").innerHTML = '<p class="err" role="alert">The caption is empty. Pick a version or write one.</p>'; return false; }
      if ((c.text + " " + c.tags).length > 2200) { $("#se").innerHTML = '<p class="err" role="alert">Instagram captions are limited to 2,200 characters. Shorten yours.</p>'; return false; }
      if (tagCount(c.tags) > 30) { $("#se").innerHTML = '<p class="err" role="alert">Instagram allows up to 30 hashtags. Remove ' + (tagCount(c.tags) - 30) + ".</p>"; return false; }
      $("#se").innerHTML = ""; return true;
    }
    function persist() {
      if (c.draftId) { var d = state.drafts.filter(function (x) { return x.id === c.draftId; })[0]; if (d) { d.text = c.text.trim(); d.tags = c.tags; d.tone = c.tone; return d; } }
      var nd = { id: state.nextId++, text: c.text.trim(), tags: c.tags, tone: c.tone }; state.drafts.unshift(nd); c.draftId = nd.id; return nd;
    }
    $("#sd").onclick = function () { if (!valid()) return; persist(); save(); toast("Draft saved"); };
    $("#sc").onclick = function () { if (!valid()) return; var d = persist(); save(); scheduleDlg({ draftId: d.id }); };
  }

  /* ---------- scheduling ---------- */
  function scheduleDlg(pre) {
    var cells = bestCells(), top = cells.slice(0, 3).map(function (c) { return c.date + "|" + c.hour; });
    var byTime = cells.slice().sort(function (a, b) { return a.off - b.off || a.hour - b.hour; });
    var taken = state.schedule.map(function (s) { return s.date + "|" + s.hour; });
    if (!state.drafts.length) { openDlg('<h2>No drafts yet</h2><p>Create and save a draft first, then schedule it.</p><div class="row" style="margin-top:16px"><button class="btn" id="mk">Create a draft</button></div>', function () { $("#mk").onclick = function () { closeDlg(); go("create"); }; }); return; }
    var dOpts = state.drafts.map(function (d) { return '<option value="' + d.id + '"' + (pre.draftId === d.id ? " selected" : "") + ">" + esc(d.text.slice(0, 60)) + "</option>"; }).join("");
    var sOpts = byTime.filter(function (c) { return taken.indexOf(c.date + "|" + c.hour) < 0; }).map(function (c) { var key = c.date + "|" + c.hour, rec = top.indexOf(key) >= 0; return '<option value="' + key + '"' + ((pre.date && key === pre.date + "|" + pre.hour) || (!pre.date && key === top[0]) ? " selected" : "") + ">" + slotText(c) + (rec ? " (recommended)" : "") + "</option>"; }).join("");
    openDlg('<h2>Schedule a post</h2><label for="sdr">Draft</label><select id="sdr">' + dOpts + '</select><label for="ssl">Time</label><select id="ssl">' + sOpts + '</select>' +
      '<label style="display:flex;gap:10px;align-items:center;font-weight:500;margin-top:16px"><input type="checkbox" id="sap" ' + (state.allowPublish ? "checked" : "disabled") + ' style="width:18px;height:18px"> ' + (state.allowPublish ? "Publish automatically at that time" : "Auto-publishing is off. We will remind you instead.") + '</label>' +
      '<div class="row" style="margin-top:18px"><button class="btn" id="sok">Schedule post</button><button class="btn ghost" id="scn">Cancel</button></div>', function () {
        $("#scn").onclick = closeDlg;
        $("#sok").onclick = function () {
          var k = $("#ssl").value.split("|"); if (!k[0]) return;
          state.schedule.push({ id: Date.now(), draftId: +$("#sdr").value, date: k[0], hour: +k[1], auto: state.allowPublish && $("#sap").checked });
          save(); closeDlg(); var wasCal = route() === "calendar"; toast("Scheduled for " + fmtDate(k[0]) + ", " + hourLabel(+k[1])); if (wasCal) render(); else go("calendar");
        };
      });
  }
  function calendar(el) {
    var cells = bestCells(), top = cells.slice(0, 3).map(function (c) { return c.date + "|" + c.hour; }), now = new Date(), days = [];
    for (var i = 0; i < 7; i++) { var d = new Date(D.today); d.setDate(d.getDate() + i); days.push(d); }
    var h = '<div class="cal" role="grid"><div></div>' + days.map(function (d) { return '<div class="colh">' + (iso(d) === iso(D.today) ? "Today" : DAYS[dayIdx(d)]) + '<div class="muted small">' + d.getDate() + " " + MONTHS[d.getMonth()] + "</div></div>"; }).join("");
    D.bands.forEach(function (b) {
      h += '<div class="lab">' + hourLabel(b).replace(" ", "") + "</div>";
      days.forEach(function (d, off) {
        var key = iso(d) + "|" + b, s = state.schedule.filter(function (x) { return x.date + "|" + x.hour === key; })[0], past = off === 0 && b <= now.getHours();
        if (s) { var dr = state.drafts.filter(function (x) { return x.id === s.draftId; })[0]; h += '<button class="cell set" data-rm="' + s.id + '" aria-label="Scheduled: remove ' + esc(dr ? dr.text.slice(0, 40) : "post") + '">' + esc(dr ? dr.text.slice(0, 26) : "Post") + "…<br>" + (s.auto ? "Auto" : "Reminder") + "</button>"; }
        else h += '<button class="cell' + (top.indexOf(key) >= 0 ? " best" : "") + (past ? " past" : "") + '" data-k="' + key + '"' + (past ? " disabled" : "") + ">" + (top.indexOf(key) >= 0 ? "Best time" : "") + "</button>";
      });
    });
    el.innerHTML = '<div class="page-head"><div><h1>Calendar</h1><p class="muted">The next seven days. Yellow slots are when your followers are most active. Select any open slot to schedule a draft.</p></div><button class="btn" id="ns">Schedule a post</button></div><div class="tablewrap">' + h + "</div></div>" +
      (state.schedule.length ? "" : '<div class="empty" style="margin-top:20px">Nothing scheduled yet. Pick a yellow slot to start.</div>');
    $("#ns").onclick = function () { scheduleDlg({}); };
    $$("[data-k]").forEach(function (b) { b.onclick = function () { var k = b.dataset.k.split("|"); scheduleDlg({ date: k[0], hour: +k[1] }); }; });
    $$("[data-rm]").forEach(function (b) { b.onclick = function () { openDlg("<h2>Remove from schedule?</h2><p>The draft stays in your vault.</p><div class=\"row\" style=\"margin-top:16px\"><button class=\"btn danger\" id=\"y\">Remove from schedule</button><button class=\"btn ghost\" id=\"n\">Keep it</button></div>", function () { $("#n").onclick = closeDlg; $("#y").onclick = function () { state.schedule = state.schedule.filter(function (x) { return x.id !== +b.dataset.rm; }); save(); closeDlg(); render(); toast("Removed from schedule"); }; }); }; });
  }

  /* ---------- Vault ---------- */
  var vq = "";
  function vault(el) {
    el.innerHTML = '<div class="page-head"><div><h1>Draft vault</h1><p class="muted">Every caption you saved, in one place.</p></div><button class="btn" id="nd">New draft</button></div><label for="vs" class="sr">Search drafts</label><input type="search" id="vs" placeholder="Search your drafts" value="' + esc(vq) + '"><div id="vl"></div>';
    function list() {
      var q = vq.toLowerCase(), l = state.drafts.filter(function (d) { return !q || (d.text + " " + d.tags).toLowerCase().indexOf(q) >= 0; });
      $("#vl").innerHTML = l.length ? l.map(function (d) {
        var sch = state.schedule.filter(function (s) { return s.draftId === d.id; })[0];
        return '<div class="item"><div><p>' + esc(d.text) + '</p><div style="margin-top:6px">' + (d.tags || "").split(/\s+/).filter(Boolean).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + '</div></div><div class="row"><span class="chip">' + (sch ? "Scheduled" : "Draft") + '</span><button class="btn ghost small" data-e="' + d.id + '">Edit</button><button class="btn ghost small" data-s="' + d.id + '">Schedule</button><button class="btn ghost small" data-d="' + d.id + '">Delete</button></div></div>';
      }).join("") : '<div class="empty" style="margin-top:16px">' + (q ? "No drafts match “" + esc(vq) + "”. Clear the search to see all drafts." : "No drafts yet. Create one and it will show up here.") + "</div>";
      $$("[data-e]").forEach(function (b) { b.onclick = function () { var d = state.drafts.filter(function (x) { return x.id === +b.dataset.e; })[0]; createState = { prompt: "", tone: d.tone || "Funny", variants: [{ text: d.text, tags: d.tags, fit: fit(d.text) }], sel: 0, text: d.text, tags: d.tags, draftId: d.id, err: "" }; go("create"); }; });
      $$("[data-s]").forEach(function (b) { b.onclick = function () { scheduleDlg({ draftId: +b.dataset.s }); }; });
      $$("[data-d]").forEach(function (b) { b.onclick = function () { var id = +b.dataset.d, i = state.drafts.findIndex(function (x) { return x.id === id; }), d = state.drafts[i], sch = state.schedule.filter(function (s) { return s.draftId === id; }); state.drafts.splice(i, 1); state.schedule = state.schedule.filter(function (s) { return s.draftId !== id; }); save(); list(); toast("Draft deleted", function () { state.drafts.splice(i, 0, d); state.schedule = state.schedule.concat(sch); save(); list(); }); }; });
    }
    $("#vs").oninput = function () { vq = $("#vs").value; list(); };
    $("#nd").onclick = function () { createState = { prompt: "", tone: "Funny", variants: null, sel: -1, text: "", tags: "", draftId: null, err: "" }; go("create"); };
    list();
  }

  /* ---------- Results ---------- */
  var sortK = "vsAvg", sortD = -1, resF = "All";
  function results(el) {
    var rows = D.posts.filter(function (p) { return resF === "All" || p.format === resF; }).sort(function (a, b) { var x = a[sortK], y = b[sortK]; return (x < y ? -1 : x > y ? 1 : 0) * sortD; });
    var cols = [["date", "Posted"], ["format", "Format"], ["topic", "Topic"], ["reach", "Reach"], ["saves", "Saves"], ["shares", "Shares"], ["vsAvg", "Vs your average"]];
    el.innerHTML = '<div class="page-head"><div><h1>Results</h1><p class="muted">How every post performed. “Vs your average” compares engagement (likes, comments, saves and shares per person reached) with your own typical post.</p></div></div>' +
      '<div class="row" role="group" aria-label="Filter by format" style="margin-bottom:14px">' + ["All", "Reel", "Carousel", "Photo"].map(function (f) { return '<button class="chip" data-f="' + f + '" aria-pressed="' + (resF === f) + '">' + (f === "All" ? "All formats" : f + "s") + "</button>"; }).join("") + '</div><div class="tablewrap"><table><thead><tr>' +
      cols.map(function (c) { return '<th aria-sort="' + (sortK === c[0] ? (sortD > 0 ? "ascending" : "descending") : "none") + '"><button data-s="' + c[0] + '">' + c[1] + (sortK === c[0] ? (sortD > 0 ? " ↑" : " ↓") : "") + "</button></th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (p) { return '<tr tabindex="0" data-p="' + p.id + '"><td>' + fmtDate(p.date) + "</td><td>" + p.format + "</td><td>" + esc(p.topic) + "</td><td>" + fmt(p.reach) + "</td><td>" + fmt(p.saves) + "</td><td>" + fmt(p.shares) + '</td><td class="' + (p.vsAvg >= 1 ? "up" : "down") + '">' + (p.vsAvg >= 1 ? "▲ " : "▼ ") + p.vsAvg.toFixed(1) + "×</td></tr>"; }).join("") + "</tbody></table></div>";
    $$("[data-f]").forEach(function (b) { b.onclick = function () { resF = b.dataset.f; render(); }; });
    $$("[data-s]").forEach(function (b) { b.onclick = function () { if (sortK === b.dataset.s) sortD *= -1; else { sortK = b.dataset.s; sortD = -1; } render(); var nb = $('[data-s="' + sortK + '"]'); if (nb) nb.focus(); }; });
    $$("[data-p]").forEach(function (r) { var open = function () { postDlg(D.posts.filter(function (p) { return p.id === +r.dataset.p; })[0]); }; r.onclick = open; r.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }; });
  }
  function postDlg(p) {
    var avg = function (k) { return avgOf(D.posts, k); };
    var m = [["Reach", "reach"], ["Likes", "likes"], ["Comments", "comments"], ["Saves", "saves"], ["Shares", "shares"]].map(function (x) { var r = p[x[1]] / avg(x[1]); return { n: x[0], v: p[x[1]], r: r }; });
    var best = m.slice().sort(function (a, b) { return b.r - a.r; })[0];
    openDlg('<h2>' + esc(p.caption) + '</h2><p class="muted">' + p.format + " · " + esc(p.topic) + " · " + fmtDate(p.date) + ", " + hourLabel(p.hour) + '</p><table style="margin-top:12px"><tbody>' +
      m.map(function (x) { return "<tr><td>" + x.n + "</td><td><b>" + fmt(x.v) + '</b></td><td class="' + (x.r >= 1 ? "up" : "down") + '">' + (x.r >= 1 ? "▲" : "▼") + " " + x.r.toFixed(1) + "× your average</td></tr>"; }).join("") + "</tbody></table>" +
      '<p style="margin-top:14px"><b>What stood out:</b> ' + best.n.toLowerCase() + " were " + best.r.toFixed(1) + "× your average. " + (p.vsAvg >= 1 ? "This is a pattern worth repeating." : "Try a different hook or posting window next time.") + '</p><div class="row" style="margin-top:18px"><button class="btn" id="mm">Make more like this</button><button class="btn ghost" id="cl">Close</button></div>', function () {
        $("#cl").onclick = closeDlg;
        $("#mm").onclick = function () { closeDlg(); ideaFilter = p.format; go("ideas"); };
      });
  }

  /* ---------- Retention check ---------- */
  var retId = null;
  function retention(el) {
    var reels = D.posts.filter(function (p) { return p.format === "Reel"; }); if (!retId) retId = reels[0].id;
    var p = reels.filter(function (x) { return x.id === retId; })[0] || reels[0], c = p.curve, W = 640, H = 260, pad = { l: 40, r: 10, t: 14, b: 28 };
    var worst = 1, wd = 0; for (var i = 1; i < c.length; i++) if (c[i - 1] - c[i] > wd) { wd = c[i - 1] - c[i]; worst = i; }
    var ts = Math.round(p.duration * worst / 10), x = function (i) { return pad.l + (W - pad.l - pad.r) * i / 10; }, y = function (v) { return pad.t + (H - pad.t - pad.b) * (1 - v / 100); };
    var tc = function (s) { return "0:" + String(s).padStart(2, "0"); };
    var tips = ["Cut or tighten the section just before " + tc(ts) + ". That is where " + wd + " points of viewers left.", "Add a visual change (text on screen or a new angle) around " + tc(Math.max(0, ts - 2)) + "."];
    if (wd >= 25) tips.push("Move your payoff earlier. A drop this sharp usually means viewers lost the promise from your hook.");
    var area = "M" + x(0) + "," + y(c[0]) + c.slice(1).map(function (v, i) { return " L" + x(i + 1) + "," + y(v); }).join("") + " L" + x(10) + "," + y(0) + " L" + x(0) + "," + y(0) + " Z";
    el.innerHTML = '<div class="page-head"><div><h1>Retention check</h1><p class="muted">Pick a Reel to see where viewers stop watching, and what to change in your next one.</p></div></div>' +
      '<label for="rs">Reel</label><select id="rs" style="max-width:420px">' + reels.map(function (r) { return '<option value="' + r.id + '"' + (r.id === p.id ? " selected" : "") + ">" + fmtDate(r.date) + ": " + esc(r.caption) + " (" + r.duration + "s)</option>"; }).join("") + "</select>" +
      '<div class="grid g2" style="margin-top:24px"><div class="rel"><svg class="chart" id="rsv" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Audience retention across the Reel. Biggest drop at ' + tc(ts) + '">' +
      [0, 50, 100].map(function (v) { return '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--line)"/><text x="' + (pad.l - 6) + '" y="' + (y(v) + 4) + '" font-size="11" text-anchor="end" fill="var(--steel)">' + v + "%</text>"; }).join("") +
      '<path d="' + area + '" fill="var(--tape)" opacity=".55"/><polyline fill="none" stroke="var(--ink)" stroke-width="2.5" points="' + c.map(function (v, i) { return x(i) + "," + y(v); }).join(" ") + '"/>' +
      '<line x1="' + x(worst) + '" x2="' + x(worst) + '" y1="' + pad.t + '" y2="' + (H - pad.b) + '" stroke="var(--rec)" stroke-width="2.5"/><circle cx="' + x(worst) + '" cy="' + y(c[worst]) + '" r="6" fill="var(--rec)"/>' +
      '<text x="' + Math.min(W - 120, x(worst) + 10) + '" y="' + (pad.t + 14) + '" font-size="13" font-weight="700" fill="var(--rec)">Biggest drop ' + tc(ts) + "</text>" +
      '<line id="rcur" y1="' + pad.t + '" y2="' + (H - pad.b) + '" stroke="var(--ink)" stroke-dasharray="3 3" style="display:none"/>' +
      '<text x="' + pad.l + '" y="' + (H - 6) + '" font-size="11" fill="var(--steel)">0:00</text><text x="' + (W - pad.r) + '" y="' + (H - 6) + '" font-size="11" text-anchor="end" fill="var(--steel)">' + tc(p.duration) + '</text></svg><div class="tip tc" id="rtip" style="display:none"></div></div>' +
      '<div class="block"><h2>What to change</h2><ul class="stack" style="padding-left:20px;margin:0">' + tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ul><p class="muted small" style="margin-top:14px">Demo note: Instagram shares average watch time for Reels, not a second-by-second curve. The live version estimates this curve (see design document, section 6).</p><p class="muted small" style="margin-top:10px">Drop-off point: <span class="tc">' + tc(ts) + "</span> of " + '<span class="tc">' + tc(p.duration) + "</span></p></div></div>";
    $("#rs").onchange = function () { retId = +$("#rs").value; render(); $("#rs").focus(); };
    var svg = $("#rsv"), tip = $("#rtip");
    function mv(ev) {
      var b = svg.getBoundingClientRect(), px = (ev.clientX - b.left) / b.width * W, i = Math.max(0, Math.min(10, Math.round((px - pad.l) / (W - pad.l - pad.r) * 10)));
      $("#rcur").setAttribute("x1", x(i)); $("#rcur").setAttribute("x2", x(i)); $("#rcur").style.display = "";
      tip.style.display = ""; tip.style.left = (x(i) / W * b.width) + "px"; tip.style.top = (y(c[i]) / H * b.height) + "px"; tip.textContent = tc(Math.round(p.duration * i / 10)) + "  " + c[i] + "% watching";
    }
    svg.addEventListener("pointermove", mv); svg.addEventListener("pointerdown", mv);
    svg.addEventListener("pointerleave", function () { tip.style.display = "none"; $("#rcur").style.display = "none"; });
  }

  if (!location.hash) location.hash = state.connected ? "#/today" : "#/connect";
  render();
})();
