(() => {
  const ITEMS = [
    { id: "ball", label: "Ball", article: "der", emoji: "⚽", target: "spielzeug" },
    { id: "teddy", label: "Teddy", article: "der", emoji: "🧸", target: "spielzeug" },
    { id: "apfel", label: "Apfel", article: "der", emoji: "🍎", target: "obst" },
    { id: "zahnbuerste", label: "Zahnbürste", article: "die", emoji: "🪥", target: "bad" },
    { id: "schuh", label: "Schuh", article: "der", emoji: "👟", target: "schuhregal" }
  ];

  const TARGETS = {
    spielzeug: { label: "Spielzeugkiste", emoji: "📦" },
    obst: { label: "Obstkorb", emoji: "🧺" },
    bad: { label: "Badezimmer", emoji: "🚿" },
    schuhregal: { label: "Schuhregal", emoji: "👞" }
  };

  const ROUND_SIZE = 3;
  const CELEBRATE_EVERY = 5;

  const instructionText = document.getElementById("instructionText");
  const feedback = document.querySelector(".feedback");
  const feedbackIcon = document.getElementById("feedbackIcon");
  const feedbackTitle = document.getElementById("feedbackTitle");
  const feedbackText = document.getElementById("feedbackText");
  const itemsSection = document.getElementById("itemsSection");
  const targetsSection = document.getElementById("targetsSection");
  const speechButton = document.getElementById("speechButton");
  const boboButton = document.getElementById("boboButton");
  const boboImage = document.querySelector(".bobo");
  const restartButton = document.getElementById("restartButton");
  const celebration = document.getElementById("celebration");
  const playAgainButton = document.getElementById("playAgainButton");

  let currentItems = [];
  let currentTargetIds = [];
  let askedItem = null;
  let selectedItem = null;
  let locked = false;
  let successCount = 0;
  let nextTimer = null;
  let shakeTimer = null;
  let successAudio = null;

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function pronounFor(article) {
    if (article === "die") return "sie";
    if (article === "das") return "es";
    return "er";
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

  function playSuccessSound() {
    if (successAudio) {
      successAudio.pause();
      successAudio.currentTime = 0;
    }
    successAudio = new Audio("bobo-lachen.mp3?v=1");
    successAudio.volume = 1;
    successAudio.play().catch(() => {
      // Falls der Browser Audio blockiert, läuft die Animation trotzdem.
    });
  }

  function doBoboSalto() {
    if (!boboImage) return;

    document.querySelectorAll(".bobo-salto-overlay").forEach(el => el.remove());

    const clone = boboImage.cloneNode(true);
    clone.removeAttribute("id");
    clone.classList.remove("bobo");
    clone.classList.add("bobo-salto-overlay");
    clone.setAttribute("aria-hidden", "true");

    document.body.appendChild(clone);

    clone.addEventListener("animationend", () => clone.remove(), { once: true });
    setTimeout(() => clone.remove(), 1200);
  }

  function promptSentence() {
    if (selectedItem) {
      return `Wohin gehört ${selectedItem.article} ${selectedItem.label}?`;
    }
    return `Wo ist ${askedItem.article} ${askedItem.label}?`;
  }

  function speakCurrentPrompt() {
    speak(promptSentence());
  }

  function resetFeedback() {
    feedback.className = "feedback";
    feedbackIcon.textContent = "";
    feedbackTitle.textContent = "";
    feedbackText.textContent = "";
  }

  function pickRoundItems() {
    return shuffle([...ITEMS]).slice(0, ROUND_SIZE);
  }

  function uniqueTargetIds(items) {
    const ids = [];
    items.forEach(item => {
      if (!ids.includes(item.target)) ids.push(item.target);
    });
    return shuffle(ids);
  }

  function renderRound() {
    itemsSection.innerHTML = "";
    currentItems.forEach(item => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "item-button";
      btn.dataset.id = item.id;
      btn.setAttribute("aria-label", item.label);
      btn.innerHTML =
        `<span class="item-emoji" aria-hidden="true">${item.emoji}</span>` +
        `<span class="item-label">${item.label}</span>`;
      btn.addEventListener("click", () => handleItemClick(item, btn));
      itemsSection.append(btn);
    });

    targetsSection.innerHTML = "";
    currentTargetIds.forEach(id => {
      const t = TARGETS[id];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "target-button";
      btn.dataset.id = id;
      btn.disabled = true;
      btn.setAttribute("aria-label", t.label);
      btn.innerHTML =
        `<span class="target-emoji" aria-hidden="true">${t.emoji}</span>` +
        `<span class="target-label">${t.label}</span>`;
      btn.addEventListener("click", () => handleTargetClick(id, btn));
      targetsSection.append(btn);
    });
  }

  function setNewRound({ speakNow = false } = {}) {
    clearTimeout(nextTimer);
    clearTimeout(shakeTimer);

    selectedItem = null;
    locked = false;

    currentItems = pickRoundItems();
    currentTargetIds = uniqueTargetIds(currentItems);
    askedItem = currentItems[Math.floor(Math.random() * currentItems.length)];

    renderRound();
    resetFeedback();
    instructionText.textContent = promptSentence();

    if (speakNow) speakCurrentPrompt();
  }

  function shakeButton(btn) {
    btn.classList.add("wrong-shake");
    locked = true;
    clearTimeout(shakeTimer);
    shakeTimer = setTimeout(() => {
      btn.classList.remove("wrong-shake");
      locked = false;
    }, 500);
  }

  function handleItemClick(item, btn) {
    if (locked || selectedItem) return;

    if (item.id === askedItem.id) {
      selectedItem = item;
      btn.classList.add("selected");

      itemsSection.querySelectorAll(".item-button").forEach(b => {
        b.disabled = true;
        if (b !== btn) b.classList.add("dimmed");
      });

      targetsSection.querySelectorAll(".target-button").forEach(b => {
        b.disabled = false;
        b.classList.add("active");
      });

      resetFeedback();
      instructionText.textContent = promptSentence();
      speak(`Genau, das ist ${item.article} ${item.label}! Wohin gehört ${pronounFor(item.article)}?`);
    } else {
      feedback.className = "feedback bad";
      feedbackIcon.textContent = "↻";
      feedbackTitle.textContent = "Noch einmal.";
      feedbackText.textContent = `Das ist ${item.article} ${item.label}. Gesucht ist ${askedItem.article} ${askedItem.label}.`;
      speak(`Das ist ${item.article} ${item.label}. Gesucht ist ${askedItem.article} ${askedItem.label}.`);
      shakeButton(btn);
    }
  }

  function handleTargetClick(id, btn) {
    if (locked || !selectedItem) return;

    if (id === selectedItem.target) {
      locked = true;
      btn.classList.add("correct");
      doBoboSalto();
      playSuccessSound();

      feedback.className = "feedback good";
      feedbackIcon.textContent = "✓";
      feedbackTitle.textContent = "Richtig!";
      feedbackText.textContent = `${selectedItem.article} ${selectedItem.label} ist jetzt aufgeräumt.`;

      successCount += 1;

      speak(`Super gemacht! ${selectedItem.article} ${selectedItem.label} ist jetzt aufgeräumt.`, () => {
        clearTimeout(nextTimer);
        nextTimer = setTimeout(() => {
          if (successCount > 0 && successCount % CELEBRATE_EVERY === 0) {
            showCelebration();
          } else {
            setNewRound({ speakNow: true });
          }
        }, 500);
      });
    } else {
      feedback.className = "feedback bad";
      feedbackIcon.textContent = "↻";
      feedbackTitle.textContent = "Fast!";
      feedbackText.textContent = "Das ist nicht der richtige Platz. Versuch's noch mal.";
      speak("Das ist nicht der richtige Platz. Versuch's noch mal.");
      shakeButton(btn);
    }
  }

  function showCelebration() {
    celebration.hidden = false;
    speak("Wow, du hast toll aufgeräumt! Möchtest du noch einmal spielen?");
  }

  function hideCelebration() {
    celebration.hidden = true;
  }

  function restartGame() {
    clearTimeout(nextTimer);
    clearTimeout(shakeTimer);
    window.speechSynthesis?.cancel();
    if (successAudio) {
      successAudio.pause();
      successAudio.currentTime = 0;
    }

    successCount = 0;
    hideCelebration();
    setNewRound({ speakNow: true });
  }

  speechButton.addEventListener("click", speakCurrentPrompt);
  boboButton.addEventListener("click", speakCurrentPrompt);
  restartButton.addEventListener("click", restartGame);
  playAgainButton.addEventListener("click", () => {
    hideCelebration();
    setNewRound({ speakNow: true });
  });

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  setNewRound();
})();
