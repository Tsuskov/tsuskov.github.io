const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
const logo   = document.getElementById('bat-logo');
let W, H;

function init() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  buildSkyline();
  initClouds();
}
window.addEventListener('resize', init);

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#07070e');
  grad.addColorStop(1, '#0d0c1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

function drawBeam(t) {
  const rect    = logo.getBoundingClientRect();
  const logoCX  = rect.left + rect.width  / 2;
  const logoCY  = rect.top  + rect.height / 2;
  const pulse   = 1 + 0.025 * Math.sin(t * 1.6);

  // Source: bottom-left
  const sx = 70;
  const sy = H + 20;

  // Unit vector from source toward logo
  const dx   = logoCX - sx;
  const dy   = logoCY - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux   = dx / dist;
  const uy   = dy / dist;
  // Perpendicular (rotated 90°)
  const px   = -uy;
  const py   =  ux;

  // Half-width at the logo equals the logo's half-width
  const halfW = (rect.width / 2) * pulse;

  // Extend the beam beyond the logo to the top of the screen
  const topY   = -40;
  const tTop   = (topY - sy) / uy;
  const topCX  = sx + ux * tTop;
  const halfWTop = (tTop / dist) * halfW;

  const angle   = Math.atan2(dy, dx);
  const beamLen = tTop;
  const midHW   = halfWTop * 1.2;

  // mid layer
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(angle);
  const midGrad = ctx.createLinearGradient(0, -midHW, 0, midHW);
  midGrad.addColorStop(0,    'rgba(255, 200, 30, 0)');
  midGrad.addColorStop(0.3,  'rgba(255, 215, 55, 0.12)');
  midGrad.addColorStop(0.5,  'rgba(255, 235, 100, 0.32)');
  midGrad.addColorStop(0.7,  'rgba(255, 215, 55, 0.12)');
  midGrad.addColorStop(1,    'rgba(255, 200, 30, 0)');
  ctx.filter = 'blur(8px)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(beamLen, -midHW);
  ctx.lineTo(beamLen,  midHW);
  ctx.closePath();
  ctx.fillStyle = midGrad;
  ctx.fill();
  ctx.restore();


  // ── source lens glow ─────────────────────────────────────────────────────
  ctx.save();
  ctx.filter = 'blur(10px)';
  const lensR = 85 * pulse;
  const lens  = ctx.createRadialGradient(sx, sy, 0, sx, sy, lensR);
  lens.addColorStop(0,    'rgba(255, 255, 200, 0.95)');
  lens.addColorStop(0.25, 'rgba(255, 230, 100, 0.55)');
  lens.addColorStop(0.6,  'rgba(255, 210, 60,  0.20)');
  lens.addColorStop(1,    'rgba(255, 180, 20,  0)');
  ctx.beginPath();
  ctx.arc(sx, sy, lensR, 0, Math.PI * 2);
  ctx.fillStyle = lens;
  ctx.fill();
  ctx.restore();

  // ── logo glow on canvas ───────────────────────────────────────────────────
  const p2     = 0.7 + 0.3 * Math.sin(t * 1.6);
  const lgGlow = ctx.createRadialGradient(logoCX, logoCY, 0, logoCX, logoCY, rect.width * 0.75);
  lgGlow.addColorStop(0,   `rgba(255, 220, 60, ${0.30 * p2})`);
  lgGlow.addColorStop(0.5, `rgba(255, 180, 20, ${0.13 * p2})`);
  lgGlow.addColorStop(1,   'rgba(255, 140, 0,  0)');
  ctx.save();
  ctx.filter = 'blur(12px)';
  ctx.beginPath();
  ctx.ellipse(logoCX, logoCY, rect.width * 0.75, rect.height * 0.85, 0, 0, Math.PI * 2);
  ctx.fillStyle = lgGlow;
  ctx.fill();
  ctx.restore();
}

// ── clouds ──────────────────────────────────────────────────────────────────
let clouds = [];

function makeCloudSprite(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const cc = c.getContext('2d');
  const blobs = 10 + Math.floor(Math.random() * 8);
  for (let i = 0; i < blobs; i++) {
    const bx = w * (0.15 + Math.random() * 0.7);
    const by = h * (0.3 + Math.random() * 0.4);
    const br = h * (0.25 + Math.random() * 0.35);
    const g  = cc.createRadialGradient(bx, by, 0, bx, by, br);
    const shade = 20 + Math.floor(Math.random() * 18);
    g.addColorStop(0, `rgba(${shade}, ${shade + 4}, ${shade + 14}, 0.55)`);
    g.addColorStop(1, 'rgba(15, 16, 30, 0)');
    cc.fillStyle = g;
    cc.beginPath();
    cc.arc(bx, by, br, 0, Math.PI * 2);
    cc.fill();
  }
  return c;
}

function initClouds() {
  clouds = [];
  const count = 18;
  for (let i = 0; i < count; i++) {
    const scale = 0.8 + Math.random() * 1.6;
    clouds.push({
      sprite: makeCloudSprite(420, 180),
      x: Math.random() * W,
      y: H * (-0.05 + Math.random() * 0.40),
      scale,
      speed: (4 + Math.random() * 10) * (Math.random() < 0.5 ? 1 : -1),
      alpha: 0.5 + Math.random() * 0.5,
    });
  }
}

function drawClouds(dt, lit) {
  for (const cl of clouds) {
    cl.x += cl.speed * dt;
    const w = 420 * cl.scale, h = 180 * cl.scale;
    if (cl.x > W + w / 2) cl.x = -w / 2;
    if (cl.x < -w / 2)    cl.x = W + w / 2;
    ctx.globalAlpha = Math.min(1, cl.alpha + lit * 0.6);
    ctx.drawImage(cl.sprite, cl.x - w / 2, cl.y - h / 2, w, h);
  }
  ctx.globalAlpha = 1;
}

// ── skyline ─────────────────────────────────────────────────────────────────
let skyline = null;

function buildSkyline() {
  skyline = document.createElement('canvas');
  skyline.width = W; skyline.height = H;
  const sc = skyline.getContext('2d');

  // far layer
  sc.fillStyle = '#101020';
  let x = 0;
  while (x < W) {
    const bw = 40 + Math.random() * 90;
    const bh = H * (0.08 + Math.random() * 0.14);
    sc.fillRect(x, H - bh, bw, bh);
    x += bw + Math.random() * 14;
  }

  // near layer with sparse lit windows
  x = 0;
  while (x < W) {
    const bw = 50 + Math.random() * 110;
    const bh = H * (0.12 + Math.random() * 0.20);
    sc.fillStyle = '#070710';
    sc.fillRect(x, H - bh, bw, bh);
    // occasional antenna / spire
    if (Math.random() < 0.25) {
      sc.fillRect(x + bw / 2 - 1.5, H - bh - 14 - Math.random() * 30, 3, 50);
    }
    // windows
    for (let wy = H - bh + 8; wy < H - 8; wy += 14) {
      for (let wx = x + 6; wx < x + bw - 6; wx += 12) {
        if (Math.random() < 0.07) {
          sc.fillStyle = `rgba(255, 215, 120, ${0.25 + Math.random() * 0.5})`;
          sc.fillRect(wx, wy, 4, 6);
        }
      }
    }
    x += bw + Math.random() * 10;
  }
}

// ── lightning ───────────────────────────────────────────────────────────────
let bolt = null;
let boltLife = 0;
let flash = 0;
let nextStrike = 1.5 + Math.random() * 3;

function makeBolt() {
  const startX = W * (0.1 + Math.random() * 0.8);
  const startY = H * (0.02 + Math.random() * 0.15);
  const endY   = H * (0.55 + Math.random() * 0.25);
  const paths  = [];

  function jag(x, y, yEnd, spread) {
    const pts = [[x, y]];
    while (y < yEnd) {
      y += 12 + Math.random() * 28;
      x += (Math.random() - 0.5) * spread;
      pts.push([x, y]);
      // occasional short branch
      if (spread > 20 && Math.random() < 0.15) {
        paths.push(jag(x, y, y + (yEnd - y) * (0.2 + Math.random() * 0.3), spread * 0.6));
      }
    }
    return pts;
  }

  paths.push(jag(startX, startY, endY, 44));
  return { paths, x: startX, y: startY };
}

function drawLightning(dt) {
  if (bolt) {
    boltLife -= dt;
    if (boltLife <= 0) { bolt = null; }
  }
  if (!bolt) {
    nextStrike -= dt;
    if (nextStrike <= 0) {
      bolt       = makeBolt();
      boltLife   = 0.18 + Math.random() * 0.15;
      flash      = 0.45;
      nextStrike = 2 + Math.random() * 6;
    }
  }
  if (!bolt) return;

  const a = Math.max(0, boltLife / 0.3) * (0.7 + 0.3 * Math.random()); // flicker
  ctx.save();
  ctx.lineJoin = 'round';
  // outer glow pass + bright core pass
  for (const [lw, col] of [
    [7, `rgba(150, 180, 255, ${0.25 * a})`],
    [2, `rgba(235, 240, 255, ${0.95 * a})`],
  ]) {
    ctx.lineWidth   = lw;
    ctx.strokeStyle = col;
    ctx.shadowColor = 'rgba(170, 190, 255, 0.9)';
    ctx.shadowBlur  = 18;
    for (const pts of bolt.paths) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
    }
  }
  // glow inside the cloud at the strike origin
  const g = ctx.createRadialGradient(bolt.x, bolt.y, 0, bolt.x, bolt.y, 220);
  g.addColorStop(0, `rgba(160, 180, 255, ${0.5 * a})`);
  g.addColorStop(1, 'rgba(160, 180, 255, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(bolt.x, bolt.y, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFlash(dt) {
  if (flash <= 0) return;
  flash = Math.max(0, flash - dt * 2.2);
  ctx.fillStyle = `rgba(170, 185, 235, ${flash * 0.22})`;
  ctx.fillRect(0, 0, W, H);
}

// ── main loop ───────────────────────────────────────────────────────────────
let lastTs = 0;

function draw(ts) {
  const t  = ts / 1000;
  const dt = Math.min(0.05, t - lastTs);
  lastTs   = t;

  drawBackground();
  drawClouds(dt, flash);
  drawLightning(dt);
  ctx.drawImage(skyline, 0, 0);
  drawBeam(t);
  drawFlash(dt);
  requestAnimationFrame(draw);
}

init();
requestAnimationFrame(draw);
