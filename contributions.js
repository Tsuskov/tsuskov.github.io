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

// x-ray the live avatar in canvas pixels — CSS filters/blend modes
// render unreliably on iOS Safari
function loadAvatar() {
  const canvas = document.getElementById('avatar');
  const ctx    = canvas.getContext('2d');
  const img    = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    try {
      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d  = id.data;
      for (let i = 0; i < d.length; i += 4) {
        // invert luminance, then brightness 1.15 / contrast 1.1 (as the old CSS)
        let v = 255 - (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
        v = (v * 1.15 - 128) * 1.1 + 128;
        v = Math.max(0, Math.min(255, v));
        d[i] = d[i + 1] = d[i + 2] = 255;
        d[i + 3] = v; // alpha from brightness: black background melts away
      }
      ctx.putImageData(id, 0, 0);
    } catch {
      // canvas tainted (no CORS) — keep the plain avatar already drawn
    }
  };
  img.src = `https://avatars.githubusercontent.com/${USERNAME}`;
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

    data.contributions.forEach((day, i) => {
      const cell = document.createElement('div');
      cell.className = `cell level-${day.level}`;
      cell.title = `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`;
      // align the first column to the correct weekday
      if (i === 0) cell.style.gridRow = new Date(day.date).getUTCDay() + 1;
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

loadAvatar();
loadContributions();
loadProfile();
loadRepos();
