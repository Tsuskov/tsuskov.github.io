const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
const logo   = document.getElementById('bat-logo');
let W, H;

function init() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
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

function draw(ts) {
  const t = ts / 1000;
  drawBackground();
  drawBeam(t);
  requestAnimationFrame(draw);
}

init();
requestAnimationFrame(draw);
