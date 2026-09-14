(() => {
  const SCENES = {
    kueche: { label: "Küche", into: "in die Küche", img: "kueche/00_szenerie.png" },
    bad: { label: "Bad", into: "ins Bad", img: "bad/00_szenerie.png" },
    feuerwehr: { label: "Feuerwehr", into: "zur Feuerwehr", img: "feuerwehr/00_szenerie.png" },
    flughafen: { label: "Flughafen", into: "zum Flughafen", img: "flughafen/00_szenerie.png" },
    orchester: { label: "Orchester", into: "zum Orchester", img: "orchester/00_szenerie.png" },
    sanitaetswagen: { label: "Sanitätswagen", into: "zum Sanitätswagen", img: "sanitaetswagen/00_szenerie.png" }
  };

  const SCENE_ORDER = ["kueche", "bad", "feuerwehr", "flughafen", "orchester", "sanitaetswagen"];

  const ITEMS = [
    { key: "pfanne", artikel: "die", label: "Pfanne", scene: "kueche", img: "kueche/01_pfanne.png" },
    { key: "kochtopf", artikel: "der", label: "Kochtopf", scene: "kueche", img: "kueche/02_kochtopf.png" },
    { key: "teller", artikel: "der", label: "Teller", scene: "kueche", img: "kueche/03_teller.png" },
    { key: "tasse", artikel: "die", label: "Tasse", scene: "kueche", img: "kueche/04_tasse.png" },
    { key: "messer", artikel: "das", label: "Messer", scene: "kueche", img: "kueche/05_messer.png" },
    { key: "schneidebrett", artikel: "das", label: "Schneidebrett", scene: "kueche", img: "kueche/06_schneidebrett.png" },
    { key: "kochloeffel", artikel: "der", label: "Kochlöffel", scene: "kueche", img: "kueche/07_kochloeffel.png" },
    { key: "sieb", artikel: "das", label: "Sieb", scene: "kueche", img: "kueche/08_sieb.png" },

    { key: "zahnbuerste", artikel: "die", label: "Zahnbürste", scene: "bad", img: "bad/01_zahnbuerste.png" },
    { key: "zahnpasta", artikel: "die", label: "Zahnpasta", scene: "bad", img: "bad/02_zahnpasta.png" },
    { key: "handtuch", artikel: "das", label: "Handtuch", scene: "bad", img: "bad/03_handtuch.png" },
    { key: "seife", artikel: "die", label: "Seife", scene: "bad", img: "bad/04_seife.png" },
    { key: "shampoo", artikel: "das", label: "Shampoo", scene: "bad", img: "bad/05_shampoo.png" },
    { key: "badeente", artikel: "die", label: "Badeente", scene: "bad", img: "bad/06_badeente.png" },
    { key: "toilettenpapier", artikel: "das", label: "Toilettenpapier", scene: "bad", img: "bad/07_toilettenpapier.png" },
    { key: "haarbuerste", artikel: "die", label: "Haarbürste", scene: "bad", img: "bad/08_haarbuerste.png" },

    { key: "feuerwehrhelm", artikel: "der", label: "Feuerwehrhelm", scene: "feuerwehr", img: "feuerwehr/01_feuerwehrhelm.png" },
    { key: "schutzjacke", artikel: "die", label: "Schutzjacke", scene: "feuerwehr", img: "feuerwehr/02_schutzjacke.png" },
    { key: "feuerwehr_stiefel", artikel: "der", label: "Stiefel", scene: "feuerwehr", img: "feuerwehr/03_stiefel.png" },
    { key: "feuerwehr_handschuhe", artikel: "die", label: "Handschuhe", scene: "feuerwehr", img: "feuerwehr/04_handschuhe.png" },
    { key: "feuerwehrschlauch", artikel: "der", label: "Feuerwehrschlauch", scene: "feuerwehr", img: "feuerwehr/05_feuerwehrschlauch.png" },
    { key: "feuerloescher", artikel: "der", label: "Feuerlöscher", scene: "feuerwehr", img: "feuerwehr/06_feuerloescher.png" },
    { key: "verkehrskegel", artikel: "der", label: "Verkehrskegel", scene: "feuerwehr", img: "feuerwehr/07_verkehrskegel.png" },
    { key: "funkgeraet", artikel: "das", label: "Funkgerät", scene: "feuerwehr", img: "feuerwehr/08_funkgeraet.png" },
    { key: "axt", artikel: "die", label: "Axt", scene: "feuerwehr", img: "feuerwehr/09_axt.png" },
    { key: "taschenlampe", artikel: "die", label: "Taschenlampe", scene: "feuerwehr", img: "feuerwehr/10_taschenlampe.png" },
    { key: "feuerwehr_erste_hilfe_koffer", artikel: "der", label: "Erste-Hilfe-Koffer", scene: "feuerwehr", img: "feuerwehr/11_erste_hilfe_koffer.png" },
    { key: "rettungsseil", artikel: "das", label: "Rettungsseil", scene: "feuerwehr", img: "feuerwehr/12_rettungsseil.png" },

    { key: "koffer", artikel: "der", label: "Koffer", scene: "flughafen", img: "flughafen/01_koffer.png" },
    { key: "rucksack", artikel: "der", label: "Rucksack", scene: "flughafen", img: "flughafen/02_rucksack.png" },
    { key: "flugticket", artikel: "das", label: "Flugticket", scene: "flughafen", img: "flughafen/03_flugticket.png" },
    { key: "reisepass", artikel: "der", label: "Reisepass", scene: "flughafen", img: "flughafen/04_reisepass.png" },
    { key: "sicherheitswanne", artikel: "die", label: "Sicherheitswanne", scene: "flughafen", img: "flughafen/05_sicherheitswanne.png" },
    { key: "sonnenbrille", artikel: "die", label: "Sonnenbrille", scene: "flughafen", img: "flughafen/06_sonnenbrille.png" },
    { key: "wasserflasche", artikel: "die", label: "Wasserflasche", scene: "flughafen", img: "flughafen/07_wasserflasche.png" },
    { key: "lunchbox", artikel: "die", label: "Lunchbox", scene: "flughafen", img: "flughafen/08_lunchbox.png" },
    { key: "flugzeug", artikel: "das", label: "Flugzeug", scene: "flughafen", img: "flughafen/09_flugzeug.png" },
    { key: "pilotenmuetze", artikel: "die", label: "Pilotenmütze", scene: "flughafen", img: "flughafen/10_pilotenmuetze.png" },
    { key: "flughafen_gehoerschutz", artikel: "der", label: "Gehörschutz", scene: "flughafen", img: "flughafen/11_gehoerschutz.png" },
    { key: "windsack", artikel: "der", label: "Windsack", scene: "flughafen", img: "flughafen/12_windsack.png" },

    { key: "violine", artikel: "die", label: "Violine", scene: "orchester", img: "orchester/01_violine.png" },
    { key: "cello", artikel: "das", label: "Cello", scene: "orchester", img: "orchester/02_cello.png" },
    { key: "floete", artikel: "die", label: "Flöte", scene: "orchester", img: "orchester/03_floete.png" },
    { key: "klarinette", artikel: "die", label: "Klarinette", scene: "orchester", img: "orchester/04_klarinette.png" },
    { key: "trompete", artikel: "die", label: "Trompete", scene: "orchester", img: "orchester/05_trompete.png" },
    { key: "waldhorn", artikel: "das", label: "Waldhorn", scene: "orchester", img: "orchester/06_waldhorn.png" },
    { key: "posaune", artikel: "die", label: "Posaune", scene: "orchester", img: "orchester/07_posaune.png" },
    { key: "pauke", artikel: "die", label: "Pauke", scene: "orchester", img: "orchester/08_pauke.png" },
    { key: "trommel", artikel: "die", label: "Trommel", scene: "orchester", img: "orchester/09_trommel.png" },
    { key: "klavierhocker", artikel: "der", label: "Klavierhocker", scene: "orchester", img: "orchester/10_klavierhocker.png" },
    { key: "notenstaender", artikel: "der", label: "Notenständer", scene: "orchester", img: "orchester/11_notenstaender.png" },
    { key: "metronom", artikel: "das", label: "Metronom", scene: "orchester", img: "orchester/12_metronom.png" },

    { key: "sani_erste_hilfe_koffer", artikel: "der", label: "Erste-Hilfe-Koffer", scene: "sanitaetswagen", img: "sanitaetswagen/01_erste_hilfe_koffer.png" },
    { key: "trage", artikel: "die", label: "Trage", scene: "sanitaetswagen", img: "sanitaetswagen/02_trage.png" },
    { key: "rollstuhl", artikel: "der", label: "Rollstuhl", scene: "sanitaetswagen", img: "sanitaetswagen/03_rollstuhl.png" },
    { key: "blutdruckmessgeraet", artikel: "das", label: "Blutdruckmessgerät", scene: "sanitaetswagen", img: "sanitaetswagen/04_blutdruckmessgeraet.png" },
    { key: "stethoskop", artikel: "das", label: "Stethoskop", scene: "sanitaetswagen", img: "sanitaetswagen/05_stethoskop.png" },
    { key: "thermometer", artikel: "das", label: "Thermometer", scene: "sanitaetswagen", img: "sanitaetswagen/06_thermometer.png" },
    { key: "einmalhandschuhe", artikel: "die", label: "Einmalhandschuhe", scene: "sanitaetswagen", img: "sanitaetswagen/07_einmalhandschuhe.png" },
    { key: "verband", artikel: "der", label: "Verband", scene: "sanitaetswagen", img: "sanitaetswagen/08_verband.png" },
    { key: "pflaster", artikel: "das", label: "Pflaster", scene: "sanitaetswagen", img: "sanitaetswagen/09_pflaster.png" },
    { key: "schere", artikel: "die", label: "Schere", scene: "sanitaetswagen", img: "sanitaetswagen/10_schere.png" },
    { key: "sauerstoffmaske", artikel: "die", label: "Sauerstoffmaske", scene: "sanitaetswagen", img: "sanitaetswagen/11_sauerstoffmaske.png" },
    { key: "rettungsdecke", artikel: "die", label: "Rettungsdecke", scene: "sanitaetswagen", img: "sanitaetswagen/12_rettungsdecke.png" }
  ];

  const STORAGE_KEY = "wo-gehoert-das-hin:scenes";
  const DEFAULT_SCENES = ["kueche", "bad"];

  const main = document.querySelector(".game");
  const sceneSelect = document.getElementById("sceneSelect");
  const sceneGrid = document.getElementById("sceneGrid");
  const startButton = document.getElementById("startButton");
  const changeScenesButton = document.getElementById("changeScenesButton");

  const itemEl = document.getElementById("item");
  const zoneA = document.getElementById("zoneA");
  const zoneB = document.getElementById("zoneB");
  const zoneAImg = document.getElementById("zoneAImg");
  const zoneBImg = document.getElementById("zoneBImg");
  const zoneALabel = document.getElementById("zoneALabel");
  const zoneBLabel = document.getElementById("zoneBLabel");
  const zones = { a: zoneA, b: zoneB };
  const instructionText = document.getElementById("instructionText");
  const feedback = document.querySelector(".feedback");
  const feedbackIcon = document.getElementById("feedbackIcon");
  const feedbackTitle = document.getElementById("feedbackTitle");
  const feedbackText = document.getElementById("feedbackText");
  const speechButton = document.getElementById("speechButton");
  const boboButton = document.getElementById("boboButton");
  const boboImage = document.querySelector(".bobo");

  let selectedScenes = loadSelectedScenes();
  let sceneOfZone = { a: null, b: null };
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

  function loadSelectedScenes() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(stored) && stored.length === 2 && stored.every(key => SCENES[key]) && stored[0] !== stored[1]) {
        return stored;
      }
    } catch (err) {
      // Ungültiger Speicherinhalt wird ignoriert, Standardauswahl greift.
    }
    return DEFAULT_SCENES.slice();
  }

  function saveSelectedScenes(scenes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
  }

  function buildSceneGrid() {
    sceneGrid.innerHTML = "";

    for (const key of SCENE_ORDER) {
      const scene = SCENES[key];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "scene-option";
      button.dataset.scene = key;
      button.setAttribute("aria-pressed", "false");
      button.innerHTML = `
        <span class="scene-thumb"><img src="${scene.img}" alt=""></span>
        <span class="scene-name">${scene.label}</span>
      `;
      button.addEventListener("click", () => toggleScene(key));
      sceneGrid.appendChild(button);
    }

    refreshSceneGrid();
  }

  function refreshSceneGrid() {
    sceneGrid.querySelectorAll(".scene-option").forEach(button => {
      const isSelected = selectedScenes.includes(button.dataset.scene);
      button.classList.toggle("selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
    startButton.disabled = selectedScenes.length !== 2;
  }

  function toggleScene(key) {
    if (selectedScenes.includes(key)) {
      selectedScenes = selectedScenes.filter(scene => scene !== key);
    } else if (selectedScenes.length < 2) {
      selectedScenes = [...selectedScenes, key];
    } else {
      return;
    }
    refreshSceneGrid();
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

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function promptSentence(entry) {
    return `Wohin gehört ${entry.artikel} ${entry.label}?`;
  }

  function correctSentence(entry) {
    return `Richtig! ${capitalize(entry.artikel)} ${entry.label} gehört ${SCENES[entry.scene].into}.`;
  }

  function wrongSentence(entry) {
    return `Nein. ${capitalize(entry.artikel)} ${entry.label} gehört ${SCENES[entry.scene].into}.`;
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

  function currentPool() {
    return ITEMS.filter(entry => selectedScenes.includes(entry.scene));
  }

  function pickNextItem() {
    const pool = currentPool();
    const choices = pool.filter(entry => entry.key !== previousKey);
    const finalPool = choices.length ? choices : pool;
    return finalPool[Math.floor(Math.random() * finalPool.length)];
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

  function setupZones() {
    const [sceneA, sceneB] = selectedScenes;
    sceneOfZone = { a: sceneA, b: sceneB };

    zoneAImg.src = SCENES[sceneA].img;
    zoneALabel.textContent = SCENES[sceneA].label;
    zoneBImg.src = SCENES[sceneB].img;
    zoneBLabel.textContent = SCENES[sceneB].label;
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

    if (sceneOfZone[zoneKey] === current.scene) {
      itemEl.classList.add("correct");
      zoneEl.classList.add("hover-correct");
      doBoboSalto();

      feedback.className = "feedback good";
      feedbackIcon.textContent = "✓";
      feedbackTitle.textContent = "Richtig!";
      feedbackText.textContent =
        `${capitalize(current.artikel)} ${current.label} gehört ${SCENES[current.scene].into}.`;

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
        `${capitalize(current.artikel)} ${current.label} gehört ${SCENES[current.scene].into}.`;

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
    clearZoneStates();

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

  function startGame() {
    clearTimeout(nextTimer);
    saveSelectedScenes(selectedScenes);
    setupZones();
    main.classList.remove("mode-select");
    main.classList.add("mode-play");
    setNewRound();
  }

  function backToSceneSelect() {
    clearTimeout(nextTimer);
    window.speechSynthesis && window.speechSynthesis.cancel();
    main.classList.remove("mode-play");
    main.classList.add("mode-select");
    refreshSceneGrid();
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
  startButton.addEventListener("click", startGame);
  changeScenesButton.addEventListener("click", backToSceneSelect);

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  buildSceneGrid();
  main.classList.add("mode-select");
})();
