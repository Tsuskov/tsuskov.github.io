/* Favorites — tiny animated pixel-art visualizers on 16×16 canvases.
   Palette: Mistral-style orange gradient + the site's contribution greens.
   Everything steps at ~7 fps for a chunky, deliberate pixel feel. */
(() => {
  const P = {
    y: "#ffd800", o1: "#ffaf00", o2: "#ff8205", o3: "#fa500f", r: "#e10500",
    g1: "#9be9a8", g2: "#40c463", g3: "#30a14e", g4: "#216e39",
    b: "#6366f1", faint: "#e4e4e7", ink: "#18181b",
  };

  const px = (c, x, y, col) => {
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), 1, 1);
  };
  const block = (c, x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  const at = (a, b, u) => a + (b - a) * u;
  const line = (c, x0, y0, x1, y1, col) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) px(c, at(x0, x1, i / n), at(y0, y1, i / n), col);
  };

  /* 3×5 pixel font — only the glyphs we actually need */
  const GLYPH = {
    "2": ["###", "..#", "###", "#..", "###"],
    "3": ["###", "..#", ".##", "..#", "###"],
    "7": ["###", "..#", ".#.", ".#.", ".#."],
  };
  const glyph = (c, ch, x, y, col, s = 1) => {
    GLYPH[ch].forEach((row, j) => [...row].forEach((v, i) => {
      if (v === "#") block(c, x + i * s, y + j * s, s, s, col);
    }));
  };

  /* ── backprop: forward pulse in green, gradients flow back in orange ── */
  const L0 = [3, 8, 13], L1 = [5, 10], L2 = [8];
  const NET = [];
  L0.forEach(a => L1.forEach(b => NET.push([2, a + 1, 7, b + 1])));
  L1.forEach(a => L2.forEach(b => NET.push([8, a + 1, 13, b + 1])));
  function backprop(c, f) {
    NET.forEach(e => line(c, e[0], e[1], e[2], e[3], P.faint));
    const t = f % 26;
    let gx = null, col = null;
    if (t <= 10) { gx = at(2, 14, t / 10); col = P.g2; }
    else if (t >= 13 && t <= 23) { gx = at(14, 2, (t - 13) / 10); col = P.o2; }
    if (gx !== null) NET.forEach(([x0, y0, x1, y1]) => {
      if (gx >= x0 && gx <= x1) px(c, gx, at(y0, y1, (gx - x0) / (x1 - x0)), col);
    });
    L0.forEach(y => block(c, 1, y, 2, 2, P.g3));
    L1.forEach(y => block(c, 7, y, 2, 2, P.g3));
    L2.forEach(y => block(c, 13, y, 2, 2, P.g3));
  }
  backprop.still = 5;

  /* ── dijkstra: BFS flood from start, then the shortest path lights up ── */
  const DK = (() => {
    const wall = (x, y) =>
      (x >= 4 && x <= 6 && y >= 3 && y <= 9) ||
      (x >= 9 && x <= 11 && y >= 6 && y <= 13);
    const dist = new Array(256).fill(-1), prev = new Array(256).fill(-1);
    const q = [[1, 14]];
    dist[14 * 16 + 1] = 0;
    while (q.length) {
      const [x, y] = q.shift();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx > 15 || ny > 15) return;
        if (wall(nx, ny) || dist[ny * 16 + nx] >= 0) return;
        dist[ny * 16 + nx] = dist[y * 16 + x] + 1;
        prev[ny * 16 + nx] = y * 16 + x;
        q.push([nx, ny]);
      });
    }
    const path = [];
    let cur = 1 * 16 + 14;
    while (cur >= 0) { path.push(cur); cur = prev[cur]; }
    path.reverse();
    return { wall, dist, path, dGoal: dist[1 * 16 + 14] };
  })();
  function dijkstra(c, f) {
    const floodT = Math.ceil(DK.dGoal / 2), pathT = Math.ceil(DK.path.length / 2);
    const t = f % (floodT + pathT + 8);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      if (DK.wall(x, y)) { px(c, x, y, P.ink); continue; }
      const d = DK.dist[y * 16 + x];
      if (d < 0) continue;
      if (t <= floodT) {
        if (d <= t * 2) px(c, x, y, d >= t * 2 - 1 ? P.g2 : P.g1);
      } else if (d <= DK.dGoal) px(c, x, y, P.g1);
    }
    if (t > floodT) DK.path.slice(0, (t - floodT) * 2)
      .forEach(i => px(c, i % 16, (i / 16) | 0, P.o2));
    px(c, 1, 14, P.g4);
    px(c, 14, 1, P.o3);
  }
  dijkstra.still = Math.ceil(DK.dGoal / 2) + Math.ceil(DK.path.length / 2);

  /* ── graph: a token walks the edges ── */
  const GN = [[3, 2], [12, 2], [8, 7], [3, 12], [13, 11], [7, 13]];
  const GE = [[0, 2], [1, 2], [2, 4], [4, 5], [5, 3], [3, 0], [1, 4], [2, 3]];
  const GW = [0, 2, 1, 4, 5, 3];
  function graph(c, f) {
    GE.forEach(([a, b]) =>
      line(c, GN[a][0] + 1, GN[a][1] + 1, GN[b][0] + 1, GN[b][1] + 1, P.faint));
    const leg = ((f / 5) | 0) % GW.length, u = (f % 5) / 5;
    const A = GN[GW[leg]], B = GN[GW[(leg + 1) % GW.length]];
    GN.forEach(([x, y], i) =>
      block(c, x, y, 2, 2, i === GW[(leg + 1) % GW.length] ? P.g2 : P.g3));
    px(c, at(A[0] + 1, B[0] + 1, u), at(A[1] + 1, B[1] + 1, u), P.o2);
  }
  graph.still = 7;

  /* ── higgs: two beams collide, a diamond burst, then the H ── */
  function higgs(c, f) {
    const t = f % 23;
    if (t <= 8) {
      for (let k = 0; k < 3; k++) {
        const x = t - k;
        if (x < 0 || x > 7) continue;
        const col = [P.y, P.o2, P.o3][k];
        px(c, x, 8, col);
        px(c, 15 - x, 8, col);
      }
    } else if (t <= 13) {
      const r = t - 8, col = [P.y, P.y, P.o1, P.o2, P.o3, P.r][r];
      for (let dx = 0; dx <= r; dx++) {
        const dy = r - dx;
        px(c, 7 - dx, 8 - dy, col); px(c, 8 + dx, 8 - dy, col);
        px(c, 7 - dx, 8 + dy, col); px(c, 8 + dx, 8 + dy, col);
      }
    } else if (t <= 21) {
      ["#.#", "#.#", "###", "#.#", "#.#"].forEach((row, j) =>
        [...row].forEach((v, i) => { if (v === "#") px(c, 6 + i, 6 + j, P.ink); }));
    }
  }
  higgs.still = 17;

  /* ── gluon: two quarks trade color charge over a wobbling spring ── */
  function gluon(c, f) {
    const swap = ((f / 12) | 0) % 2;
    const cA = swap ? P.b : P.r, cB = swap ? P.r : P.b;
    block(c, 2, 7, 3, 3, cA);
    block(c, 11, 7, 3, 3, cB);
    for (let x = 5; x <= 10; x++) {
      const y = 8 + Math.round(Math.sin((x + f) * 1.1) * 1.6);
      px(c, x, y, x % 2 ? cA : cB);
    }
  }
  gluon.still = 3;

  /* ── neutrino: sails through the lattice, oscillating flavor as it goes ── */
  function neutrino(c, f) {
    for (let x = 2; x <= 14; x += 3)
      for (let y = 2; y <= 14; y += 3) px(c, x, y, P.faint);
    const t = f % 22, flavors = [P.g2, P.o2, P.b];
    for (let k = 0; k < 4; k++) {
      const s = t - k;
      if (s < 0 || s > 15) continue;
      px(c, s, 15 - s, k === 0 ? flavors[((s / 5) | 0) % 3] : P.g1);
    }
  }
  neutrino.still = 8;

  /* ── titanium: a periodic-table tile with a scanline running the border ── */
  function titanium(c, f) {
    for (let i = 0; i < 16; i++) {
      px(c, i, 0, P.faint); px(c, i, 15, P.faint);
      px(c, 0, i, P.faint); px(c, 15, i, P.faint);
    }
    const p = f % 60;
    let sx, sy;
    if (p < 15) { sx = p; sy = 0; }
    else if (p < 30) { sx = 15; sy = p - 15; }
    else if (p < 45) { sx = 45 - p; sy = 15; }
    else { sx = 0; sy = 60 - p; }
    px(c, sx, sy, P.o2);
    glyph(c, "2", 8, 2, P.o2);
    glyph(c, "2", 12, 2, P.o2);
    block(c, 2, 8, 5, 1, P.ink);
    block(c, 4, 8, 1, 6, P.ink);
    px(c, 8, 9, P.ink);
    block(c, 8, 11, 1, 3, P.ink);
  }
  titanium.still = 3;

  /* ── euler: e^iθ orbits the unit circle; at θ = π it lands on −1 ── */
  const EC = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    EC.push([Math.round(8 + 6 * Math.cos(a)), Math.round(8 - 6 * Math.sin(a))]);
  }
  function euler(c, f) {
    EC.forEach(([x, y]) => px(c, x, y, P.faint));
    px(c, 8, 8, P.faint);
    const i = f % 24;
    [P.o3, P.o2, P.o1, P.y].forEach((col, k) => {
      const [x, y] = EC[(i - k + 24) % 24];
      px(c, x, y, col);
    });
    if (i === 12) block(c, 1, 7, 3, 3, P.g2);
    else px(c, 2, 8, P.g3);
  }
  euler.still = 12;

  /* ── gauss: samples pile up into a bell curve ── */
  const GA = (() => {
    const target = [];
    let sum = 0;
    for (let x = 0; x < 16; x++) {
      const h = Math.round(12 * Math.exp(-((x - 7.5) ** 2) / (2 * 3.1 ** 2)));
      target.push(h);
      sum += h;
    }
    const rem = target.slice(), order = [];
    let seed = 7;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let i = 0; i < sum; i++) {
      let x;
      do { x = (rnd() * 16) | 0; } while (!rem[x]);
      rem[x]--;
      order.push(x);
    }
    return { target, order, sum, fillT: Math.ceil(sum / 3) };
  })();
  function gauss(c, f) {
    const t = f % (GA.fillT + 10);
    const n = Math.min(t * 3, GA.sum), h = new Array(16).fill(0);
    for (let i = 0; i < n; i++) h[GA.order[i]]++;
    for (let x = 0; x < 16; x++)
      for (let y = 0; y < h[x]; y++)
        px(c, x, 15 - y, y === h[x] - 1 ? P.g2 : P.g3);
    if (t > GA.fillT)
      for (let x = 0; x < 16; x++)
        if (GA.target[x]) px(c, x, 15 - GA.target[x], P.o2);
  }
  gauss.still = GA.fillT + 2;

  /* ── batman: the signal, flickering over the city ── */
  const BAT = [
    "......#.#......",
    ".....#####.....",
    ".#############.",
    "###############",
    "###############",
    ".####.###.####.",
    "..##...#...##..",
  ];
  function batman(c, f) {
    const bright = f % 20 < 2 ? P.o1 : P.y;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      if (((x - 7.5) / 7.4) ** 2 + ((y - 8) / 5.4) ** 2 <= 1) px(c, x, y, bright);
    }
    BAT.forEach((row, j) =>
      [...row].forEach((v, i) => { if (v === "#") px(c, i, 5 + j, P.ink); }));
  }
  batman.still = 5;

  /* ── 73 & 37: the emirp pair, with 73's binary palindrome below ── */
  function emirp(c, f) {
    const is73 = ((f / 14) | 0) % 2 === 0;
    const col = is73 ? P.o2 : P.g3, dot = is73 ? P.g3 : P.o2;
    glyph(c, is73 ? "7" : "3", 1, 1, col, 2);
    glyph(c, is73 ? "3" : "7", 9, 1, col, 2);
    const bits = is73 ? [1, 0, 0, 1, 0, 0, 1] : [1, 0, 0, 1, 0, 1];
    const x0 = (16 - bits.length) >> 1;
    bits.forEach((b, i) => px(c, x0 + i, 13, b ? dot : P.faint));
  }
  emirp.still = 3;

  /* ── planck: discrete jumps down the energy ladder, one photon each ── */
  const LV = [5, 7, 10, 14];
  function planck(c, f) {
    LV.forEach(y => { for (let x = 2; x <= 7; x++) px(c, x, y, P.faint); });
    const t = f % 30, stage = (t / 8) | 0;
    if (stage > 2) { block(c, 4, LV[0] - 2, 2, 2, P.g3); return; }
    const s = t % 8, gap = LV[stage + 1] - LV[stage];
    const ey = s < 2 ? LV[stage] : LV[stage + 1];
    block(c, 4, ey - 2, 2, 2, P.g3);
    if (s >= 2) {
      const col = { 2: P.r, 3: P.o2, 4: P.b }[gap];
      for (let q = 0; q < 3; q++) {
        const x = Math.round(8 + (s - 2) * 1.5) - q;
        if (x < 8 || x > 15) continue;
        px(c, x, LV[stage + 1] - 2 + Math.round(Math.sin(x * gap * 0.6)), col);
      }
    }
  }
  planck.still = 12;

  /* ── bootstrap ── */
  const R = {
    backprop, dijkstra, graph, higgs, gluon, neutrino,
    titanium, euler, gauss, batman, emirp, planck,
  };
  const views = [...document.querySelectorAll(".fav-viz")]
    .map(cv => ({ c: cv.getContext("2d"), fn: R[cv.dataset.viz] }))
    .filter(v => v.fn);
  const draw = (v, f) => {
    v.c.clearRect(0, 0, 16, 16);
    v.fn(v.c, f);
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    views.forEach(v => draw(v, v.fn.still));
  } else {
    let f = 0;
    setInterval(() => { f++; views.forEach(v => draw(v, f)); }, 150);
  }
})();
