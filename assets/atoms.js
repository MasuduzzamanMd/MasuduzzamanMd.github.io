(function () {
  var cv = document.getElementById('atoms');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, dpr, parts = [];

  var SPECIES = [
    { r: 2.6, c: '#7fb2f0', n: 0.42 },  // water oxygen
    { r: 1.7, c: '#9fb6cc', n: 0.34 },  // hydrogen
    { r: 3.4, c: '#e8a020', n: 0.14 },  // cation
    { r: 3.4, c: '#d9e4f2', n: 0.10 }   // anion
  ];

  function pick() {
    var x = Math.random(), s = 0;
    for (var i = 0; i < SPECIES.length; i++) {
      s += SPECIES[i].n;
      if (x <= s) return SPECIES[i];
    }
    return SPECIES[0];
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function build() {
    var n = Math.round(Math.min(150, Math.max(50, W * H / 9000)));
    parts = [];
    for (var i = 0; i < n; i++) {
      var s = pick();
      parts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42,
        r: s.r, c: s.c
      });
    }
  }

  // two horizontal channel walls — the confinement the research is about
  function walls() {
    var top = H * 0.16, bot = H * 0.84;
    ctx.strokeStyle = 'rgba(120,150,180,0.22)';
    ctx.lineWidth = 1;
    [top, bot].forEach(function (y) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    });
    ctx.fillStyle = 'rgba(120,150,180,0.30)';
    for (var x = 6; x < W; x += 17) {
      ctx.beginPath(); ctx.arc(x, top, 1.5, 0, 6.284); ctx.fill();
      ctx.beginPath(); ctx.arc(x, bot, 1.5, 0, 6.284); ctx.fill();
    }
    return [top, bot];
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    var w = walls(), top = w[0], bot = w[1];

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < top + p.r) { p.y = top + p.r; p.vy *= -1; }
      if (p.y > bot - p.r) { p.y = bot - p.r; p.vy *= -1; }

      for (var j = i + 1; j < parts.length; j++) {
        var q = parts[j], dx = p.x - q.x, dy = p.y - q.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 4900) {
          ctx.strokeStyle = 'rgba(110,150,200,' + (0.20 * (1 - d2 / 4900)).toFixed(3) + ')';
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }

      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.284); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(frame);
  }

  function start() { size(); build(); frame(); }
  window.addEventListener('resize', function () { size(); build(); if (reduce) frame(); });
  start();
})();
