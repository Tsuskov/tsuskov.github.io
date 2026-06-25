const USERNAME = 'tsuskov';

// fetch with localStorage fallback: the unauthenticated GitHub API allows
// 60 requests/hour per IP, so reuse the last good response when it fails
async function fetchJSON(url, cacheKey) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (err) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    throw err;
  }
}

// clean look: just the live avatar, rounded via CSS
function loadAvatar() {
  document.getElementById('avatar').src =
    `https://avatars.githubusercontent.com/${USERNAME}`;
}

async function loadContributions() {
  const graph = document.getElementById('contrib-graph');
  try {
    const data = await fetchJSON(
      `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`,
      'contributions'
    );

    document.getElementById('contrib-total').textContent =
      `${data.total.lastYear} contributions in the last year`;

    const firstWeekday = new Date(data.contributions[0].date).getUTCDay();
    data.contributions.forEach((day, i) => {
      const cell = document.createElement('div');
      cell.className = `cell level-${day.level}`;
      cell.title = `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`;
      // align the first column to the correct weekday
      if (i === 0) cell.style.gridRow = firstWeekday + 1;
      // soft left-to-right reveal wave: delay per column (~53 columns)
      const col = Math.floor((i + firstWeekday) / 7);
      cell.style.setProperty('--cell-delay', `${col * 13}ms`);
      graph.appendChild(cell);
    });
  } catch {
    graph.textContent = 'Could not load contributions.';
  }
}

async function loadProfile() {
  const stats = document.getElementById('profile-stats');
  try {
    const data = await fetchJSON(`https://api.github.com/users/${USERNAME}`, 'profile');
    stats.textContent =
      `${data.public_repos} repos · ${data.followers} followers · est. ${new Date(data.created_at).getFullYear()}`;
  } catch {
    stats.textContent = '';
  }
}

async function loadRepos() {
  const list = document.getElementById('repo-list');
  try {
    const repos = (await fetchJSON(
      `https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=100`,
      'repos'
    )).filter((r) => !r.fork).slice(0, 6);

    for (const repo of repos) {
      const card = document.createElement('a');
      card.className = 'repo-card';
      card.href = repo.html_url;

      const name = document.createElement('span');
      name.className = 'repo-name';
      name.textContent = repo.name;

      const lang = document.createElement('span');
      lang.className = 'repo-lang';
      lang.textContent = repo.language || '—';

      card.append(name, lang);
      list.appendChild(card);
    }
  } catch {
    list.textContent = 'Could not load repositories.';
  }
}

// ── little fun: replay a one-shot animation class on click ──────────────
function replayOnClick(el, cls) {
  if (!el) return;
  el.addEventListener('click', () => {
    el.classList.remove(cls);
    void el.offsetWidth; // reflow so the animation restarts
    el.classList.add(cls);
  });
  el.addEventListener('animationend', () => el.classList.remove(cls));
}

replayOnClick(document.getElementById('avatar'), 'spin');

// ── diversion: a tiny reflex game ───────────────────────────────────────
(function reflexGame() {
  const ROUND_MS = 15000;
  const CELLS = 16;

  const game = document.getElementById('game');
  const grid = document.getElementById('game-grid');
  const fill = document.getElementById('game-fill');
  const scoreEl = document.getElementById('game-score');
  const bestEl = document.getElementById('game-best');
  const btn = document.getElementById('game-btn');
  if (!game) return;

  const cells = Array.from({ length: CELLS }, () => {
    const c = document.createElement('div');
    c.className = 'game-cell';
    grid.appendChild(c);
    return c;
  });

  let best = Number(localStorage.getItem('reflex-best')) || 0;
  let score = 0;
  let lit = -1;
  let endTimer = null;
  bestEl.textContent = `best ${best}`;

  function light() {
    let next = (Math.random() * CELLS) | 0;
    if (next === lit) next = (next + 1) % CELLS; // never repeat the same square
    if (lit >= 0) cells[lit].classList.remove('lit');
    lit = next;
    cells[lit].classList.add('lit');
  }

  function bump(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth; // reflow to restart the animation
    el.classList.add(cls);
  }

  function onCell(i) {
    if (!game.classList.contains('playing')) return;
    if (i === lit) {
      score++;
      scoreEl.textContent = score;
      bump(scoreEl, 'bump');
      bump(cells[i], 'hit');
      light();
    } else {
      bump(cells[i], 'miss'); // gentle nudge, no penalty
    }
  }

  cells.forEach((c, i) => c.addEventListener('click', () => onCell(i)));

  function end() {
    game.classList.remove('playing');
    if (lit >= 0) cells[lit].classList.remove('lit');
    lit = -1;
    if (score > best) {
      best = score;
      localStorage.setItem('reflex-best', best);
      bestEl.textContent = `best ${best} ✦`;
    }
    btn.textContent = score > 0 ? `Again · scored ${score}` : 'Start';
  }

  function start() {
    clearTimeout(endTimer);
    score = 0;
    scoreEl.textContent = '0';
    game.classList.add('playing');

    // drain the countdown bar: snap full, then transition to empty over the round
    fill.style.transition = 'none';
    fill.style.transform = 'scaleX(1)';
    void fill.offsetWidth;
    fill.style.transition = `transform ${ROUND_MS}ms linear`;
    fill.style.transform = 'scaleX(0)';

    light();
    endTimer = setTimeout(end, ROUND_MS);
  }

  btn.addEventListener('click', start);
})();

// ── konami code → specimen overload ─────────────────────────────────────
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let progress = 0;
document.addEventListener('keydown', (e) => {
  progress = (e.key.toLowerCase() === KONAMI[progress].toLowerCase()) ? progress + 1 : 0;
  if (progress === KONAMI.length) {
    progress = 0;
    document.body.classList.add('freakout');
    setTimeout(() => document.body.classList.remove('freakout'), 2700);
  }
});

loadAvatar();
loadContributions();
loadProfile();
loadRepos();
