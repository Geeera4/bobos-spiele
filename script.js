(() => {
  const COLORS = {
    blau:    { label: "Blau",    adjective: "blaue",         css: "#1769e0" },
    rot:     { label: "Rot",     adjective: "rote",          css: "#e3342f" },
    grün:    { label: "Grün",    adjective: "grüne",         css: "#179447" },
    weiß:    { label: "Weiß",    adjective: "weiße",         css: "#ffffff" },
    schwarz: { label: "Schwarz", adjective: "schwarze",      css: "#191919" },
    pink:    { label: "Pink",    adjective: "pinke",         css: "#f05aa6" },
    violett: { label: "Violett", adjective: "violette",      css: "#7d4bd1" },
    orange:  { label: "Orange",  adjective: "orangefarbene", css: "#f28c28" }
  };

  const colorKeys = Object.keys(COLORS);
  const instructionText = document.getElementById("instructionText");
  const feedback = document.querySelector(".feedback");
  const feedbackIcon = document.getElementById("feedbackIcon");
  const feedbackTitle = document.getElementById("feedbackTitle");
  const feedbackText = document.getElementById("feedbackText");
  const statsEl = document.getElementById("stats");
  const colorButtons = [...document.querySelectorAll(".color-button")];
  const speechButton = document.getElementById("speechButton");
  const boboButton = document.getElementById("boboButton");
  const boboImage = document.querySelector(".bobo");
  const resetButton = document.getElementById("resetButton");

  const STORAGE_KEY = "bobos-farbenspiel-progress-v2";
  let target = "blau";
  let locked = false;
  let nextTimer = null;

  const emptyStats = () => Object.fromEntries(
    colorKeys.map(key => [key, { correct: 0, wrong: 0, shown: 0 }])
  );

  let stats = loadStats();

  function loadStats() {
    try {
      // Zuerst neue Statistik laden, ansonsten alte 5-Farben-Statistik übernehmen.
      const raw = localStorage.getItem(STORAGE_KEY) ||
                  localStorage.getItem("bobos-farbenspiel-progress-v1");
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object") return emptyStats();

      const clean = emptyStats();
      for (const key of colorKeys) {
        if (parsed[key]) {
          clean[key].correct = Math.max(0, Number(parsed[key].correct) || 0);
          clean[key].wrong = Math.max(0, Number(parsed[key].wrong) || 0);
          clean[key].shown = Math.max(0, Number(parsed[key].shown) || 0);
        }
      }
      return clean;
    } catch {
      return emptyStats();
    }
  }

  function saveStats() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Das Spiel funktioniert auch ohne gespeicherten Fortschritt.
    }
  }

  function speak(text, onEnd) {
    if (!("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.92;
    utterance.pitch = 1.08;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const germanVoices = voices.filter(v => /^de(-|_)/i.test(v.lang));

    // Wenn möglich eine deutsche Stimme wählen; sonst entscheidet der Browser.
    if (germanVoices.length) {
      const preferred = germanVoices.find(v =>
        /anna|katja|petra|sophie|female|frau/i.test(v.name)
      );
      utterance.voice = preferred || germanVoices[0];
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  function promptSentence() {
    return `Tippe auf das ${COLORS[target].adjective} Feld.`;
  }

  function speakPrompt() {
    speak(promptSentence());
  }

  function doBoboSalto() {
    if (!boboImage) return;

    boboImage.classList.remove("salto");
    // Reflow erzwingen, damit die Animation auch bei mehreren Erfolgen neu startet.
    void boboImage.offsetWidth;
    boboImage.classList.add("salto");

    boboImage.addEventListener("animationend", () => {
      boboImage.classList.remove("salto");
    }, { once: true });
  }

  function weightedNextColor(previous) {
    const weights = colorKeys.map(key => {
      const s = stats[key];

      // Farben mit Fehlern oder wenig Übung kommen häufiger dran.
      const errorWeight = 1 + s.wrong * 1.8;
      const lowPracticeWeight = 1 + Math.max(0, 3 - s.shown) * 0.8;
      const successDiscount = 1 / (1 + s.correct * 0.18);
      const repeatPenalty = key === previous ? 0.28 : 1;

      return Math.max(
        0.15,
        errorWeight * lowPracticeWeight * successDiscount * repeatPenalty
      );
    });

    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;

    for (let i = 0; i < colorKeys.length; i++) {
      r -= weights[i];
      if (r <= 0) return colorKeys[i];
    }

    return colorKeys[0];
  }

  function setNewRound({ speakNow = false } = {}) {
    const previous = target;
    target = weightedNextColor(previous);
    stats[target].shown += 1;
    saveStats();

    instructionText.textContent = promptSentence();
    feedback.className = "feedback";
    feedbackIcon.textContent = "";
    feedbackTitle.textContent = "";
    feedbackText.textContent = "";

    colorButtons.forEach(btn => btn.classList.remove("correct", "wrong"));
    locked = false;
    renderStats();

    if (speakNow) speakPrompt();
  }

  function handleColorClick(event) {
    if (locked) return;

    const button = event.currentTarget;
    const chosen = button.dataset.color;

    if (chosen === target) {
      locked = true;
      stats[target].correct += 1;
      saveStats();

      button.classList.add("correct");
      doBoboSalto();

      feedback.className = "feedback good";
      feedbackIcon.textContent = "✓";
      feedbackTitle.textContent = "Richtig!";
      feedbackText.textContent = `Das ist ${COLORS[target].label}.`;
      renderStats();

      const sentence = `Super! Richtig. Das ist ${COLORS[target].label}.`;
      speak(sentence, () => {
        clearTimeout(nextTimer);
        nextTimer = setTimeout(() => setNewRound({ speakNow: true }), 450);
      });
    } else {
      stats[target].wrong += 1;
      saveStats();

      button.classList.add("wrong");

      feedback.className = "feedback bad";
      feedbackIcon.textContent = "↻";
      feedbackTitle.textContent = "Noch einmal.";
      feedbackText.textContent =
        `Das war ${COLORS[chosen].label}. Gesucht ist ${COLORS[target].label}.`;
      renderStats();

      speak(`Fast. Das war ${COLORS[chosen].label}. Suche ${COLORS[target].label}.`);
    }
  }

  function renderStats() {
    statsEl.innerHTML = "";

    for (const key of colorKeys) {
      const row = document.createElement("div");
      row.className = "stat-row";

      const name = document.createElement("div");
      name.className = "stat-name";

      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = COLORS[key].css;

      const label = document.createElement("span");
      label.textContent = COLORS[key].label;

      const correct = document.createElement("span");
      correct.textContent = String(stats[key].correct);

      const wrong = document.createElement("span");
      wrong.textContent = String(stats[key].wrong);

      name.append(swatch, label);
      row.append(name, correct, wrong);
      statsEl.append(row);
    }
  }

  function resetProgress() {
    clearTimeout(nextTimer);
    window.speechSynthesis?.cancel();

    stats = emptyStats();
    saveStats();
    renderStats();

    feedback.className = "feedback";
    feedbackIcon.textContent = "";
    feedbackTitle.textContent = "";
    feedbackText.textContent = "";

    setNewRound({ speakNow: true });
  }

  colorButtons.forEach(button =>
    button.addEventListener("click", handleColorClick)
  );

  speechButton.addEventListener("click", speakPrompt);
  boboButton.addEventListener("click", speakPrompt);
  resetButton.addEventListener("click", resetProgress);

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  setNewRound();
})();
