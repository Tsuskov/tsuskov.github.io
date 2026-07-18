const USERNAME = 'tsuskov';

// i18n.js sets <html lang> and fires "langchange"; pick strings per render
const isDE = () => document.documentElement.lang === 'de';
const L = (en, de) => (isDE() ? de : en);

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

    const renderTotal = () => {
      document.getElementById('contrib-total').textContent = L(
        `${data.total.lastYear} contributions in the last year`,
        `${data.total.lastYear} Beiträge im letzten Jahr`
      );
    };
    renderTotal();
    document.addEventListener('langchange', renderTotal);

    const cellTitle = (day) => L(
      `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`,
      `${day.count} ${day.count === 1 ? 'Beitrag' : 'Beiträge'} am ${day.date}`
    );

    const firstWeekday = new Date(data.contributions[0].date).getUTCDay();
    let peak = null, peakCount = 0, peakDay = null;
    const cells = [];
    data.contributions.forEach((day, i) => {
      const cell = document.createElement('div');
      cell.className = `cell level-${day.level}`;
      cell.title = cellTitle(day);
      // align the first column to the correct weekday
      if (i === 0) cell.style.gridRow = firstWeekday + 1;
      // soft left-to-right reveal wave: delay per column (~53 columns)
      const col = Math.floor((i + firstWeekday) / 7);
      cell.style.setProperty('--cell-delay', `${col * 13}ms`);
      if (day.count > peakCount) { peakCount = day.count; peak = cell; peakDay = day; }
      cells.push(cell);
      graph.appendChild(cell);
    });
    // the single best day of the year burns orange
    const peakSuffix = () => L(' · best day of the year', ' · bester Tag des Jahres');
    if (peak) {
      peak.classList.add('peak');
      peak.title += peakSuffix();
    }
    document.addEventListener('langchange', () => {
      cells.forEach((cell, i) => { cell.title = cellTitle(data.contributions[i]); });
      if (peak) peak.title = cellTitle(peakDay) + peakSuffix();
    });
  } catch {
    graph.textContent = L('Could not load contributions.', 'Beiträge konnten nicht geladen werden.');
  }
}

async function loadProfile() {
  const stats = document.getElementById('profile-stats');
  try {
    const data = await fetchJSON(`https://api.github.com/users/${USERNAME}`, 'profile');
    const render = () => {
      stats.textContent = L(
        `${data.public_repos} repos · ${data.followers} followers · est. ${new Date(data.created_at).getFullYear()}`,
        `${data.public_repos} Repos · ${data.followers} Follower · seit ${new Date(data.created_at).getFullYear()}`
      );
    };
    render();
    document.addEventListener('langchange', render);
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
    list.textContent = L('Could not load repositories.', 'Repositories konnten nicht geladen werden.');
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
  let bestStar = false;
  let lastScore = null;

  const renderBest = () => {
    bestEl.textContent = `${L('best', 'Rekord')} ${best}${bestStar ? ' ✦' : ''}`;
  };
  const renderBtn = () => {
    btn.textContent = lastScore > 0 ? L(`Again · scored ${lastScore}`, `Nochmal · ${lastScore} Treffer`) : 'Start';
  };
  renderBest();
  document.addEventListener('langchange', () => { renderBest(); renderBtn(); });

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
      bestStar = true;
      renderBest();
    }
    lastScore = score;
    renderBtn();
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
