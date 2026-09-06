(() => {
  const COLORS = {
    blau:    { label: "Blau",    css: "#1769e0", file: "blau" },
    rot:     { label: "Rot",     css: "#e3342f", file: "rot" },
    grün:    { label: "Grün",    css: "#179447", file: "gruen" },
    weiß:    { label: "Weiß",    css: "#ffffff", file: "weiss" },
    schwarz: { label: "Schwarz", css: "#191919", file: "schwarz" }
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
  const resetButton = document.getElementById("resetButton");

  const STORAGE_KEY = "bobos-farbenspiel-progress-v1";
  let target = "blau";
  let locked = false;
  let nextTimer = null;
  let currentAudio = null;

  const emptyStats = () => Object.fromEntries(
    colorKeys.map(key => [key, { correct: 0, wrong: 0, shown: 0 }])
  );

  let stats = loadStats();

  function loadStats() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
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

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function browserSpeech(text, onEnd) {
    if (!("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.92;
    utterance.pitch = 1.12;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const german = voices.find(v => /^de(-|_)/i.test(v.lang));
    if (german) utterance.voice = german;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  }

  function playClip(filename, fallbackText, onEnd) {
    stopAudio();
    const audio = new Audio(`audio/${filename}.mp3`);
    currentAudio = audio;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      if (currentAudio === audio) currentAudio = null;
      if (onEnd) onEnd();
    };

    audio.addEventListener("ended", finish, { once: true });
    audio.addEventListener("error", () => {
      if (currentAudio === audio) currentAudio = null;
      browserSpeech(fallbackText, finish);
    }, { once: true });

    const promise = audio.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        if (currentAudio === audio) currentAudio = null;
        browserSpeech(fallbackText, finish);
      });
    }
  }

  function promptSentence() {
    return `Tippe auf das ${COLORS[target].label.toLowerCase()}e Feld.`;
  }

  function speakPrompt() {
    playClip(`prompt-${COLORS[target].file}`, promptSentence());
  }

  function weightedNextColor(previous) {
    const weights = colorKeys.map(key => {
      const s = stats[key];
      const errorWeight = 1 + s.wrong * 1.8;
      const lowPracticeWeight = 1 + Math.max(0, 3 - s.shown) * 0.8;
      const successDiscount = 1 / (1 + s.correct * 0.18);
      const repeatPenalty = key === previous ? 0.28 : 1;
      return Math.max(0.15, errorWeight * lowPracticeWeight * successDiscount * repeatPenalty);
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

      feedback.className = "feedback good";
      feedbackIcon.textContent = "✓";
      feedbackTitle.textContent = "Richtig!";
      feedbackText.textContent = `Das ist ${COLORS[target].label}.`;
      renderStats();

      const text = `Super! Richtig. Das ist ${COLORS[target].label}.`;
      playClip(`richtig-${COLORS[target].file}`, text, () => {
        clearTimeout(nextTimer);
        nextTimer = setTimeout(() => setNewRound({ speakNow: true }), 350);
      });
    } else {
      stats[target].wrong += 1;
      saveStats();
      button.classList.add("wrong");

      feedback.className = "feedback bad";
      feedbackIcon.textContent = "↻";
      feedbackTitle.textContent = "Noch einmal.";
      feedbackText.textContent = `Das war ${COLORS[chosen].label}. Gesucht ist ${COLORS[target].label}.`;
      renderStats();

      const text = `Fast. Das war ${COLORS[chosen].label}. Suche ${COLORS[target].label}.`;
      playClip(`falsch-${COLORS[chosen].file}-${COLORS[target].file}`, text);
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
    stopAudio();
    stats = emptyStats();
    saveStats();
    renderStats();
    feedback.className = "feedback";
    feedbackIcon.textContent = "";
    feedbackTitle.textContent = "";
    feedbackText.textContent = "";
    setNewRound({ speakNow: true });
  }

  colorButtons.forEach(button => button.addEventListener("click", handleColorClick));
  speechButton.addEventListener("click", speakPrompt);
  boboButton.addEventListener("click", speakPrompt);
  resetButton.addEventListener("click", resetProgress);

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  setNewRound();
})();
