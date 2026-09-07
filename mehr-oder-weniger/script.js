(() => {
  const BOBO_POSES = [
    "bobos/bobo_pose_01.png",
    "bobos/bobo_pose_02.png",
    "bobos/bobo_pose_03.png",
    "bobos/bobo_pose_04.png",
    "bobos/bobo_pose_05.png",
    "bobos/bobo_pose_06.png",
    "bobos/bobo_pose_07.png",
    "bobos/bobo_pose_08.png",
    "bobos/bobo_pose_09.png",
    "bobos/bobo_pose_10.png"
  ];

  const QUESTIONS = {
    mehr: { label: "mehr", prompt: "Wo hat es mehr Bobos?", pick: (a, b) => (a > b ? "left" : "right") },
    weniger: { label: "weniger", prompt: "Wo hat es weniger Bobos?", pick: (a, b) => (a < b ? "left" : "right") }
  };

  const instructionText = document.getElementById("instructionText");
  const speechButton = document.getElementById("speechButton");
  const leftSide = document.getElementById("leftSide");
  const rightSide = document.getElementById("rightSide");
  const leftGroup = document.getElementById("leftGroup");
  const rightGroup = document.getElementById("rightGroup");
  const feedback = document.querySelector(".feedback");
  const feedbackIcon = document.getElementById("feedbackIcon");
  const feedbackTitle = document.getElementById("feedbackTitle");
  const feedbackText = document.getElementById("feedbackText");
  const statsEl = document.getElementById("stats");
  const resetButton = document.getElementById("resetButton");
  const statsLinkButton = document.getElementById("statsLinkButton");
  const adminLinkButton = document.getElementById("adminLinkButton");
  const statsDialog = document.getElementById("statsDialog");
  const adminDialog = document.getElementById("adminDialog");
  const adminForm = document.getElementById("adminForm");
  const adminCloseButton = document.getElementById("adminCloseButton");
  const maxCountInput = document.getElementById("maxCountInput");
  const maxDiffInput = document.getElementById("maxDiffInput");
  const maxCountValue = document.getElementById("maxCountValue");
  const maxDiffValue = document.getElementById("maxDiffValue");

  const STORAGE_KEY = "bobos-mehr-oder-weniger-progress-v1";
  const SETTINGS_KEY = "bobos-mehr-oder-weniger-settings-v1";
  const DEFAULT_SETTINGS = { maxCount: 10, maxDifference: 10 };

  let locked = false;
  let round = null;
  let nextTimer = null;

  const emptyStats = () => Object.fromEntries(
    Object.keys(QUESTIONS).map(key => [key, { correct: 0, wrong: 0 }])
  );

  let stats = loadStats();
  let settings = loadSettings();

  function loadStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object") return emptyStats();

      const clean = emptyStats();
      for (const key of Object.keys(QUESTIONS)) {
        if (parsed[key]) {
          clean[key].correct = Math.max(0, Number(parsed[key].correct) || 0);
          clean[key].wrong = Math.max(0, Number(parsed[key].wrong) || 0);
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

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object") return { ...DEFAULT_SETTINGS };

      const maxCount = clamp(Math.round(Number(parsed.maxCount)) || DEFAULT_SETTINGS.maxCount, 2, 20);
      const maxDifference = clamp(Math.round(Number(parsed.maxDifference)) || DEFAULT_SETTINGS.maxDifference, 1, maxCount - 1);
      return { maxCount, maxDifference };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Die Einstellungen werden dann nicht dauerhaft gespeichert.
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function randomPose() {
    return BOBO_POSES[randomInt(0, BOBO_POSES.length - 1)];
  }

  function generateCounts() {
    const { maxCount, maxDifference } = settings;

    for (let i = 0; i < 200; i++) {
      const a = randomInt(1, maxCount);
      const b = randomInt(1, maxCount);
      if (a !== b && Math.abs(a - b) <= maxDifference) return [a, b];
    }

    // Fallback, falls die Zufallsversuche kein gültiges Paar finden.
    const a = randomInt(1, maxCount);
    const diff = Math.max(1, Math.min(maxDifference, maxCount - 1));
    let b = a + (Math.random() < 0.5 ? -diff : diff);
    b = clamp(b, 1, maxCount);
    if (b === a) b = a === maxCount ? a - 1 : a + 1;
    return [a, b];
  }

  function renderGroup(container, count) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const img = document.createElement("img");
      img.src = randomPose();
      img.alt = "";
      img.className = "bobo-icon";
      container.append(img);
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

  function speakPrompt() {
    if (round) speak(QUESTIONS[round.question].prompt);
  }

  function setNewRound({ speakNow = false } = {}) {
    const [leftCount, rightCount] = generateCounts();
    const questionKey = Math.random() < 0.5 ? "mehr" : "weniger";

    round = { leftCount, rightCount, question: questionKey };

    renderGroup(leftGroup, leftCount);
    renderGroup(rightGroup, rightCount);

    instructionText.textContent = QUESTIONS[questionKey].prompt;
    feedback.className = "feedback";
    feedbackIcon.textContent = "";
    feedbackTitle.textContent = "";
    feedbackText.textContent = "";

    leftSide.classList.remove("correct", "wrong");
    rightSide.classList.remove("correct", "wrong");
    locked = false;

    if (speakNow) speakPrompt();
  }

  function handleSideClick(event) {
    if (locked || !round) return;

    const chosenSide = event.currentTarget.dataset.side;
    const correctSide = QUESTIONS[round.question].pick(round.leftCount, round.rightCount);
    const chosenButton = chosenSide === "left" ? leftSide : rightSide;
    const correctButton = correctSide === "left" ? leftSide : rightSide;

    if (chosenSide === correctSide) {
      locked = true;
      stats[round.question].correct += 1;
      saveStats();
      renderStats();

      chosenButton.classList.add("correct");

      feedback.className = "feedback good";
      feedbackIcon.textContent = "✓";
      feedbackTitle.textContent = "Richtig!";
      feedbackText.textContent = `Links: ${round.leftCount}, Rechts: ${round.rightCount}.`;

      speak(`Richtig! Links hat es ${round.leftCount}, rechts hat es ${round.rightCount}.`, () => {
        clearTimeout(nextTimer);
        nextTimer = setTimeout(() => setNewRound({ speakNow: true }), 450);
      });
    } else {
      stats[round.question].wrong += 1;
      saveStats();
      renderStats();

      chosenButton.classList.add("wrong");
      correctButton.classList.add("correct");

      feedback.className = "feedback bad";
      feedbackIcon.textContent = "↻";
      feedbackTitle.textContent = "Noch einmal.";
      feedbackText.textContent = `Links: ${round.leftCount}, Rechts: ${round.rightCount}.`;

      speak(`Fast. Links hat es ${round.leftCount}, rechts hat es ${round.rightCount}.`);
    }
  }

  function renderStats() {
    statsEl.innerHTML = "";

    for (const key of Object.keys(QUESTIONS)) {
      const row = document.createElement("div");
      row.className = "stat-row";

      const label = document.createElement("div");
      label.className = "stat-name";
      label.textContent = `Wo ist ${QUESTIONS[key].label}?`;

      const correct = document.createElement("span");
      correct.textContent = String(stats[key].correct);

      const wrong = document.createElement("span");
      wrong.textContent = String(stats[key].wrong);

      row.append(label, correct, wrong);
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

  function renderAdminForm() {
    maxCountInput.value = settings.maxCount;
    maxDiffInput.max = settings.maxCount - 1;
    maxDiffInput.value = settings.maxDifference;
    maxCountValue.textContent = settings.maxCount;
    maxDiffValue.textContent = settings.maxDifference;
  }

  maxCountInput.addEventListener("input", () => {
    const maxCount = Number(maxCountInput.value);
    maxCountValue.textContent = maxCount;

    const maxAllowedDiff = maxCount - 1;
    maxDiffInput.max = maxAllowedDiff;
    if (Number(maxDiffInput.value) > maxAllowedDiff) {
      maxDiffInput.value = maxAllowedDiff;
    }
    maxDiffValue.textContent = maxDiffInput.value;
  });

  maxDiffInput.addEventListener("input", () => {
    maxDiffValue.textContent = maxDiffInput.value;
  });

  leftSide.addEventListener("click", handleSideClick);
  rightSide.addEventListener("click", handleSideClick);
  speechButton.addEventListener("click", speakPrompt);
  resetButton.addEventListener("click", resetProgress);

  statsLinkButton.addEventListener("click", () => {
    renderStats();
    statsDialog.showModal();
  });

  adminLinkButton.addEventListener("click", () => {
    renderAdminForm();
    adminDialog.showModal();
  });

  adminCloseButton.addEventListener("click", () => adminDialog.close());

  adminForm.addEventListener("submit", event => {
    event.preventDefault();

    settings = {
      maxCount: clamp(Number(maxCountInput.value), 2, 20),
      maxDifference: clamp(Number(maxDiffInput.value), 1, Number(maxCountInput.value) - 1)
    };
    saveSettings();
    adminDialog.close();
    setNewRound({ speakNow: false });
  });

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  renderStats();
  setNewRound();
})();
