(() => {
  const CATEGORIES = [
    {
      key: "tiere",
      icon: "🐘",
      label: "Tiere",
      items: [
        { id: "loewe", emoji: "🦁", label: "Löwe", kind: "animal", reaction: "yawn" },
        { id: "elefant", emoji: "🐘", label: "Elefant", kind: "animal", reaction: "water" },
        { id: "giraffe", emoji: "🦒", label: "Giraffe", kind: "animal", reaction: "leaves" },
        { id: "affe", emoji: "🐵", label: "Affe", kind: "animal", reaction: "jump" },
        { id: "pinguin", emoji: "🐧", label: "Pinguin", kind: "animal", reaction: "slide" },
        { id: "zebra", emoji: "🦓", label: "Zebra", kind: "animal", reaction: "bounce" },
        { id: "krokodil", emoji: "🐊", label: "Krokodil", kind: "animal", reaction: "snap" },
        { id: "panda", emoji: "🐼", label: "Panda", kind: "animal", reaction: "roll" }
      ]
    },
    {
      key: "natur",
      icon: "🌳",
      label: "Natur",
      items: [
        { id: "baum", emoji: "🌳", label: "Baum", kind: "tree" },
        { id: "blume", emoji: "🌸", label: "Blume", kind: "wiggle" },
        { id: "busch", emoji: "🌿", label: "Busch", kind: "wiggle" },
        { id: "teich", emoji: "💧", label: "Teich", kind: "pond" },
        { id: "fels", emoji: "🪨", label: "Fels", kind: "static" }
      ]
    },
    {
      key: "gehege",
      icon: "🏠",
      label: "Gehege",
      items: [
        { id: "zaun", emoji: "🚧", label: "Zaun", kind: "static" },
        { id: "tierhaus", emoji: "🏠", label: "Tierhaus", kind: "static" },
        { id: "futterstelle", emoji: "🍽️", label: "Futterstelle", kind: "static" },
        { id: "bank", emoji: "🪑", label: "Bank", kind: "static" },
        { id: "weg", emoji: "🟫", label: "Weg", kind: "static" }
      ]
    },
    {
      key: "deko",
      icon: "🌸",
      label: "Deko",
      items: [
        { id: "ballon", emoji: "🎈", label: "Ballon", kind: "balloon" },
        { id: "schmetterling", emoji: "🦋", label: "Schmetterling", kind: "wiggle" },
        { id: "fahne", emoji: "🚩", label: "Fähnchen", kind: "static" },
        { id: "sonnenblume", emoji: "🌻", label: "Sonnenblume", kind: "wiggle" }
      ]
    }
  ];

  const ITEM_BY_ID = {};
  CATEGORIES.forEach(cat => cat.items.forEach(item => { ITEM_BY_ID[item.id] = item; }));

  const IDLE_KINDS = new Set(["animal", "tree", "wiggle", "balloon"]);
  const STORAGE_KEY = "bobos-zoo-v2";
  const MILESTONES = [5, 15, 30, 50, 80];

  const meadow = document.getElementById("meadow");
  const objectsLayer = document.getElementById("objectsLayer");
  const fxLayer = document.getElementById("fxLayer");
  const celebrateLayer = document.getElementById("celebrateLayer");
  const categoryBar = document.getElementById("categoryBar");
  const tray = document.getElementById("tray");
  const trayCards = document.getElementById("trayCards");
  const trayClose = document.getElementById("trayClose");
  const parentGear = document.getElementById("parentGear");
  const parentOverlay = document.getElementById("parentOverlay");
  const soundToggle = document.getElementById("soundToggle");
  const musicToggle = document.getElementById("musicToggle");
  const resetZooBtn = document.getElementById("resetZooBtn");
  const closeParentBtn = document.getElementById("closeParentBtn");

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object") throw new Error("empty");

      const objects = Array.isArray(parsed.objects)
        ? parsed.objects.filter(o => o && ITEM_BY_ID[o.itemId] && typeof o.x === "number" && typeof o.y === "number")
        : [];

      return {
        objects,
        settings: {
          sound: parsed.settings?.sound !== false,
          music: !!parsed.settings?.music
        },
        celebrated: Array.isArray(parsed.celebrated) ? parsed.celebrated : []
      };
    } catch {
      return { objects: [], settings: { sound: true, music: false }, celebrated: [] };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Der Zoo wird dann nicht dauerhaft gespeichert.
    }
  }

  const state = loadState();

  let openCategoryKey = null;
  let placingItem = null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function dist(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
  }

  function makeUid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function findFreeSpot(x, y) {
    let px = x;
    let py = y;
    let attempt = 0;

    while (attempt < 10 && state.objects.some(o => dist(o.x, o.y, px, py) < 8)) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 6 + attempt * 2;
      px = clamp(x + Math.cos(angle) * radius, 6, 94);
      py = clamp(y + Math.sin(angle) * radius, 16, 92);
      attempt++;
    }

    return { x: px, y: py };
  }

  /* ---------- Rendering ---------- */

  function createObjectElement(obj) {
    const item = ITEM_BY_ID[obj.itemId];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "zoo-object";
    btn.dataset.uid = obj.uid;
    btn.style.left = `${obj.x}%`;
    btn.style.top = `${obj.y}%`;
    btn.style.setProperty("--rot", `${obj.rot}deg`);
    btn.style.setProperty("--scale", `${0.75 + (obj.y / 100) * 0.4}`);
    btn.style.zIndex = String(200 + Math.round(obj.y * 10));
    btn.setAttribute("aria-label", item.label);

    const emoji = document.createElement("span");
    emoji.className = "obj-emoji" + (item.kind === "pond" ? " pond" : "") + (IDLE_KINDS.has(item.kind) ? "" : " no-idle");
    emoji.style.setProperty("--delay", `${obj.delay}s`);
    emoji.textContent = item.emoji;
    btn.append(emoji);

    btn.addEventListener("click", e => {
      e.stopPropagation();
      triggerReaction(obj, item, emoji);
    });

    return btn;
  }

  function render() {
    objectsLayer.innerHTML = "";
    state.objects.forEach(obj => objectsLayer.append(createObjectElement(obj)));
  }

  function renderCategoryBar() {
    categoryBar.innerHTML = "";
    CATEGORIES.forEach(cat => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "category-btn";
      btn.dataset.key = cat.key;

      const icon = document.createElement("span");
      icon.className = "category-icon";
      icon.textContent = cat.icon;

      const label = document.createElement("span");
      label.className = "category-label";
      label.textContent = cat.label;

      btn.append(icon, label);
      btn.addEventListener("click", () => toggleCategory(cat.key));
      categoryBar.append(btn);
    });
  }

  function updateCategoryStates() {
    categoryBar.querySelectorAll(".category-btn").forEach(btn => {
      const key = btn.dataset.key;
      btn.classList.toggle("open", key === openCategoryKey);
      btn.classList.toggle("placing", !!placingItem && placingItem.catKey === key);
    });
  }

  function renderTray(catKey) {
    const cat = CATEGORIES.find(c => c.key === catKey);
    trayCards.innerHTML = "";

    cat.items.forEach(item => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "item-card";
      card.dataset.id = item.id;

      const emoji = document.createElement("span");
      emoji.className = "item-emoji";
      emoji.textContent = item.emoji;

      const label = document.createElement("span");
      label.className = "item-label";
      label.textContent = item.label;

      card.append(emoji, label);
      card.addEventListener("click", () => selectItem(cat.key, item, card));
      trayCards.append(card);
    });
  }

  function toggleCategory(key) {
    if (openCategoryKey === key) {
      closeTray();
      return;
    }

    openCategoryKey = key;
    placingItem = null;
    renderTray(key);
    tray.hidden = false;
    updateCategoryStates();
  }

  function closeTray() {
    openCategoryKey = null;
    placingItem = null;
    tray.hidden = true;
    updateCategoryStates();
  }

  function selectItem(catKey, item, cardEl) {
    placingItem = { catKey, item };
    trayCards.querySelectorAll(".item-card").forEach(el => el.classList.toggle("selected", el === cardEl));
    updateCategoryStates();
  }

  /* ---------- Platzieren ---------- */

  function pointToMeadowPercent(clientX, clientY) {
    const rect = meadow.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 6, 94);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 16, 92);
    return { x, y };
  }

  function placeAt(clientX, clientY) {
    if (!placingItem) return;

    const raw = pointToMeadowPercent(clientX, clientY);
    const spot = findFreeSpot(raw.x, raw.y);

    const obj = {
      uid: makeUid(),
      itemId: placingItem.item.id,
      x: spot.x,
      y: spot.y,
      rot: Math.round(Math.random() * 16 - 8),
      delay: Math.round(Math.random() * 30) / 10
    };

    state.objects.push(obj);
    saveState();

    const el = createObjectElement(obj);
    el.classList.add("obj-pop-in");
    objectsLayer.append(el);

    spawnFx("⭐", obj.x, obj.y, "fx-star");
    spawnFx("✨", obj.x, obj.y, "fx-star");
    playPop();
    checkMilestone();
  }

  meadow.addEventListener("click", e => {
    if (!placingItem) return;
    placeAt(e.clientX, e.clientY);
  });

  /* ---------- Effekte ---------- */

  function spawnFx(emoji, xPct, yPct, animClass, dx) {
    const span = document.createElement("span");
    span.className = `fx-item ${animClass}`;
    span.textContent = emoji;
    span.style.left = `${clamp(xPct + (Math.random() * 6 - 3), 2, 98)}%`;
    span.style.top = `${clamp(yPct + (Math.random() * 6 - 3), 2, 98)}%`;
    if (dx !== undefined) span.style.setProperty("--dx", `${dx}px`);
    fxLayer.append(span);
    span.addEventListener("animationend", () => span.remove());
    setTimeout(() => span.remove(), 1600);
  }

  function spawnRipples(xPct, yPct) {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const ring = document.createElement("div");
        ring.className = "fx-ripple";
        ring.style.left = `${xPct}%`;
        ring.style.top = `${yPct}%`;
        fxLayer.append(ring);
        ring.addEventListener("animationend", () => ring.remove());
        setTimeout(() => ring.remove(), 1400);
      }, i * 220);
    }
  }

  function flashClass(el, cls, duration) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), duration);
  }

  const ANIMAL_REACTIONS = {
    yawn: (el, obj) => {
      flashClass(el, "react-yawn", 900);
      spawnFx("💤", obj.x, obj.y - 8, "fx-float-up");
    },
    water: (el, obj) => {
      flashClass(el, "react-bounce-strong", 500);
      spawnFx("💦", obj.x, obj.y, "fx-water", 14);
      spawnFx("💦", obj.x, obj.y, "fx-water", -14);
    },
    leaves: (el, obj) => {
      flashClass(el, "react-nod", 700);
      spawnFx("🍃", obj.x, obj.y - 6, "fx-leaf", 18);
    },
    jump: (el) => {
      flashClass(el, "react-jump", 600);
    },
    slide: (el) => {
      flashClass(el, "react-slide", 600);
    },
    bounce: (el) => {
      flashClass(el, "react-bounce-strong", 500);
    },
    snap: (el) => {
      flashClass(el, "react-snap", 500);
    },
    roll: (el) => {
      flashClass(el, "react-roll", 800);
    }
  };

  function triggerReaction(obj, item, emojiEl) {
    if (item.kind === "animal") {
      const reaction = ANIMAL_REACTIONS[item.reaction] || ANIMAL_REACTIONS.bounce;
      reaction(emojiEl, obj);
    } else if (item.kind === "pond") {
      spawnRipples(obj.x, obj.y);
    } else if (item.kind === "tree") {
      flashClass(emojiEl, "react-nod", 700);
      spawnFx("🍃", obj.x, obj.y - 4, "fx-leaf", 16);
    } else if (item.kind === "wiggle") {
      flashClass(emojiEl, "react-wiggle", 500);
    } else if (item.kind === "balloon") {
      flashClass(emojiEl, "react-bounce-strong", 500);
    } else {
      flashClass(emojiEl, "react-pop", 400);
    }

    spawnFx("⭐", obj.x, obj.y, "fx-star");
    playChime();
  }

  /* ---------- Belohnung ---------- */

  function checkMilestone() {
    const count = state.objects.length;
    MILESTONES.forEach(m => {
      if (count >= m && !state.celebrated.includes(m)) {
        state.celebrated.push(m);
        celebrate();
      }
    });
    saveState();
  }

  function celebrate() {
    const emojis = ["⭐", "🎉", "✨", "💛", "🎈"];
    for (let i = 0; i < 22; i++) {
      const span = document.createElement("span");
      span.className = "confetti-item";
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.left = `${Math.random() * 100}%`;
      span.style.animationDuration = `${1.2 + Math.random() * 1}s`;
      span.style.animationDelay = `${Math.random() * 0.4}s`;
      celebrateLayer.append(span);
      span.addEventListener("animationend", () => span.remove());
      setTimeout(() => span.remove(), 3000);
    }
    playCelebrate();
  }

  /* ---------- Ambiente: Vögel & Tier-Begegnungen ---------- */

  function scheduleBird() {
    const delay = 18000 + Math.random() * 20000;
    setTimeout(() => {
      const bird = document.createElement("span");
      bird.className = "fx-bird";
      bird.textContent = Math.random() < 0.5 ? "🐦" : "🐤";
      bird.style.top = `${8 + Math.random() * 18}%`;
      const duration = 7 + Math.random() * 4;
      bird.style.animationDuration = `${duration}s`;
      fxLayer.append(bird);
      setTimeout(() => bird.remove(), duration * 1000 + 200);
      scheduleBird();
    }, delay);
  }

  function scheduleAnimalMoment() {
    const delay = 15000 + Math.random() * 18000;
    setTimeout(() => {
      const animals = state.objects.filter(o => ITEM_BY_ID[o.itemId].kind === "animal");
      if (animals.length >= 2) {
        const a = animals[Math.floor(Math.random() * animals.length)];
        let b = animals[Math.floor(Math.random() * animals.length)];
        if (b.uid === a.uid) b = animals[(animals.indexOf(a) + 1) % animals.length];
        spawnFx("💗", a.x, a.y - 6, "fx-heart");
        spawnFx("💗", b.x, b.y - 6, "fx-heart");
      }
      scheduleAnimalMoment();
    }, delay);
  }

  /* ---------- Sound ---------- */

  let audioCtx = null;

  function ensureAudio() {
    if (audioCtx) {
      if (audioCtx.state === "suspended") audioCtx.resume();
      return;
    }
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      audioCtx = null;
    }
  }

  document.addEventListener("pointerdown", ensureAudio, { once: true });

  function tone(freq, start, duration, type, peakGain) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(peakGain, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.02);
  }

  function playPop() {
    if (!state.settings.sound) return;
    ensureAudio();
    tone(520, 0, 0.12, "triangle", 0.18);
    tone(700, 0.06, 0.12, "triangle", 0.14);
  }

  function playChime() {
    if (!state.settings.sound) return;
    ensureAudio();
    tone(880, 0, 0.15, "sine", 0.12);
  }

  function playCelebrate() {
    if (!state.settings.sound) return;
    ensureAudio();
    [660, 880, 990, 1320].forEach((f, i) => tone(f, i * 0.09, 0.18, "triangle", 0.15));
  }

  const MELODY = [523.25, 587.33, 659.25, 523.25, 659.25, 783.99, 659.25, 587.33];
  let melodyIdx = 0;

  setInterval(() => {
    if (!state.settings.music) return;
    ensureAudio();
    tone(MELODY[melodyIdx % MELODY.length], 0, 0.5, "sine", 0.045);
    melodyIdx++;
  }, 650);

  /* ---------- Elternbereich ---------- */

  let pressTimer = null;

  function openParentPanel() {
    soundToggle.checked = state.settings.sound;
    musicToggle.checked = state.settings.music;
    parentOverlay.hidden = false;
  }

  parentGear.addEventListener("pointerdown", () => {
    pressTimer = setTimeout(openParentPanel, 900);
  });

  ["pointerup", "pointerleave", "pointercancel"].forEach(evt => {
    parentGear.addEventListener(evt, () => clearTimeout(pressTimer));
  });

  closeParentBtn.addEventListener("click", () => {
    parentOverlay.hidden = true;
  });

  soundToggle.addEventListener("change", () => {
    state.settings.sound = soundToggle.checked;
    saveState();
  });

  musicToggle.addEventListener("change", () => {
    state.settings.music = musicToggle.checked;
    saveState();
  });

  resetZooBtn.addEventListener("click", () => {
    state.objects = [];
    state.celebrated = [];
    saveState();
    render();
  });

  trayClose.addEventListener("click", closeTray);

  /* ---------- Start ---------- */

  renderCategoryBar();
  render();
  updateCategoryStates();
  scheduleBird();
  scheduleAnimalMoment();
})();
