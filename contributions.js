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

loadContributions();
loadProfile();
loadRepos();
