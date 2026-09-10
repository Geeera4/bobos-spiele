(() => {
  const HABITATS = [
    {
      key: "savanne",
      icon: "🌾",
      label: "Savanne",
      day: "linear-gradient(180deg, #ffe9ab 0%, #ffd27a 40%, #e0b45c 72%, #c99a46 100%)",
      night: "linear-gradient(180deg, #2b2660 0%, #3a2f6e 40%, #55406a 72%, #6b4f52 100%)",
      decor: [
        { emoji: "🌴", left: "6%", top: "18%" },
        { emoji: "🌴", left: "90%", top: "60%" },
        { emoji: "🪨", left: "14%", top: "72%" }
      ]
    },
    {
      key: "wasser",
      icon: "🌊",
      label: "Wasserwelt",
      day: "linear-gradient(180deg, #bfe9ff 0%, #7fd0f0 42%, #3aa6d6 74%, #1f7fae 100%)",
      night: "linear-gradient(180deg, #101d3d 0%, #142c52 42%, #1c3f63 74%, #234f6e 100%)",
      decor: [
        { emoji: "☁️", left: "12%", top: "12%" },
        { emoji: "🐚", left: "85%", top: "70%" },
        { emoji: "🌊", left: "10%", top: "75%" }
      ]
    },
    {
      key: "wald",
      icon: "🌳",
      label: "Wald",
      day: "linear-gradient(180deg, #cdeccb 0%, #a6dba0 42%, #6fb86a 74%, #4c9a4a 100%)",
      night: "linear-gradient(180deg, #101f16 0%, #16301f 42%, #1d4229 74%, #275630 100%)",
      decor: [
        { emoji: "🌲", left: "8%", top: "20%" },
        { emoji: "🌲", left: "88%", top: "22%" },
        { emoji: "🍄", left: "16%", top: "76%" }
      ]
    }
  ];

  const ANIMALS = [
    { id: "loewe", name: "Löwe", emoji: "🦁", habitat: "savanne", fact: "Der Löwe brüllt ganz laut: ROAR!" },
    { id: "elefant", name: "Elefant", emoji: "🐘", habitat: "savanne", fact: "Der Elefant spritzt Wasser mit seinem Rüssel." },
    { id: "giraffe", name: "Giraffe", emoji: "🦒", habitat: "savanne", fact: "Die Giraffe hat einen sehr langen Hals." },
    { id: "zebra", name: "Zebra", emoji: "🦓", habitat: "savanne", fact: "Das Zebra hat schwarze und weiße Streifen." },

    { id: "pinguin", name: "Pinguin", emoji: "🐧", habitat: "wasser", fact: "Der Pinguin watschelt und schwimmt ganz toll." },
    { id: "flamingo", name: "Flamingo", emoji: "🦩", habitat: "wasser", fact: "Der Flamingo steht gerne auf einem Bein." },
    { id: "seehund", name: "Seehund", emoji: "🦭", habitat: "wasser", fact: "Der Seehund klatscht fröhlich mit den Flossen." },
    { id: "krokodil", name: "Krokodil", emoji: "🐊", habitat: "wasser", fact: "Das Krokodil macht klack klack mit dem Maul." },

    { id: "panda", name: "Panda", emoji: "🐼", habitat: "wald", fact: "Der Panda mag am liebsten Bambus." },
    { id: "affe", name: "Affe", emoji: "🐒", habitat: "wald", fact: "Der Affe klettert von Ast zu Ast." },
    { id: "fuchs", name: "Fuchs", emoji: "🦊", habitat: "wald", fact: "Der Fuchs schleicht ganz leise durch den Wald." },
    { id: "eule", name: "Eule", emoji: "🦉", habitat: "wald", fact: "Die Eule sagt: Huhu, huhu." }
  ];

  const GREETINGS = [
    "Hallo! Ich bin Bobo! Lass uns einen Zoo bauen!",
    "Welches Tier setzen wir als Nächstes in den Zoo?",
    "Dein Zoo wird richtig schön!",
    "Tippe ein Tier an, dann zieht es bei uns ein!"
  ];

  const habitatTabs = document.getElementById("habitatTabs");
  const habitatView = document.getElementById("habitatView");
  const habitatStage = document.getElementById("habitatStage");
  const skyBody = document.getElementById("skyBody");
  const animalShelf = document.getElementById("animalShelf");
  const instructionText = document.getElementById("instructionText");
  const speechButton = document.getElementById("speechButton");
  const boboButton = document.getElementById("boboButton");
  const boboImage = document.getElementById("boboImage");
  const dayNightButton = document.getElementById("dayNightButton");
  const treatButton = document.getElementById("treatButton");
  const resetButton = document.getElementById("resetButton");

  const STORAGE_KEY = "bobos-zoo-progress-v1";

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object") return { placed: [], dayNight: "day", habitat: "savanne" };

      const validIds = new Set(ANIMALS.map(a => a.id));
      const placed = Array.isArray(parsed.placed) ? parsed.placed.filter(id => validIds.has(id)) : [];
      const dayNight = parsed.dayNight === "night" ? "night" : "day";
      const habitat = HABITATS.some(h => h.key === parsed.habitat) ? parsed.habitat : "savanne";

      return { placed, dayNight, habitat };
    } catch {
      return { placed: [], dayNight: "day", habitat: "savanne" };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        placed: [...placedIds],
        dayNight,
        habitat: currentHabitat
      }));
    } catch {
      // Der Zoo wird dann nicht dauerhaft gespeichert.
    }
  }

  const initial = loadState();
  let placedIds = new Set(initial.placed);
  let dayNight = initial.dayNight;
  let currentHabitat = initial.habitat;
  const positions = new Map();

  function speak(text, onEnd) {
    if (!("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.94;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const germanVoices = voices.filter(v => /^de(-|_)/i.test(v.lang));

    if (germanVoices.length) {
      const preferred = germanVoices.find(v => /anna|katja|petra|sophie|female|frau/i.test(v.name));
      utterance.voice = preferred || germanVoices[0];
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  function randomPosition() {
    return {
      left: `${18 + Math.random() * 64}%`,
      top: `${28 + Math.random() * 52}%`,
      delay: `${Math.random() * 2}s`
    };
  }

  function positionFor(id) {
    if (!positions.has(id)) positions.set(id, randomPosition());
    return positions.get(id);
  }

  function renderTabs() {
    habitatTabs.innerHTML = "";
    HABITATS.forEach(habitat => {
      const btn = document.createElement("button");
      btn.className = "habitat-tab" + (habitat.key === currentHabitat ? " active" : "");
      btn.type = "button";
      btn.textContent = habitat.icon;
      btn.setAttribute("aria-label", habitat.label);
      btn.addEventListener("click", () => switchHabitat(habitat.key));
      habitatTabs.append(btn);
    });
  }

  function currentHabitatData() {
    return HABITATS.find(h => h.key === currentHabitat);
  }

  function applySky() {
    habitatView.classList.toggle("night", dayNight === "night");
    dayNightButton.textContent = dayNight === "night" ? "🌙" : "☀️";
    skyBody.textContent = dayNight === "night" ? "🌙" : "☀️";
  }

  function renderStage() {
    habitatStage.innerHTML = "";
    const habitat = currentHabitatData();
    habitatStage.style.background = dayNight === "night" ? habitat.night : habitat.day;

    habitat.decor.forEach(d => {
      const span = document.createElement("span");
      span.className = "stage-decor";
      span.textContent = d.emoji;
      span.style.left = d.left;
      span.style.top = d.top;
      habitatStage.append(span);
    });

    const animalsHere = ANIMALS.filter(a => a.habitat === currentHabitat && placedIds.has(a.id));

    if (animalsHere.length === 0) {
      const hint = document.createElement("div");
      hint.className = "empty-hint";
      hint.textContent = "Wähle unten ein Tier aus!";
      habitatStage.append(hint);
    }

    animalsHere.forEach(animal => {
      const pos = positionFor(animal.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "zoo-animal";
      btn.textContent = animal.emoji;
      btn.style.left = pos.left;
      btn.style.top = pos.top;
      btn.style.animationDelay = pos.delay;
      btn.setAttribute("aria-label", animal.name);
      btn.addEventListener("click", () => pokeAnimal(animal, btn));
      habitatStage.append(btn);
    });
  }

  function renderShelf() {
    animalShelf.innerHTML = "";
    const animalsHere = ANIMALS.filter(a => a.habitat === currentHabitat);

    animalsHere.forEach(animal => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "animal-btn";
      btn.dataset.id = animal.id;
      const placed = placedIds.has(animal.id);
      btn.setAttribute("aria-pressed", String(placed));

      const emoji = document.createElement("span");
      emoji.className = "animal-emoji";
      emoji.textContent = animal.emoji;

      const name = document.createElement("span");
      name.className = "animal-name";
      name.textContent = animal.name;

      btn.append(emoji, name);
      btn.addEventListener("click", () => toggleAnimal(animal));
      animalShelf.append(btn);
    });
  }

  function switchHabitat(key) {
    if (key === currentHabitat) return;
    currentHabitat = key;
    saveState();
    renderTabs();
    renderStage();
    renderShelf();
  }

  function toggleAnimal(animal) {
    if (placedIds.has(animal.id)) {
      placedIds.delete(animal.id);
      saveState();
      renderStage();
      renderShelf();
      return;
    }

    placedIds.add(animal.id);
    saveState();
    renderStage();
    renderShelf();

    instructionText.textContent = `${animal.name} zieht in den Zoo ein!`;
    speak(`${animal.name}! ${animal.fact}`);
  }

  function pokeAnimal(animal, el) {
    el.classList.remove("poke");
    void el.offsetWidth;
    el.classList.add("poke");
    instructionText.textContent = animal.fact;
    speak(animal.fact);
  }

  function toggleDayNight() {
    dayNight = dayNight === "day" ? "night" : "day";
    saveState();
    applySky();
    renderStage();
  }

  function feedRandomAnimal() {
    const animalsHere = ANIMALS.filter(a => a.habitat === currentHabitat && placedIds.has(a.id));

    if (animalsHere.length === 0) {
      instructionText.textContent = "Setze zuerst ein Tier in den Zoo, dann kannst du es füttern!";
      speak("Setze zuerst ein Tier in den Zoo, dann kannst du es füttern!");
      return;
    }

    const animal = animalsHere[Math.floor(Math.random() * animalsHere.length)];
    const el = habitatStage.querySelector(`.zoo-animal[aria-label="${animal.name}"]`);

    if (el) {
      const pos = positionFor(animal.id);
      const heart = document.createElement("span");
      heart.className = "heart-burst";
      heart.textContent = "💚";
      heart.style.left = pos.left;
      heart.style.top = pos.top;
      habitatStage.append(heart);
      heart.addEventListener("animationend", () => heart.remove());
      el.classList.remove("poke");
      void el.offsetWidth;
      el.classList.add("poke");
    }

    const text = `${animal.name} freut sich riesig über das Leckerli!`;
    instructionText.textContent = text;
    speak(text);
  }

  function boboCheer(text) {
    boboImage.src = "../mehr-oder-weniger/bobos/bobo_pose_07.png?v=1";

    const rect = boboImage.getBoundingClientRect();
    const clone = document.createElement("img");
    clone.src = "../mehr-oder-weniger/bobos/bobo_pose_07.png?v=1";
    clone.alt = "";
    clone.className = "bobo-cheer-overlay";
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    document.body.append(clone);
    clone.addEventListener("animationend", () => clone.remove(), { once: true });
    setTimeout(() => clone.remove(), 1200);

    setTimeout(() => {
      boboImage.src = "../mehr-oder-weniger/bobos/bobo_pose_01.png?v=1";
    }, 900);

    instructionText.textContent = text;
    speak(text);
  }

  function boboGreet() {
    const animalsPlaced = ANIMALS.filter(a => placedIds.has(a.id));

    if (animalsPlaced.length > 0 && Math.random() < 0.6) {
      const animal = animalsPlaced[Math.floor(Math.random() * animalsPlaced.length)];
      boboCheer(`Schau mal, ${animal.name}! ${animal.fact}`);
      return;
    }

    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    boboCheer(greeting);
  }

  function speakInstruction() {
    speak(instructionText.textContent);
  }

  function resetZoo() {
    window.speechSynthesis?.cancel();
    placedIds = new Set();
    positions.clear();
    saveState();
    renderStage();
    renderShelf();
    instructionText.textContent = "Tippe ein Tier an und setze es in den Zoo!";
    speak("Neuer Zoo! Tippe ein Tier an und setze es in den Zoo!");
  }

  speechButton.addEventListener("click", speakInstruction);
  boboButton.addEventListener("click", boboGreet);
  dayNightButton.addEventListener("click", toggleDayNight);
  treatButton.addEventListener("click", feedRandomAnimal);
  resetButton.addEventListener("click", resetZoo);

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  renderTabs();
  applySky();
  renderStage();
  renderShelf();
})();
