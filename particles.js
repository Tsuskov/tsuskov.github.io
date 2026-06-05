const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let W, H, particles, mouse;

function init() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  mouse = { x: W / 2, y: H / 2 };

  const count = Math.floor((W * H) / 12000);
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.5,
  }));
}

window.addEventListener('resize', init);

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function draw() {
  ctx.clearRect(0, 0, W, H);

  const REPEL = 120;
  const LINK  = 140;

  for (const p of particles) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < REPEL) {
      const force = (REPEL - dist) / REPEL;
      p.vx += (dx / dist) * force * 0.6;
      p.vy += (dy / dist) * force * 0.6;
    }

    p.vx *= 0.97;
    p.vy *= 0.97;
    p.x  += p.vx;
    p.y  += p.vy;

    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(88, 166, 255, 0.7)';
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < LINK) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(88, 166, 255, ${(1 - d / LINK) * 0.25})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}

init();
draw();
