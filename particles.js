const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let W, H, bats, mouse = { x: -999, y: -999 };

const BATMAN = [
  `         ,.ood888888888888boo.,         `,
  `       .od888P^""            ""^Y888bo. `,
  `    .od8P''   ..oood88888888booo.  \`\`Y8bo.  `,
  `  .odP'"  .ood8888888888888888888888boo.  "\`Ybo.`,
  ` .d8'   od8'd888888888f\`8888't888888888b\`8bo  \`Yb.`,
  ` d8'  od8^   8888888888[  \`'  ]8888888888   ^8bo  \`8b`,
  `.8P  d88'     8888888888P      Y8888888888     \`88b  Y8.`,
  `d8' .d8'       \`Y88888888'      \`88888888P'       \`8b. \`8b`,
  `.8P .88P            """"            """"            Y88. Y8.`,
  `88  888                                              888  88`,
  `88  888                                              888  88`,
  `88  888.        ..                        ..        .888  88`,
  `\`8b \`88b,     d8888b.od8bo.      .od8bo.d8888b     ,d88' d8'`,
  ` Y8. \`Y88.    8888888888888b    d8888888888888    .88P' .8P`,
  `  \`8b  Y88b.  \`88888888888888  88888888888888'  .d88P  d8'`,
  `    Y8.  ^Y88bod8888888888888..8888888888888bod88P^  .8P`,
  `     \`Y8.   ^Y888888888888888LS888888888888888P^   .8P'`,
  `       \`^Yb.,  \`^^Y8888888888888888888888P^^'  ,.dP^'`,
  `          \`^Y8b..   \`\`^^^Y88888888P^^^'    ..d8P^'`,
  `              \`^Y888bo.,            ,.od888P^'`,
  `                   "\`^^Y888888888888P^^'"`,
];

const ICONS = ['🦇', '🦇', '🦇', '🦖', '🦕'];

function spawnBat() {
  const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
  const isDino = icon !== '🦇';
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * (isDino ? 0.25 : 0.5),
    vy: (Math.random() - 0.5) * (isDino ? 0.2 : 0.45),
    size: isDino ? Math.random() * 10 + 20 : Math.random() * 8 + 14,
    icon,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.012,
    opacity: Math.random() * 0.3 + 0.4,
  };
}

function init() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  const count = Math.max(Math.floor((W * H) / 20000), 10);
  bats = Array.from({ length: count }, spawnBat);
}

window.addEventListener('resize', init);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

function getBatmanLayout() {
  const maxLen  = Math.max(...BATMAN.map(l => l.length));
  const fontSize = Math.min(
    (W * 0.38) / (maxLen * 0.601),
    (H * 0.45) / (BATMAN.length * 1.25)
  );
  const lineH  = fontSize * 1.25;
  const totalW = maxLen * fontSize * 0.601;
  const totalH = BATMAN.length * lineH;
  const pad    = 18;
  const startX = W - totalW - pad;
  const startY = pad;
  const cx     = startX + totalW / 2;
  const cy     = startY + totalH / 2;
  return { fontSize, lineH, totalW, totalH, startX, startY, cx, cy };
}

function drawSearchlight(cx, cy, totalW, totalH, t) {
  // pulsing intensity
  const pulse = 0.85 + 0.15 * Math.sin(t * 1.8);

  // wide background halo behind the logo
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, totalW * 1.1);
  halo.addColorStop(0,   `rgba(255, 210, 0, ${0.13 * pulse})`);
  halo.addColorStop(0.5, `rgba(255, 180, 0, ${0.06 * pulse})`);
  halo.addColorStop(1,   'rgba(255, 150, 0, 0)');
  ctx.beginPath();
  ctx.ellipse(cx, cy, totalW * 1.1, totalH * 1.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = halo;
  ctx.fill();

  // tight inner bloom
  const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, totalW * 0.55);
  bloom.addColorStop(0,   `rgba(255, 230, 80, ${0.18 * pulse})`);
  bloom.addColorStop(0.6, `rgba(255, 200, 20, ${0.07 * pulse})`);
  bloom.addColorStop(1,   'rgba(255, 180, 0, 0)');
  ctx.beginPath();
  ctx.ellipse(cx, cy, totalW * 0.55, totalH * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = bloom;
  ctx.fill();

  // light beam sweeping down-left from logo
  const beamLen = Math.max(W, H) * 1.2;
  const angle   = Math.PI * 0.72 + Math.sin(t * 0.4) * 0.06; // subtle sway
  const bx      = cx + Math.cos(angle) * beamLen;
  const by      = cy + Math.sin(angle) * beamLen;
  const spread  = totalW * 0.55;

  const beam = ctx.createLinearGradient(cx, cy, bx, by);
  beam.addColorStop(0,   `rgba(255, 220, 60, ${0.09 * pulse})`);
  beam.addColorStop(0.3, `rgba(255, 200, 30, ${0.04 * pulse})`);
  beam.addColorStop(1,   'rgba(255, 200, 0, 0)');

  ctx.save();
  ctx.beginPath();
  const perpX = -Math.sin(angle) * spread;
  const perpY =  Math.cos(angle) * spread;
  ctx.moveTo(cx + perpX * 0.3, cy + perpY * 0.3);
  ctx.lineTo(cx - perpX * 0.3, cy - perpY * 0.3);
  ctx.lineTo(bx - perpX, by - perpY);
  ctx.lineTo(bx + perpX, by + perpY);
  ctx.closePath();
  ctx.fillStyle = beam;
  ctx.fill();
  ctx.restore();
}

function drawBatman(layout, t) {
  const { fontSize, lineH, startX, startY, cx, cy, totalW, totalH } = layout;
  const pulse = 0.85 + 0.15 * Math.sin(t * 1.8);

  ctx.font = `${fontSize}px "Courier New", monospace`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  // glow pass
  ctx.shadowColor = `rgba(255, 200, 0, ${0.9 * pulse})`;
  ctx.shadowBlur  = 14;
  ctx.fillStyle   = `rgba(255, 200, 0, ${0.18 * pulse})`;
  BATMAN.forEach((line, i) => ctx.fillText(line, startX, startY + i * lineH));

  // sharp pass
  ctx.shadowBlur  = 4;
  ctx.fillStyle   = `rgba(255, 215, 0, ${0.55 * pulse})`;
  BATMAN.forEach((line, i) => ctx.fillText(line, startX, startY + i * lineH));

  ctx.shadowBlur  = 0;
}

function draw(ts) {
  const t = ts / 1000;
  ctx.clearRect(0, 0, W, H);

  const layout = getBatmanLayout();
  drawSearchlight(layout.cx, layout.cy, layout.totalW, layout.totalH, t);
  drawBatman(layout, t);

  const REPEL = 130;
  for (const p of bats) {
    const dx = p.x - mouse.x, dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < REPEL && dist > 0) {
      const f = (REPEL - dist) / REPEL;
      p.vx += (dx / dist) * f * 1.2;
      p.vy += (dy / dist) * f * 1.2;
    }
    p.vx *= 0.96; p.vy *= 0.96;
    p.x  += p.vx;  p.y  += p.vy;
    p.rotation += p.rotSpeed;

    if (p.x < -50) p.x = W + 50;
    if (p.x > W+50) p.x = -50;
    if (p.y < -50) p.y = H + 50;
    if (p.y > H+50) p.y = -50;

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
requestAnimationFrame(draw);
