const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H;

let mouse = { x: 0.5 };
let dust = [];

window.addEventListener('mousemove', e => { mouse.x = e.clientX / window.innerWidth; });

function init() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  dust = Array.from({ length: 60 }, spawnDust);
}
window.addEventListener('resize', init);

function spawnDust(atBottom = false) {
  const cx = W / 2;
  const spreadAtY = y => (y / H) * W * 0.35;
  const y = atBottom ? H + 10 : Math.random() * H;
  const sp = spreadAtY(y);
  return {
    x: cx + (Math.random() - 0.5) * sp * 2,
    y,
    vy: -(Math.random() * 0.5 + 0.2),
    size: Math.random() * 1.5 + 0.4,
    opacity: Math.random() * 0.5 + 0.1,
  };
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#07070e');
  grad.addColorStop(1, '#0d0c1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // vignette
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

function drawBeam(cx, t) {
  const pulse = 1 + 0.025 * Math.sin(t * 1.6);
  const srcY  = H + 30;
  const srcW  = 28;
  const topY  = -H * 0.05;
  const topW  = W * 0.55 * pulse;

  // wide outer atmospheric glow
  const outerGrad = ctx.createLinearGradient(cx, srcY, cx, topY);
  outerGrad.addColorStop(0,   'rgba(255, 220, 60,  0.22)');
  outerGrad.addColorStop(0.25,'rgba(255, 200, 40,  0.08)');
  outerGrad.addColorStop(1,   'rgba(255, 180, 20,  0.0)');
  ctx.beginPath();
  ctx.moveTo(cx - srcW * 2, srcY);
  ctx.lineTo(cx + srcW * 2, srcY);
  ctx.lineTo(cx + topW * 0.75, topY);
  ctx.lineTo(cx - topW * 0.75, topY);
  ctx.closePath();
  ctx.fillStyle = outerGrad;
  ctx.fill();

  // main beam
  const beamGrad = ctx.createLinearGradient(cx, srcY, cx, topY);
  beamGrad.addColorStop(0,    'rgba(255, 235, 100, 0.55)');
  beamGrad.addColorStop(0.15, 'rgba(255, 215, 60,  0.22)');
  beamGrad.addColorStop(0.5,  'rgba(255, 200, 40,  0.10)');
  beamGrad.addColorStop(1,    'rgba(255, 185, 20,  0.0)');
  ctx.beginPath();
  ctx.moveTo(cx - srcW, srcY);
  ctx.lineTo(cx + srcW, srcY);
  ctx.lineTo(cx + topW / 2, topY);
  ctx.lineTo(cx - topW / 2, topY);
  ctx.closePath();
  ctx.fillStyle = beamGrad;
  ctx.fill();

  // bright core
  const coreGrad = ctx.createLinearGradient(cx, srcY, cx, topY);
  coreGrad.addColorStop(0,    'rgba(255, 250, 200, 0.75)');
  coreGrad.addColorStop(0.1,  'rgba(255, 235, 120, 0.30)');
  coreGrad.addColorStop(0.4,  'rgba(255, 220, 80,  0.08)');
  coreGrad.addColorStop(1,    'rgba(255, 200, 40,  0.0)');
  const coreW = topW * 0.22;
  ctx.beginPath();
  ctx.moveTo(cx - srcW * 0.4, srcY);
  ctx.lineTo(cx + srcW * 0.4, srcY);
  ctx.lineTo(cx + coreW / 2, topY);
  ctx.lineTo(cx - coreW / 2, topY);
  ctx.closePath();
  ctx.fillStyle = coreGrad;
  ctx.fill();

  // source lens glow
  const lens = ctx.createRadialGradient(cx, srcY - 10, 0, cx, srcY - 10, 90 * pulse);
  lens.addColorStop(0,   'rgba(255, 250, 180, 0.95)');
  lens.addColorStop(0.2, 'rgba(255, 230, 100, 0.5)');
  lens.addColorStop(0.5, 'rgba(255, 210, 60,  0.15)');
  lens.addColorStop(1,   'rgba(255, 190, 30,  0)');
  ctx.beginPath();
  ctx.arc(cx, srcY - 10, 90 * pulse, 0, Math.PI * 2);
  ctx.fillStyle = lens;
  ctx.fill();
}

function drawBat(cx, cy, scale, t) {
  const pulse = 1 + 0.018 * Math.sin(t * 1.6);
  const s = scale * pulse;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // subtle drop shadow so bat reads against the beam
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur  = 28;

  ctx.fillStyle = '#04040a';
  ctx.beginPath();

  // BTAS-style bat: wide, flat, art-deco
  ctx.moveTo(0, -0.78);

  // right ear
  ctx.lineTo(0.20, -1.0);
  ctx.lineTo(0.40, -0.72);

  // right head into wing
  ctx.bezierCurveTo(0.60, -0.62, 0.76, -0.46, 0.82, -0.30);

  // right wing sweep to primary tip
  ctx.bezierCurveTo(0.92, -0.12, 1.18, -0.05, 1.42, -0.48);

  // primary tip
  ctx.lineTo(1.55, -0.62);
  ctx.lineTo(1.32, -0.02);

  // first notch
  ctx.lineTo(1.40,  0.18);
  ctx.lineTo(1.12,  0.08);

  // second notch
  ctx.lineTo(1.08,  0.32);
  ctx.lineTo(0.80,  0.18);

  // wing bottom curves to body
  ctx.bezierCurveTo(0.68, 0.36, 0.46, 0.52, 0.22, 0.60);
  ctx.bezierCurveTo(0.10, 0.64, 0.0,  0.66, 0.0,  0.66);

  // left side (mirror)
  ctx.bezierCurveTo(0.0, 0.66, -0.10, 0.64, -0.22, 0.60);
  ctx.bezierCurveTo(-0.46, 0.52, -0.68, 0.36, -0.80, 0.18);

  ctx.lineTo(-1.08,  0.32);
  ctx.lineTo(-1.12,  0.08);
  ctx.lineTo(-1.40,  0.18);
  ctx.lineTo(-1.32, -0.02);
  ctx.lineTo(-1.55, -0.62);
  ctx.lineTo(-1.42, -0.48);

  ctx.bezierCurveTo(-1.18, -0.05, -0.92, -0.12, -0.82, -0.30);
  ctx.bezierCurveTo(-0.76, -0.46, -0.60, -0.62, -0.40, -0.72);

  ctx.lineTo(-0.20, -1.0);
  ctx.lineTo(0, -0.78);

  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

function updateDust(cx) {
  for (const p of dust) {
    p.y += p.vy;
    // drift toward beam center as they rise
    const targetX = cx + (p.x - cx) * 0.998;
    p.x = targetX;
    if (p.y < -10) {
      const sp = (p.y / H) * W * 0.35;
      p.y = H + 5;
      p.x = cx + (Math.random() - 0.5) * Math.abs(sp) * 2;
      p.vy  = -(Math.random() * 0.5 + 0.2);
      p.opacity = Math.random() * 0.5 + 0.1;
      p.size = Math.random() * 1.5 + 0.4;
    }
  }
}

function drawDust() {
  for (const p of dust) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 230, 120, ${p.opacity})`;
    ctx.fill();
  }
}

function draw(ts) {
  const t = ts / 1000;

  drawBackground();

  // beam center follows mouse subtly + slow natural sway
  const cx = W / 2 + (mouse.x - 0.5) * W * 0.08 + Math.sin(t * 0.25) * 12;

  drawBeam(cx, t);
  updateDust(cx);
  drawDust();

  const batScale = Math.min(W * 0.12, H * 0.14);
  drawBat(cx, H * 0.36, batScale, t);

  requestAnimationFrame(draw);
}

init();
requestAnimationFrame(draw);
