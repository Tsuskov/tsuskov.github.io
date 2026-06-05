const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H;

let mouse = { x: 0.5 };

window.addEventListener('mousemove', e => { mouse.x = e.clientX / window.innerWidth; });

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

function drawBeam(cx, t) {
  const pulse = 1 + 0.025 * Math.sin(t * 1.6);
  const srcY  = H + 30;
  const srcW  = 28;
  const topY  = -H * 0.05;
  const topW  = W * 0.55 * pulse;

  const outerGrad = ctx.createLinearGradient(cx, srcY, cx, topY);
  outerGrad.addColorStop(0,    'rgba(255, 220, 60,  0.22)');
  outerGrad.addColorStop(0.25, 'rgba(255, 200, 40,  0.08)');
  outerGrad.addColorStop(1,    'rgba(255, 180, 20,  0.0)');
  ctx.beginPath();
  ctx.moveTo(cx - srcW * 2, srcY);
  ctx.lineTo(cx + srcW * 2, srcY);
  ctx.lineTo(cx + topW * 0.75, topY);
  ctx.lineTo(cx - topW * 0.75, topY);
  ctx.closePath();
  ctx.fillStyle = outerGrad;
  ctx.fill();

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

  const coreGrad = ctx.createLinearGradient(cx, srcY, cx, topY);
  coreGrad.addColorStop(0,   'rgba(255, 250, 200, 0.75)');
  coreGrad.addColorStop(0.1, 'rgba(255, 235, 120, 0.30)');
  coreGrad.addColorStop(0.4, 'rgba(255, 220, 80,  0.08)');
  coreGrad.addColorStop(1,   'rgba(255, 200, 40,  0.0)');
  const coreW = topW * 0.22;
  ctx.beginPath();
  ctx.moveTo(cx - srcW * 0.4, srcY);
  ctx.lineTo(cx + srcW * 0.4, srcY);
  ctx.lineTo(cx + coreW / 2, topY);
  ctx.lineTo(cx - coreW / 2, topY);
  ctx.closePath();
  ctx.fillStyle = coreGrad;
  ctx.fill();

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

  ctx.shadowColor = 'rgba(0,0,0,0.95)';
  ctx.shadowBlur  = 32;
  ctx.fillStyle   = '#03030a';
  ctx.beginPath();

  // Classic chest-emblem silhouette matching the ASCII art:
  // wide oval body, two small ears at top, two scallops per wing at the bottom.
  // Proportions: ~±1.65 wide, -1.06 to +0.78 tall (≈1.75:1, same as ASCII art).

  ctx.moveTo(0, 0.78); // bottom centre

  // right wing — scallop 2
  ctx.bezierCurveTo( 0.18,  0.78,  0.42,  0.68,  0.58,  0.56);
  ctx.bezierCurveTo( 0.68,  0.48,  0.72,  0.62,  0.88,  0.60);
  ctx.bezierCurveTo( 1.02,  0.58,  1.02,  0.38,  0.92,  0.26);
  // right wing — scallop 1
  ctx.bezierCurveTo( 1.08,  0.32,  1.18,  0.50,  1.34,  0.44);
  ctx.bezierCurveTo( 1.50,  0.38,  1.52,  0.14,  1.42,  0.00);
  // right outer arc
  ctx.bezierCurveTo( 1.62,  0.06,  1.72, -0.18,  1.58, -0.38);
  ctx.bezierCurveTo( 1.44, -0.58,  1.16, -0.64,  0.96, -0.58);
  // right shoulder → right ear
  ctx.bezierCurveTo( 0.80, -0.54,  0.64, -0.62,  0.54, -0.76);
  ctx.bezierCurveTo( 0.44, -0.88,  0.34, -1.06,  0.20, -1.06);
  ctx.bezierCurveTo( 0.10, -1.06,  0.04, -0.90,  0.00, -0.80);

  // left ear
  ctx.bezierCurveTo(-0.04, -0.90, -0.10, -1.06, -0.20, -1.06);
  ctx.bezierCurveTo(-0.34, -1.06, -0.44, -0.88, -0.54, -0.76);
  // left shoulder
  ctx.bezierCurveTo(-0.64, -0.62, -0.80, -0.54, -0.96, -0.58);
  ctx.bezierCurveTo(-1.16, -0.64, -1.44, -0.58, -1.58, -0.38);
  // left outer arc
  ctx.bezierCurveTo(-1.72, -0.18, -1.62,  0.06, -1.42,  0.00);
  // left wing — scallop 1
  ctx.bezierCurveTo(-1.52,  0.14, -1.50,  0.38, -1.34,  0.44);
  ctx.bezierCurveTo(-1.18,  0.50, -1.08,  0.32, -0.92,  0.26);
  // left wing — scallop 2
  ctx.bezierCurveTo(-1.02,  0.38, -1.02,  0.58, -0.88,  0.60);
  ctx.bezierCurveTo(-0.72,  0.62, -0.68,  0.48, -0.58,  0.56);
  ctx.bezierCurveTo(-0.42,  0.68, -0.18,  0.78,  0.00,  0.78);

  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function draw(ts) {
  const t = ts / 1000;

  drawBackground();

  const cx = W / 2 + (mouse.x - 0.5) * W * 0.08 + Math.sin(t * 0.25) * 12;

  drawBeam(cx, t);

  const batScale = Math.min(W * 0.12, H * 0.14);
  drawBat(cx, H * 0.36, batScale, t);

  requestAnimationFrame(draw);
}

init();
requestAnimationFrame(draw);
