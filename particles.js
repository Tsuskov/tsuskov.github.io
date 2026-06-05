const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let W, H, particles, mouse;

const ICONS = ['🦇', '🦇', '🦇', '🦖', '🦕'];

function init() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  mouse = { x: -999, y: -999 };

  const count = Math.floor((W * H) / 18000);
  particles = Array.from({ length: Math.max(count, 12) }, () => spawnParticle());
}

function spawnParticle() {
  const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
  const isDino = icon === '🦖' || icon === '🦕';
  return {
    x:    Math.random() * W,
    y:    Math.random() * H,
    vx:   (Math.random() - 0.5) * (isDino ? 0.25 : 0.5),
    vy:   (Math.random() - 0.5) * (isDino ? 0.2  : 0.45),
    size: isDino ? (Math.random() * 10 + 18) : (Math.random() * 8 + 14),
    icon,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.01,
    opacity: Math.random() * 0.35 + 0.35,
  };
}

window.addEventListener('resize', init);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

function drawBatSignal() {
  const cx = W * 0.5;
  const cy = H * 0.5;
  const r  = Math.min(W, H) * 0.28;

  // outer glow ring
  const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
  glow.addColorStop(0, 'rgba(220, 180, 30, 0.045)');
  glow.addColorStop(1, 'rgba(220, 180, 30, 0)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // circle ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(220, 180, 30, 0.07)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // bat silhouette in center
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(220, 180, 30, 0.06)';

  const s = r * 0.32;
  ctx.beginPath();
  // body
  ctx.ellipse(0, s * 0.1, s * 0.18, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // left wing
  ctx.beginPath();
  ctx.moveTo(-s * 0.18, 0);
  ctx.bezierCurveTo(-s * 0.6, -s * 0.5, -s * 1.0, -s * 0.1, -s * 0.85, s * 0.3);
  ctx.bezierCurveTo(-s * 0.55, s * 0.15, -s * 0.3, s * 0.2, -s * 0.18, s * 0.1);
  ctx.closePath();
  ctx.fill();

  // right wing (mirror)
  ctx.beginPath();
  ctx.moveTo(s * 0.18, 0);
  ctx.bezierCurveTo(s * 0.6, -s * 0.5, s * 1.0, -s * 0.1, s * 0.85, s * 0.3);
  ctx.bezierCurveTo(s * 0.55, s * 0.15, s * 0.3, s * 0.2, s * 0.18, s * 0.1);
  ctx.closePath();
  ctx.fill();

  // ears
  ctx.beginPath();
  ctx.moveTo(-s * 0.08, -s * 0.1);
  ctx.lineTo(-s * 0.2,  -s * 0.38);
  ctx.lineTo(s * 0.01,  -s * 0.15);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(s * 0.08, -s * 0.1);
  ctx.lineTo(s * 0.2,  -s * 0.38);
  ctx.lineTo(-s * 0.01, -s * 0.15);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  drawBatSignal();

  const REPEL = 130;

  for (const p of particles) {
    const dx   = p.x - mouse.x;
    const dy   = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < REPEL && dist > 0) {
      const force = (REPEL - dist) / REPEL;
      p.vx += (dx / dist) * force * 1.2;
      p.vy += (dy / dist) * force * 1.2;
    }

    p.vx *= 0.96;
    p.vy *= 0.96;
    p.x  += p.vx;
    p.y  += p.vy;
    p.rotation += p.rotSpeed;

    if (p.x < -40)  p.x = W + 40;
    if (p.x > W+40) p.x = -40;
    if (p.y < -40)  p.y = H + 40;
    if (p.y > H+40) p.y = -40;

    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.font = `${p.size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.icon, 0, 0);
    ctx.restore();
  }

  requestAnimationFrame(draw);
}

init();
draw();
