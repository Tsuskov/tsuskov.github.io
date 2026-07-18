/* EN/DE switch. Static text lives here keyed by data-i18n; dynamic text
   (contributions.js, favorites.js) re-renders on the "langchange" event. */
(() => {
  const DICT = {
    "nav.contributions": ["contributions", "beiträge"],
    "nav.featured": ["featured", "ausgewählt"],
    "nav.repos": ["repos", "repos"],
    "nav.writing": ["writing", "texte"],
    "nav.songs": ["songs", "songs"],
    "nav.favorites": ["favorites", "favoriten"],
    "nav.play": ["play", "spiel"],
    "title.contributions": ["Contributions", "Beiträge"],
    "title.featured": ["Featured", "Ausgewählt"],
    "title.repos": ["Repositories", "Repositories"],
    "title.writing": ["Writing", "Texte"],
    "title.songs": ["Songs", "Songs"],
    "title.favorites": ["Favorites", "Favoriten"],
    "title.play": ["Play", "Spiel"],
    "featured.homeros": [
      "An LLM that runs entirely in your browser. I built every stage myself in Rust — Cadmus tokenizes, Hephaistos trains, Talos runs inference — and compiled it to wasm, so nothing leaves your machine.",
      "Ein LLM, das komplett im Browser läuft. Jede Stufe habe ich selbst in Rust gebaut — Cadmus tokenisiert, Hephaistos trainiert, Talos macht die Inferenz — und zu wasm kompiliert, nichts verlässt deinen Rechner.",
    ],
    "writing.argus.title": [
      "I gave AI agents a flight recorder",
      "Ich habe AI-Agents einen Flugschreiber gebaut",
    ],
    "writing.argus.desc": [
      "Argus shows live what an AI agent touches on your Mac. In one real Claude Code session it logged 299 file accesses, 61 processes and 3 keychain reads.",
      "Argus zeigt live, was ein AI-Agent auf deinem Mac anfasst. In einer echten Claude-Code-Session waren es 299 Dateizugriffe, 61 Prozesse und 3 Keychain-Zugriffe. (Post auf Englisch)",
    ],
    "writing.talos.title": [
      "I built the whole LLM stack from scratch in Rust",
      "Ich habe den ganzen LLM-Stack from scratch in Rust gebaut",
    ],
    "writing.talos.desc": [
      "Tokenizer training, backprop by hand, Metal kernels and RAG, all written myself — and it runs in the browser.",
      "Tokenizer-Training, Backprop von Hand, Metal-Kernels und RAG, alles selbst geschrieben — und es läuft im Browser. (Post auf Englisch)",
    ],
    "fav.label.neutrino": ["Electron neutrino", "Elektron-Neutrino"],
    "fav.label.titanium": ["Titanium", "Titan"],
    "songs.sub": ["On repeat lately.", "Läuft gerade rauf und runter."],
    "play.sub": [
      "Reflex — tap the lit square. 15 seconds.",
      "Reflex — tipp das leuchtende Feld. 15 Sekunden.",
    ],
  };

  let lang =
    localStorage.getItem("lang") ||
    ((navigator.language || "").startsWith("de") ? "de" : "en");

  const btn = document.getElementById("lang-toggle");

  function apply() {
    document.documentElement.lang = lang;
    const i = lang === "de" ? 1 : 0;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const entry = DICT[el.dataset.i18n];
      if (entry) el.textContent = entry[i];
    });
    btn.textContent = lang === "de" ? "EN" : "DE";
    document.dispatchEvent(new CustomEvent("langchange"));
  }

  btn.addEventListener("click", () => {
    lang = lang === "de" ? "en" : "de";
    localStorage.setItem("lang", lang);
    apply();
  });

  apply();
})();
