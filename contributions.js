const USERNAME = 'tsuskov';

async function loadContributions() {
  const graph = document.getElementById('contrib-graph');
  try {
    const res  = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();

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

loadContributions();
