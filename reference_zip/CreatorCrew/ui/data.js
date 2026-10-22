/* Demo data for the clickable prototype. Deterministic, so every run looks the same.
   In the real product this comes from the Instagram connector (see docs/HLD.html). */
(function () {
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
  var r = rng(42);
  var pick = function (a) { return a[Math.floor(r() * a.length)]; };
  var TOPICS = ["Morning routine", "Behind the scenes", "Desk setup", "Budget finds", "Day in my life", "Recipe", "Travel"];
  var TOPIC_LIFT = { "Behind the scenes": 1.7, "Morning routine": 1.3, "Desk setup": 1.0, "Budget finds": 0.9, "Day in my life": 1.1, "Recipe": 0.8, "Travel": 0.7 };
  var FORMATS = ["Reel", "Carousel", "Photo"];
  var BASE_REACH = { Reel: 4200, Carousel: 2600, Photo: 1500 };
  var HOURS = [8, 12, 18, 19, 20, 21];
  var HOOKS = ["Nobody tells you this about", "I tried", "3 things I changed in", "Stop scrolling: my", "The honest truth about"];
  var today = new Date(); today.setHours(0, 0, 0, 0);

  var posts = [];
  for (var i = 0; i < 40; i++) {
    var fmt = r() < 0.5 ? "Reel" : (r() < 0.6 ? "Carousel" : "Photo");
    var topic = pick(TOPICS);
    var d = new Date(today); d.setDate(d.getDate() - (1 + Math.floor(i * 1.4)));
    var reach = Math.round(BASE_REACH[fmt] * TOPIC_LIFT[topic] * (0.75 + r() * 0.5));
    var likes = Math.round(reach * (0.05 + r() * 0.04));
    var comments = Math.round(reach * (0.004 + r() * 0.006));
    var saves = Math.round(reach * (0.01 + r() * 0.02) * (topic === "Behind the scenes" ? 1.8 : 1));
    var shares = Math.round(reach * (0.005 + r() * 0.012));
    var duration = fmt === "Reel" ? 15 + Math.floor(r() * 40) : 0;
    var curve = null;
    if (fmt === "Reel") {
      curve = [100]; var dropAt = 2 + Math.floor(r() * 5), bigDrop = 18 + Math.floor(r() * 14);
      for (var k = 1; k <= 10; k++) {
        var step = 3 + r() * 5 + (k === dropAt ? bigDrop : 0);
        curve.push(Math.max(5, Math.round(curve[k - 1] - step)));
      }
    }
    var hook = pick(HOOKS);
    posts.push({
      id: i + 1, date: d.toISOString().slice(0, 10), hour: pick(HOURS), format: fmt, topic: topic,
      caption: hook + " " + topic.toLowerCase(),
      reach: reach, likes: likes, comments: comments, saves: saves, shares: shares,
      eng: (likes + comments * 2 + saves * 3 + shares * 4) / reach,
      duration: duration, curve: curve
    });
  }
  var avgEng = posts.reduce(function (s, p) { return s + p.eng; }, 0) / posts.length;
  posts.forEach(function (p) { p.vsAvg = p.eng / avgEng; });

  var daily = [];
  for (var j = 55; j >= 0; j--) {
    var dd = new Date(today); dd.setDate(dd.getDate() - j);
    var trend = 1500 + (55 - j) * 22;
    var wiggle = (r() - 0.5) * 700;
    var onPost = posts.some(function (p) { return p.date === dd.toISOString().slice(0, 10); });
    daily.push({ date: dd.toISOString().slice(0, 10), reach: Math.round(trend + wiggle + (onPost ? 1800 : 0)) });
  }

  /* When followers are active: 7 days (Mon..Sun) x 6 time bands */
  var BANDS = [6, 9, 12, 15, 18, 21];
  var heat = [];
  for (var dy = 0; dy < 7; dy++) {
    var row = [];
    for (var b = 0; b < 6; b++) {
      var v = 28 + r() * 14;
      if (b >= 4 && dy < 5) v += 30;       // weekday evenings
      if (dy >= 5 && b === 2) v += 36;     // weekend midday
      if (b === 0) v -= 14;
      row.push(Math.max(8, Math.min(100, Math.round(v))));
    }
    heat.push(row);
  }

  window.CC = {
    handle: "mira.makes", name: "Mira", followers: 18400, today: today,
    posts: posts, daily: daily, heat: heat, bands: BANDS, avgEng: avgEng, topics: TOPICS
  };
})();
