(() => {
  const instructionText = document.getElementById("instructionText");
  const speechButton = document.getElementById("speechButton");

  const dressStage = document.getElementById("dressStage");
  const boboImage = document.getElementById("boboImage");
  const dressOptions = document.getElementById("dressOptions");

  const fireStage = document.getElementById("fireStage");
  const fireScene = document.querySelector(".fire-scene");
  const firefighterImage = document.getElementById("firefighterImage");
  const houseWrap = document.getElementById("houseWrap");
  const houseImage = document.getElementById("houseImage");
  const fireProgress = document.getElementById("fireProgress");

  const doneStage = document.getElementById("doneStage");
  const doneTitle = document.getElementById("doneTitle");
  const doneText = document.getElementById("doneText");
  const restartButton = document.getElementById("restartButton");

  const IMAGE_MAP = {
    "": "bobo-unterhose.jpg",
    "oberteil": "bobo-oberteil.jpg",
    "hose": "bobo-hose.jpg",
    "hose,oberteil": "bobo-oberteil-hose.jpg",
    "helm,hose,oberteil": "bobo-oberteil-hose-helm.jpg",
    "hose,oberteil,schuhe": "bobo-oberteil-hose-schuhe.jpg",
    "helm,hose,oberteil,schuhe": "bobo-oberteil-hose-schuhe-helm.jpg",
    "handschuhe,helm,hose,oberteil,schuhe": "bobo-oberteil-hose-schuhe-helm-handschuhe.jpg",
    "handschuhe,helm,hose,oberteil,oxygen,schuhe": "bobo-oberteil-hose-schuhe-helm-handschuhe-oxygenflasche.jpg"
  };

  const DRESS_STEPS = [
    {
      prompt: "Zieh Bobo als Feuerwehrmann an! Wähle zuerst das Oberteil oder die Hose.",
      items: [
        { key: "oberteil", label: "Oberteil", icon: "oberteil.png" },
        { key: "hose", label: "Hose", icon: "hose.png" }
      ]
    },
    {
      prompt: "Jetzt der Helm oder die Stiefel.",
      items: [
        { key: "helm", label: "Helm", icon: "helm.png" },
        { key: "schuhe", label: "Stiefel", icon: "stiefel.png" }
      ]
    },
    {
      prompt: "Jetzt noch die Handschuhe.",
      items: [
        { key: "handschuhe", label: "Handschuhe", icon: "handschuhe.png" }
      ]
    },
    {
      prompt: "Zum Schluss die Sauerstoffflasche.",
      items: [
        { key: "oxygen", label: "Sauerstoffflasche", icon: "oxygen-tank.png" }
      ]
    }
  ];

  const WINDOWS = [
    { id: "w1", left: 27, top: 37 },
    { id: "w2", left: 50.5, top: 37 },
    { id: "w3", left: 73.5, top: 37 },
    { id: "w4", left: 27, top: 66 },
    { id: "w5", left: 73.5, top: 66 }
  ];

  let wornKeys = new Set();
  let stepIndex = 0;
  let pendingKeys = [];

  let burningWindowId = null;
  let extinguishedCount = 0;
  let targetCount = 6;
  let fireLocked = false;

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

  function setInstruction(text, { speakNow = true } = {}) {
    instructionText.textContent = text;
    if (speakNow) speak(text);
  }

  function repeatInstruction() {
    speak(instructionText.textContent);
  }

  function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  // --- Phase 1: Anziehen ---

  function imageForWorn() {
    const key = [...wornKeys].sort().join(",");
    return IMAGE_MAP[key];
  }

  function renderDressStep() {
    const step = DRESS_STEPS[stepIndex];
    pendingKeys = step.items.map(item => item.key);

    dressOptions.innerHTML = "";
    for (const item of step.items) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.dataset.key = item.key;
      button.setAttribute("aria-label", item.label);

      const img = document.createElement("img");
      img.src = item.icon;
      img.alt = "";
      img.className = "option-icon";

      const label = document.createElement("span");
      label.className = "option-label";
      label.textContent = item.label;

      button.append(img, label);
      button.addEventListener("click", () => handleDressPick(item.key, button));
      dressOptions.append(button);
    }

    setInstruction(step.prompt);
  }

  function handleDressPick(key, button) {
    if (!pendingKeys.includes(key)) return;

    wornKeys.add(key);
    boboImage.src = imageForWorn();
    button.remove();
    pendingKeys = pendingKeys.filter(k => k !== key);

    if (pendingKeys.length > 0) {
      const remaining = DRESS_STEPS[stepIndex].items.find(item => pendingKeys.includes(item.key));
      setInstruction(`Jetzt noch: ${remaining.label}.`);
      return;
    }

    stepIndex += 1;

    if (stepIndex < DRESS_STEPS.length) {
      renderDressStep();
    } else {
      finishDressing();
    }
  }

  function finishDressing() {
    dressOptions.innerHTML = "";
    boboImage.classList.add("celebrate");
    setInstruction("Bravo! Bobo ist bereit für den Einsatz!");

    setTimeout(() => {
      boboImage.classList.remove("celebrate");
      dressStage.hidden = true;
      fireStage.hidden = false;
      startFirePhase();
    }, 2200);
  }

  // --- Phase 2: Löscheinsatz ---

  function buildHouseWindows() {
    houseWrap.querySelectorAll(".window-hotspot").forEach(el => el.remove());

    for (const win of WINDOWS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "window-hotspot";
      button.dataset.id = win.id;
      button.style.left = `${win.left}%`;
      button.style.top = `${win.top}%`;
      button.setAttribute("aria-label", "Fenster");

      const flame1 = document.createElement("img");
      flame1.src = "feuer-transparent-1.png";
      flame1.alt = "";
      flame1.className = "flame flame--a";

      const flame2 = document.createElement("img");
      flame2.src = "feuer-transparent-2.png";
      flame2.alt = "";
      flame2.className = "flame flame--b";

      button.append(flame1, flame2);
      button.addEventListener("click", () => handleWindowClick(win));
      houseWrap.append(button);
    }
  }

  function startFirePhase() {
    extinguishedCount = 0;
    targetCount = randomInt(6, 8);
    fireLocked = false;
    buildHouseWindows();
    updateFireProgress();
    igniteWindow();
  }

  function updateFireProgress() {
    fireProgress.textContent = `Gelöschte Brände: ${extinguishedCount} / ${targetCount}`;
  }

  function igniteWindow(excludeId) {
    const choices = WINDOWS.filter(w => w.id !== excludeId);
    const chosen = choices[randomInt(0, choices.length - 1)];
    burningWindowId = chosen.id;

    houseWrap.querySelectorAll(".window-hotspot").forEach(el => {
      el.classList.toggle("is-burning", el.dataset.id === chosen.id);
    });

    setInstruction("Wo brennt es? Klick auf das brennende Fenster!");
  }

  function handleWindowClick(win) {
    if (fireLocked) return;

    const button = houseWrap.querySelector(`.window-hotspot[data-id="${win.id}"]`);

    if (win.id !== burningWindowId) {
      button.classList.add("shake");
      setTimeout(() => button.classList.remove("shake"), 400);
      speak("Dort brennt es nicht. Schau genau hin!");
      return;
    }

    fireLocked = true;
    button.classList.remove("is-burning");
    button.classList.add("just-extinguished");
    setTimeout(() => button.classList.remove("just-extinguished"), 500);

    spawnWaterSpray(button);
    extinguishedCount += 1;
    updateFireProgress();

    const finished = extinguishedCount >= targetCount;
    speak(finished ? "Super gelöscht! Bobo hat es geschafft!" : "Toll gelöscht!", () => {
      setTimeout(() => {
        fireLocked = false;
        if (finished) {
          finishFirePhase();
        } else {
          igniteWindow(win.id);
        }
      }, 400);
    });
  }

  function spawnWaterSpray(targetButton) {
    const sceneRect = fireScene.getBoundingClientRect();
    const fireRect = firefighterImage.getBoundingClientRect();
    const targetRect = targetButton.getBoundingClientRect();

    const startX = fireRect.left + fireRect.width * 0.82 - sceneRect.left;
    const startY = fireRect.top + fireRect.height * 0.38 - sceneRect.top;
    const endX = targetRect.left + targetRect.width / 2 - sceneRect.left;
    const endY = targetRect.top + targetRect.height / 2 - sceneRect.top;

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    const spray = document.createElement("img");
    spray.src = "wasser-transparent-1.png";
    spray.alt = "";
    spray.className = "water-spray";
    spray.style.left = `${startX}px`;
    spray.style.top = `${startY}px`;
    spray.style.width = `${distance}px`;
    spray.style.transform = `rotate(${angle}deg)`;

    fireScene.append(spray);
    setTimeout(() => spray.remove(), 550);
  }

  function finishFirePhase() {
    fireStage.hidden = true;
    doneTitle.textContent = "Super gemacht!";
    doneText.textContent = `Bobo hat ${targetCount} Brände gelöscht. Der Feuerwehreinsatz war ein voller Erfolg!`;
    doneStage.hidden = false;
    speak("Super gemacht! Der Feuerwehreinsatz war ein voller Erfolg!");
  }

  // --- Neustart ---

  function restartGame() {
    wornKeys = new Set();
    stepIndex = 0;
    boboImage.src = "bobo-unterhose.jpg";

    doneStage.hidden = true;
    fireStage.hidden = true;
    dressStage.hidden = false;

    renderDressStep();
  }

  speechButton.addEventListener("click", repeatInstruction);
  restartButton.addEventListener("click", restartGame);

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  renderDressStep();
})();
