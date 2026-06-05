const output   = document.getElementById('output');
const cmdInput = document.getElementById('cmd-input');
const history  = [];
let histIdx    = -1;

const COMMANDS = {
  help: cmdHelp,
  about: cmdAbout,
  projects: cmdProjects,
  skills: cmdSkills,
  contact: cmdContact,
  clear: cmdClear,
  banner: cmdBanner,
};

function line(text = '', cls = '') {
  const el = document.createElement('div');
  if (!text) {
    el.className = 'line-blank';
  } else {
    el.className = cls || 'line-info';
    el.innerHTML = text;
  }
  output.appendChild(el);
  output.scrollTop = output.scrollHeight;
}

function cmdBanner() {
  line(`<span class="line-accent">████████╗██╗███╗   ███╗</span>`);
  line(`<span class="line-accent">╚══██╔══╝██║████╗ ████║</span>`);
  line(`<span class="line-accent">   ██║   ██║██╔████╔██║</span>`);
  line(`<span class="line-accent">   ██║   ██║██║╚██╔╝██║</span>`);
  line(`<span class="line-accent">   ██║   ██║██║ ╚═╝ ██║</span>`);
  line(`<span class="line-accent">   ╚═╝   ╚═╝╚═╝     ╚═╝</span>`);
  line();
  line(`Welcome, I'm <span class="line-accent">Tim Suskov</span> — developer & builder.`);
  line(`Type <span class="line-accent">help</span> to see available commands.`);
  line();
}

function cmdHelp() {
  line(`<span class="section-title">Available commands</span>`);
  line();
  const cmds = [
    ['about',    'Who I am'],
    ['projects', 'Things I\'ve built'],
    ['skills',   'My tech stack'],
    ['contact',  'Get in touch'],
    ['banner',   'Show the header'],
    ['clear',    'Clear the terminal'],
  ];
  for (const [cmd, desc] of cmds) {
    line(`  <span class="line-accent">${cmd.padEnd(10)}</span> ${desc}`);
  }
  line();
}

function cmdAbout() {
  line(`<span class="section-title">About</span>`);
  line();
  line(`I'm Tim — a developer who enjoys building things that are`);
  line(`both useful and a little bit fun.`);
  line();
  line(`Currently exploring systems programming, web, and machine learning.`);
  line(`Based in Germany. Open to interesting projects and collaboration.`);
  line();
}

function cmdProjects() {
  line(`<span class="section-title">Projects</span>`);
  line();

  const projects = [
    {
      name: 'tsuskov.github.io',
      desc: 'This portfolio — terminal UI + particle canvas',
      url:  'https://github.com/Tsuskov/tsuskov.github.io',
    },
    {
      name: 'Tsuskov-Leetcode',
      desc: 'LeetCode solutions and notes',
      url:  'https://github.com/Tsuskov/Tsuskov-Leetcode',
    },
    {
      name: 'gitai',
      desc: 'AI-assisted git tooling',
      url:  'https://github.com/Tsuskov/gitai',
    },
    {
      name: 'strange-attractors',
      desc: 'Visualizations of chaotic dynamical systems',
      url:  'https://github.com/Tsuskov/strange-attractors',
    },
    {
      name: 'neural networks',
      desc: 'Neural network experiments from scratch',
      url:  'https://github.com/Tsuskov/neuralNetworks',
    },
  ];

  for (const p of projects) {
    line(`  <a href="${p.url}" target="_blank" class="line-accent">${p.name}</a>`);
    line(`  <span class="line-info">  ${p.desc}</span>`);
    line();
  }
}

function cmdSkills() {
  line(`<span class="section-title">Skills & Stack</span>`);
  line();

  const groups = [
    ['Languages',   ['Go', 'Python', 'JavaScript', 'C', 'TypeScript']],
    ['Web',         ['HTML', 'CSS', 'Node.js', 'React']],
    ['ML / AI',     ['TensorFlow', 'Neural Networks', 'Data Analysis']],
    ['Tools',       ['Git', 'Linux', 'Docker', 'GitHub Actions']],
  ];

  for (const [group, tags] of groups) {
    const tagHTML = tags.map(t => `<span class="tag">${t}</span>`).join('');
    line(`  <span class="line-info">${group.padEnd(12)}</span> ${tagHTML}`);
    line();
  }
}

function cmdContact() {
  line(`<span class="section-title">Contact</span>`);
  line();
  line(`  <span class="line-info">GitHub  </span> <a href="https://github.com/Tsuskov" target="_blank">github.com/Tsuskov</a>`);
  line(`  <span class="line-info">Email   </span> <a href="mailto:tim.suskov@icloud.com">tim.suskov@icloud.com</a>`);
  line();
  line(`Feel free to reach out — I'm always up for interesting conversations.`);
  line();
}

function cmdClear() {
  output.innerHTML = '';
}

function runCommand(raw) {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return;

  line(`<span class="prompt">❯ </span><span class="line-cmd">${escapeHtml(raw)}</span>`);

  if (COMMANDS[cmd]) {
    COMMANDS[cmd]();
  } else {
    line(`<span class="line-error">command not found: ${escapeHtml(cmd)}</span> — try <span class="line-accent">help</span>`);
    line();
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

cmdInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = cmdInput.value;
    history.unshift(val);
    histIdx = -1;
    cmdInput.value = '';
    runCommand(val);
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx < history.length - 1) histIdx++;
    cmdInput.value = history[histIdx] ?? '';
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (histIdx > 0) histIdx--;
    else { histIdx = -1; cmdInput.value = ''; return; }
    cmdInput.value = history[histIdx] ?? '';
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    const partial = cmdInput.value.trim().toLowerCase();
    const match = Object.keys(COMMANDS).find(c => c.startsWith(partial));
    if (match) cmdInput.value = match;
  }
});

// Keep focus on input when clicking terminal
document.getElementById('terminal').addEventListener('click', () => cmdInput.focus());

// Boot
cmdBanner();
