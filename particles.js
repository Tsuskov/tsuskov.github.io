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

function drawBatman() {
  const maxLen = Math.max(...BATMAN.map(l => l.length));
  // fit the ascii block inside the canvas with padding
  const fontSize = Math.min(
    (W * 0.88) / (maxLen * 0.601),
    (H * 0.82) / (BATMAN.length * 1.25)
  );

  ctx.font = `${fontSize}px "Courier New", monospace`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  const lineH  = fontSize * 1.25;
  const totalH = BATMAN.length * lineH;
  const totalW = maxLen * fontSize * 0.601;
  const startX = (W - totalW) / 2;
  const startY = (H - totalH) / 2;

  // outer glow
  ctx.shadowColor  = 'rgba(255, 210, 0, 0.35)';
  ctx.shadowBlur   = 18;
  ctx.fillStyle    = 'rgba(255, 200, 0, 0.13)';

  BATMAN.forEach((line, i) => {
    ctx.fillText(line, startX, startY + i * lineH);
  });

  // crisp pass on top
  ctx.shadowBlur   = 0;
  ctx.fillStyle    = 'rgba(255, 210, 0, 0.28)';
  BATMAN.forEach((line, i) => {
    ctx.fillText(line, startX, startY + i * lineH);
  });
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  drawBatman();

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
draw();
