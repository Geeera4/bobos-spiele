(() => {
  const ITEMS = [
    { key: "pfanne", artikel: "die", label: "Pfanne", room: "kueche", img: "03_pfanne.png" },
    { key: "kochtopf", artikel: "der", label: "Kochtopf", room: "kueche", img: "04_kochtopf.png" },
    { key: "teller", artikel: "der", label: "Teller", room: "kueche", img: "05_teller.png" },
    { key: "tasse", artikel: "die", label: "Tasse", room: "kueche", img: "06_tasse.png" },
    { key: "messer", artikel: "das", label: "Messer", room: "kueche", img: "07_messer.png" },
    { key: "schneidebrett", artikel: "das", label: "Schneidebrett", room: "kueche", img: "08_schneidebrett.png" },
    { key: "kochloeffel", artikel: "der", label: "Kochlöffel", room: "kueche", img: "09_kochloeffel.png" },
    { key: "sieb", artikel: "das", label: "Sieb", room: "kueche", img: "10_sieb.png" },
    { key: "zahnbuerste", artikel: "die", label: "Zahnbürste", room: "bad", img: "11_zahnbuerste.png" },
    { key: "zahnpasta", artikel: "die", label: "Zahnpasta", room: "bad", img: "12_zahnpasta.png" },
    { key: "handtuch", artikel: "das", label: "Handtuch", room: "bad", img: "13_handtuch.png" },
    { key: "seife", artikel: "die", label: "Seife", room: "bad", img: "14_seife.png" },
    { key: "shampoo", artikel: "das", label: "Shampoo", room: "bad", img: "15_shampoo.png" },
    { key: "badeente", artikel: "die", label: "Badeente", room: "bad", img: "16_badeente.png" },
    { key: "toilettenpapier", artikel: "das", label: "Toilettenpapier", room: "bad", img: "17_toilettenpapier.png" },
    { key: "haarbuerste", artikel: "die", label: "Haarbürste", room: "bad", img: "18_haarbuerste.png" }
  ];

  const ROOMS = {
    kueche: { label: "Küche", into: "in die Küche" },
    bad: { label: "Bad", into: "ins Bad" }
  };

  const itemEl = document.getElementById("item");
  const zoneKueche = document.getElementById("zoneKueche");
  const zoneBad = document.getElementById("zoneBad");
  const zones = { kueche: zoneKueche, bad: zoneBad };
  const instructionText = document.getElementById("instructionText");
  const feedback = document.querySelector(".feedback");
  const feedbackIcon = document.getElementById("feedbackIcon");
  const feedbackTitle = document.getElementById("feedbackTitle");
  const feedbackText = document.getElementById("feedbackText");
  const speechButton = document.getElementById("speechButton");
  const boboButton = document.getElementById("boboButton");
  const boboImage = document.querySelector(".bobo");

  let current = null;
  let previousKey = null;
  let locked = false;
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dy = 0;
  let nextTimer = null;

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

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function promptSentence(entry) {
    return `Wohin gehört ${entry.artikel} ${entry.label}?`;
  }

  function correctSentence(entry) {
    return `Richtig! ${capitalize(entry.artikel)} ${entry.label} gehört ${ROOMS[entry.room].into}.`;
  }

  function wrongSentence(entry) {
    return `Nein. ${capitalize(entry.artikel)} ${entry.label} gehört ${ROOMS[entry.room].into}.`;
  }

  function doBoboSalto() {
    if (!boboImage) return;

    // Bobo-Lachen gleichzeitig mit dem Salto abspielen (gemeinsame Assets aus dem Farbenspiel).
    const laugh = new Audio("../farbenspiel/bobo-lachen.mp3?v=8");
    laugh.volume = 1;
    laugh.play().catch(() => {
      // Falls der Browser Audio blockiert, läuft die Animation trotzdem.
    });

    document.querySelectorAll(".bobo-salto-overlay").forEach(el => el.remove());

    const clone = boboImage.cloneNode(true);
    clone.removeAttribute("id");
    clone.classList.remove("bobo");
    clone.classList.add("bobo-salto-overlay");
    clone.setAttribute("aria-hidden", "true");

    document.body.appendChild(clone);

    clone.addEventListener("animationend", () => clone.remove(), { once: true });

    // Fallback, falls animationend nicht ausgelöst wird.
    setTimeout(() => clone.remove(), 1200);
  }

  function pickNextItem() {
    const choices = ITEMS.filter(entry => entry.key !== previousKey);
    const pool = choices.length ? choices : ITEMS;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function resetItemPosition() {
    dx = 0;
    dy = 0;
    itemEl.style.transform = "translate(-50%, -50%)";
  }

  function clearZoneStates() {
    for (const el of Object.values(zones)) {
      el.classList.remove("hover", "hover-correct", "hover-wrong");
    }
  }

  function setNewRound({ speakNow = false } = {}) {
    clearTimeout(nextTimer);

    current = pickNextItem();
    previousKey = current.key;

    itemEl.style.backgroundImage = `url("${current.img}")`;
    itemEl.setAttribute("aria-label", `${current.label}, zum Wiederholen antippen`);
    itemEl.classList.remove("correct", "wrong");
    resetItemPosition();
    clearZoneStates();

    instructionText.textContent = promptSentence(current);
    feedback.className = "feedback";
    feedbackIcon.textContent = "";
    feedbackTitle.textContent = "";
    feedbackText.textContent = "";

    locked = false;

    if (speakNow) speak(promptSentence(current));
  }

  function rectContainsPoint(rect, x, y) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function detectZone() {
    const r = itemEl.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    for (const [key, el] of Object.entries(zones)) {
      if (rectContainsPoint(el.getBoundingClientRect(), cx, cy)) return key;
    }
    return null;
  }

  function updateHoverState() {
    const zoneKey = detectZone();
    for (const [key, el] of Object.entries(zones)) {
      el.classList.toggle("hover", key === zoneKey);
    }
  }

  function snapBack() {
    itemEl.classList.add("snap-back");
    resetItemPosition();
    setTimeout(() => itemEl.classList.remove("snap-back"), 220);
  }

  function handleDrop(zoneKey) {
    locked = true;
    const zoneEl = zones[zoneKey];

    if (zoneKey === current.room) {
      itemEl.classList.add("correct");
      zoneEl.classList.add("hover-correct");
      doBoboSalto();

      feedback.className = "feedback good";
      feedbackIcon.textContent = "✓";
      feedbackTitle.textContent = "Richtig!";
      feedbackText.textContent =
        `${capitalize(current.artikel)} ${current.label} gehört ${ROOMS[current.room].into}.`;

      speak(correctSentence(current), () => {
        clearTimeout(nextTimer);
        nextTimer = setTimeout(() => setNewRound({ speakNow: true }), 450);
      });
    } else {
      itemEl.classList.add("wrong");
      zoneEl.classList.add("hover-wrong");

      feedback.className = "feedback bad";
      feedbackIcon.textContent = "↻";
      feedbackTitle.textContent = "Noch einmal.";
      feedbackText.textContent =
        `${capitalize(current.artikel)} ${current.label} gehört ${ROOMS[current.room].into}.`;

      speak(wrongSentence(current));

      setTimeout(() => {
        itemEl.classList.remove("wrong");
        zoneEl.classList.remove("hover-wrong");
        snapBack();
        locked = false;
      }, 900);
    }
  }

  function handlePointerDown(event) {
    if (locked) return;

    dragging = true;
    moved = false;
    itemEl.setPointerCapture(event.pointerId);
    itemEl.classList.add("dragging");

    startX = event.clientX - dx;
    startY = event.clientY - dy;

    // Jedes Mal, wenn der Gegenstand angefasst wird, wird er laut genannt.
    speak(promptSentence(current));
  }

  function handlePointerMove(event) {
    if (!dragging) return;

    const nx = event.clientX - startX;
    const ny = event.clientY - startY;

    if (Math.abs(nx - dx) > 3 || Math.abs(ny - dy) > 3) moved = true;

    dx = nx;
    dy = ny;
    itemEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    updateHoverState();
  }

  function handlePointerUp() {
    if (!dragging) return;

    dragging = false;
    itemEl.classList.remove("dragging");
    zoneKueche.classList.remove("hover");
    zoneBad.classList.remove("hover");

    if (!moved) return;

    const zoneKey = detectZone();
    if (zoneKey) {
      handleDrop(zoneKey);
    } else {
      snapBack();
    }
  }

  function handlePointerCancel() {
    if (!dragging) return;

    dragging = false;
    itemEl.classList.remove("dragging");
    clearZoneStates();
    snapBack();
  }

  itemEl.addEventListener("pointerdown", handlePointerDown);
  itemEl.addEventListener("pointermove", handlePointerMove);
  itemEl.addEventListener("pointerup", handlePointerUp);
  itemEl.addEventListener("pointercancel", handlePointerCancel);

  itemEl.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      speak(promptSentence(current));
    }
  });

  speechButton.addEventListener("click", () => speak(promptSentence(current)));
  boboButton.addEventListener("click", () => speak(promptSentence(current)));

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  setNewRound();
})();
