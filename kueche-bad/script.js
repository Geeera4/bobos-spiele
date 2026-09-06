(() => {
  const ITEMS = [
    { id: "topf",            label: "Topf",            emoji: "🍲", room: "kueche" },
    { id: "pfanne",          label: "Pfanne",          emoji: "🍳", room: "kueche" },
    { id: "teller",          label: "Teller",          emoji: "🍽️", room: "kueche" },
    { id: "tasse",           label: "Tasse",           emoji: "☕", room: "kueche" },
    { id: "loeffel",         label: "Löffel",          emoji: "🥄", room: "kueche" },
    { id: "gabel",           label: "Gabel",           emoji: "🍴", room: "kueche" },
    { id: "brot",            label: "Brot",            emoji: "🍞", room: "kueche" },
    { id: "apfel",           label: "Apfel",           emoji: "🍎", room: "kueche" },
    { id: "zahnbuerste",     label: "Zahnbürste",      emoji: "🪥", room: "bad" },
    { id: "seife",           label: "Seife",           emoji: "🧼", room: "bad" },
    { id: "schwamm",         label: "Schwamm",         emoji: "🧽", room: "bad" },
    { id: "dusche",          label: "Dusche",          emoji: "🚿", room: "bad" },
    { id: "shampoo",         label: "Shampoo",         emoji: "🧴", room: "bad" },
    { id: "badeente",        label: "Badeente",        emoji: "🦆", room: "bad" },
    { id: "spiegel",         label: "Spiegel",         emoji: "🪞", room: "bad" },
    { id: "toilettenpapier", label: "Toilettenpapier", emoji: "🧻", room: "bad" }
  ];

  const ROOM_ARTICLE = { kueche: "die Küche", bad: "das Bad" };

  const instructionText = document.getElementById("instructionText");
  const feedback = document.querySelector(".feedback");
  const feedbackIcon = document.getElementById("feedbackIcon");
  const feedbackTitle = document.getElementById("feedbackTitle");
  const feedbackText = document.getElementById("feedbackText");
  const itemTile = document.getElementById("itemTile");
  const itemEmoji = document.getElementById("itemEmoji");
  const zoneKueche = document.getElementById("zoneKueche");
  const zoneBad = document.getElementById("zoneBad");
  const speechButton = document.getElementById("speechButton");
  const boboButton = document.getElementById("boboButton");
  const boboImage = document.querySelector(".bobo");

  let current = ITEMS[0];
  let locked = false;
  let nextTimer = null;

  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let moved = false;

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
    return `Wohin gehört: ${current.label}?`;
  }

  function speakPrompt() {
    speak(`${current.label}. ${promptSentence()}`);
  }

  function doBoboSalto() {
    if (!boboImage) return;

    // Bobo-Lachen gleichzeitig mit dem Salto abspielen.
    const laugh = new Audio("bobo-lachen.mp3?v=1");
    laugh.volume = 1;
    laugh.play().catch(() => {
      // Falls der Browser Audio blockiert, läuft die Animation trotzdem.
    });

    document.querySelectorAll(".bobo-salto-overlay").forEach(el => el.remove());

    const clone = boboImage.cloneNode(true);
    clone.removeAttribute("id");
    clone.classList.remove("bobo", "salto");
    clone.classList.add("bobo-salto-overlay");
    clone.setAttribute("aria-hidden", "true");

    document.body.appendChild(clone);

    clone.addEventListener("animationend", () => {
      clone.remove();
    }, { once: true });

    setTimeout(() => clone.remove(), 1200);
  }

  function pickNextItem(previous) {
    const choices = ITEMS.filter(item => item.id !== previous?.id);
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function resetItemPosition(animate) {
    itemTile.style.transition = animate ? "transform .25s ease" : "none";
    itemTile.style.transform = "translate(0, 0)";
  }

  function setNewRound({ speakNow = false } = {}) {
    current = pickNextItem(current);
    itemEmoji.textContent = current.emoji;
    itemTile.setAttribute("aria-label", `${current.label}, ziehe ihn zur richtigen Seite`);
    instructionText.textContent = promptSentence();

    feedback.className = "feedback";
    feedbackIcon.textContent = "";
    feedbackTitle.textContent = "";
    feedbackText.textContent = "";

    zoneKueche.classList.remove("hover", "correct", "wrong");
    zoneBad.classList.remove("hover", "correct", "wrong");

    resetItemPosition(false);
    locked = false;

    if (speakNow) speakPrompt();
  }

  function rectContainsPoint(rect, x, y) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function detectZone() {
    const itemRect = itemTile.getBoundingClientRect();
    const cx = itemRect.left + itemRect.width / 2;
    const cy = itemRect.top + itemRect.height / 2;

    if (rectContainsPoint(zoneKueche.getBoundingClientRect(), cx, cy)) return zoneKueche;
    if (rectContainsPoint(zoneBad.getBoundingClientRect(), cx, cy)) return zoneBad;
    return null;
  }

  function handlePointerDown(event) {
    if (locked) return;

    event.preventDefault();
    pointerId = event.pointerId;
    itemTile.setPointerCapture(pointerId);
    dragging = true;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    itemTile.style.transition = "none";
    itemTile.classList.add("dragging");
  }

  function handlePointerMove(event) {
    if (!dragging || event.pointerId !== pointerId) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;
    itemTile.style.transform = `translate(${dx}px, ${dy}px)`;

    const zone = detectZone();
    zoneKueche.classList.toggle("hover", zone === zoneKueche);
    zoneBad.classList.toggle("hover", zone === zoneBad);
  }

  function handlePointerUp(event) {
    if (!dragging || event.pointerId !== pointerId) return;

    dragging = false;
    itemTile.classList.remove("dragging");
    zoneKueche.classList.remove("hover");
    zoneBad.classList.remove("hover");

    if (!moved) {
      speakPrompt();
      return;
    }

    const zone = detectZone();
    if (!zone) {
      resetItemPosition(true);
      return;
    }

    const chosenRoom = zone.dataset.room;

    if (chosenRoom === current.room) {
      locked = true;
      zone.classList.add("correct");
      doBoboSalto();

      feedback.className = "feedback good";
      feedbackIcon.textContent = "✓";
      feedbackTitle.textContent = "Richtig!";
      feedbackText.textContent = `${current.label} gehört in ${ROOM_ARTICLE[current.room]}.`;

      const sentence = `Super! Richtig. ${current.label} gehört in ${ROOM_ARTICLE[current.room]}.`;
      speak(sentence, () => {
        clearTimeout(nextTimer);
        nextTimer = setTimeout(() => setNewRound({ speakNow: true }), 450);
      });
    } else {
      zone.classList.add("wrong");
      setTimeout(() => zone.classList.remove("wrong"), 500);
      resetItemPosition(true);

      feedback.className = "feedback bad";
      feedbackIcon.textContent = "↻";
      feedbackTitle.textContent = "Noch einmal.";
      feedbackText.textContent = `${current.label} gehört nicht in ${ROOM_ARTICLE[chosenRoom]}. Versuch's noch mal!`;

      speak(`Fast! ${current.label} gehört nicht in ${ROOM_ARTICLE[chosenRoom]}. Versuch's noch mal.`);
    }
  }

  itemTile.addEventListener("pointerdown", handlePointerDown);
  itemTile.addEventListener("pointermove", handlePointerMove);
  itemTile.addEventListener("pointerup", handlePointerUp);
  itemTile.addEventListener("pointercancel", handlePointerUp);

  speechButton.addEventListener("click", speakPrompt);
  boboButton.addEventListener("click", speakPrompt);

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  setNewRound();
})();
