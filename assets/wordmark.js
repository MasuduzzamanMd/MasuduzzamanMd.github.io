(function () {
  var cv = document.getElementById('mark');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COLORS = ['#7fd3c8', '#8fc4ef', '#a9dcd2', '#b9d4f2', '#6fc3bb'];
  var parts = [], W, H, dpr;
  var pointer = { x: -9999, y: -9999, active: false };

  function targets() {
    var off = document.createElement('canvas');
    off.width = W; off.height = H;
    var o = off.getContext('2d');
    var size = Math.min(W * 0.30, H * 1.05);
    o.fillStyle = '#000';
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.font = '700 ' + size + 'px "IBM Plex Serif", Georgia, serif';
    o.fillText('MTP', W / 2, H / 2);

    var data = o.getImageData(0, 0, W, H).data;
    var step = W < 480 ? 4 : 5;
    var pts = [];
    for (var y = 0; y < H; y += step) {
      for (var x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4 + 3] > 128) pts.push({ x: x, y: y });
      }
    }
    return pts;
  }

  function build() {
    var pts = targets();
    parts = pts.map(function (t) {
      return {
        tx: t.x, ty: t.y,
        x: W / 2 + (Math.random() - 0.5) * W,
        y: H / 2 + (Math.random() - 0.5) * H * 1.6,
        vx: 0, vy: 0,
        r: 1.5 + Math.random() * 1.6,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      };
    });
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];

      // spring toward the letter position
      p.vx += (p.tx - p.x) * 0.012;
      p.vy += (p.ty - p.y) * 0.012;

      // push away from the pointer
      if (pointer.active) {
        var dx = p.x - pointer.x, dy = p.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 8000 && d2 > 0.5) {
          var f = (8000 - d2) / 8000 * 2.6 / Math.sqrt(d2);
          p.vx += dx * f;
          p.vy += dy * f;
        }
      }

      p.vx *= 0.90; p.vy *= 0.90;
      p.x += p.vx; p.y += p.vy;

      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  function still() {
    ctx.clearRect(0, 0, W, H);
    parts.forEach(function (p) {
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.tx, p.ty, p.r, 0, 6.2832); ctx.fill();
    });
  }

  function at(e) {
    var r = cv.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    pointer.x = t.clientX - r.left;
    pointer.y = t.clientY - r.top;
    pointer.active = true;
  }
  function off() { pointer.active = false; pointer.x = pointer.y = -9999; }

  cv.addEventListener('mousemove', at);
  cv.addEventListener('mouseleave', off);
  cv.addEventListener('touchstart', function (e) { at(e); }, { passive: true });
  cv.addEventListener('touchmove', function (e) { at(e); }, { passive: true });
  cv.addEventListener('touchend', off);

  function start() { size(); build(); reduce ? still() : frame(); }
  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () { size(); build(); if (reduce) still(); }, 180);
  });
  start();
})();
