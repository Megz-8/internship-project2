// Elements references
const storyListEl = document.getElementById("story-list");
const storySelectionPanel = document.getElementById("story-selection");
const storyAreaPanel = document.getElementById("story-area");

const storyTitleEl = document.getElementById("story-title");
const storyImageEl = document.getElementById("story-image");
const storyTextEl = document.getElementById("story-text");
const choicesContainer = document.getElementById("choices-container");

const moralContainer = document.getElementById("moral-container");
const moralTextEl = document.getElementById("moral-text");
const returnButton = document.getElementById("return-button");

const nextButton = document.getElementById("next-button");

const backgroundMusic = document.getElementById("background-music");

let currentStory = null;
let currentStepIndex = 0;
let historyStack = [];
let selectedChoice = null;

const speechSynth = window.speechSynthesis;
let utterance = null;

// Define stories with paragraphs, choices, and moral
const stories = {
  "The Wise Forest": {
    title: "The Wise Forest",
    music:
      "https://cdn.pixabay.com/download/audio/2023/04/30/audio_87a2fd4bb1.mp3?filename=dreamy-meditation-1371.mp3",
    moral: "Wisdom comes from trusting both your heart and your mind.",
    steps: [
      {
        image: "https://i.imgur.com/NVYu4Zf.jpg",
        text: "At the edge of a mysterious forest, you stand wondering whether to enter or return home safely.",
        question: "Do you choose to enter the forest or return home?",
        choices: [
          { text: "Enter forest", nextStep: 1 },
          { text: "Return home", nextStep: 7 },
        ],
      },
      {
        image: "https://i.imgur.com/8VxlCm7.jpg",
        text: "You step into the forest and hear a whisper calling you deeper inside.",
        question: "Do you follow the whisper or stay on the path?",
        choices: [
          { text: "Follow whisper", nextStep: 2 },
          { text: "Stay on path", nextStep: 3 },
        ],
      },
      {
        image: "https://i.imgur.com/pYOy7VW.jpg",
        text: "The whisper leads you to an ancient tree glowing with runes.",
        question: "Do you try to decipher the runes or rest?",
        choices: [
          { text: "Decipher runes", nextStep: 4 },
          { text: "Rest", nextStep: 5 },
        ],
      },
      {
        image: "https://i.imgur.com/1PJ9p5R.jpg",
        text: "The path opens to a moonlit clearing with a wise figure standing silently.",
        question: "Do you approach the figure or continue alone?",
        choices: [
          { text: "Approach figure", nextStep: 6 },
          { text: "Continue alone", nextStep: 7 },
        ],
      },
      {
        image: "https://i.imgur.com/MddNdrM.jpg",
        text: "Deciphering the runes reveals a hidden cavern with sparkling treasures but unknown dangers.",
        question: "Do you enter the cavern or retreat?",
        choices: [
          { text: "Enter cavern", nextStep: 8 },
          { text: "Retreat", nextStep: 7 },
        ],
      },
      {
        image: "https://i.imgur.com/6OsUCuo.jpg",
        text: "You relax under the tree and regain strength for the journey ahead.",
        question: "Do you now continue deeper or head back?",
        choices: [
          { text: "Continue deeper", nextStep: 2 },
          { text: "Head back", nextStep: 7 },
        ],
      },
      {
        image: "https://i.imgur.com/ujroQFy.jpg",
        text: "The wise figure teaches you ancient magic to protect your journey.",
        question: "Do you trust the magic or decline politely?",
        choices: [
          { text: "Trust magic", nextStep: 8 },
          { text: "Decline", nextStep: 7 },
        ],
      },
      {
        image: "https://i.imgur.com/2Mt9FWo.jpg",
        text: "You return safely home, wondering what adventures you might have missed.",
        question: null,
        choices: [],
      },
      {
        image: "https://i.imgur.com/bb8zwCe.jpg",
        text: "With magic protective charm, you venture into the treasure cavern and claim your prize.",
        question: "Do you keep the treasure or share it?",
        choices: [
          { text: "Keep treasure", nextStep: 9 },
          { text: "Share treasure", nextStep: 10 },
        ],
      },
      {
        image: "https://i.imgur.com/pfLuJ1W.jpg",
        text: "Your greed isolates you, but you become wealthy beyond dreams.",
        question: null,
        choices: [],
      },
      {
        image: "https://i.imgur.com/0SDxy3G.jpg",
        text: "Sharing your treasure brings joy and allies, enhancing your legacy.",
        question: null,
        choices: [],
      },
    ],
  },
};

// Initialize story selection UI
function initStorySelection() {
  storyListEl.innerHTML = "";
  for (const key in stories) {
    const button = document.createElement("button");
    button.textContent = stories[key].title;
    button.className = "btn-primary";
    button.addEventListener("click", () => startStory(key));
    storyListEl.appendChild(button);
  }
  showPanel("story-selection");
}

// Show panel and hide others
function showPanel(panelId) {
  document.querySelectorAll(".panel").forEach((p) =>
    p.classList.add("hidden")
  );
  document.getElementById(panelId).classList.remove("hidden");
}

// Start selected story
function startStory(storyKey) {
  currentStory = stories[storyKey];
  currentStepIndex = 0;
  historyStack = [];
  selectedChoice = null;
  moralContainer.classList.add("hidden");
  storyTitleEl.textContent = currentStory.title;
  backgroundMusic.src = currentStory.music;
  playBackgroundMusic();
  showPanel("story-area");
  showStep(currentStepIndex);
  resetNextButton();
}

// Show story step with narration
async function showStep(stepIndex) {
  const step = currentStory.steps[stepIndex];
  if (!step) {
    showMoral();
    return;
  }

  // Update image with 3D effect transitions
  await fadeImageTo(step.image);

  // Narrate and show text letter by letter
  await narrateText(step.text);

  // Show question and choices as radio buttons
  showQuestionAndChoices(step.question, step.choices);
  disableNextButton();
  selectedChoice = null;
}

// Fade image smoothly and apply 3d transform on hover
function fadeImageTo(newSrc) {
  return new Promise((resolve) => {
    storyImageEl.style.opacity = "0";
    setTimeout(() => {
      storyImageEl.src = newSrc;
      storyImageEl.style.opacity = "1";
      resolve();
    }, 600);
  });
}

// Use speech synthesis for narration with cancel for overlapping
function narrateText(text) {
  return new Promise((resolve) => {
    if (utterance) {
      speechSynth.cancel();
    }
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    speechSynth.speak(utterance);

    storyTextEl.textContent = text;
  });
}

// Show question and choices as radio options
function showQuestionAndChoices(question, choices) {
  choicesContainer.innerHTML = "";
  if (question) {
    storyTextEl.textContent = question;
  }
  choices.forEach((choice, index) => {
    const label = document.createElement("label");
    label.className = "choice-label";
    label.setAttribute("tabindex", "0");

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "choice";
    radio.value = choice.nextStep;
    radio.id = `choice-${index}`;
    radio.addEventListener("change", () => {
      selectedChoice = choice.nextStep;
      enableNextButton();
    });

    label.appendChild(radio);
    label.insertAdjacentText("beforeend", ` ${choice.text}`);
    choicesContainer.appendChild(label);
  });

  choicesContainer.classList.remove("hidden");
}

function resetNextButton() {
  nextButton.disabled = true;
}

function enableNextButton() {
  nextButton.disabled = false;
}

function disableNextButton() {
  nextButton.disabled = true;
}

nextButton.addEventListener("click", () => {
  if (selectedChoice == null) return;
  historyStack.push(currentStepIndex);
  currentStepIndex = selectedChoice;
  showStep(currentStepIndex);
});

// Show moral and return button at story end
function showMoral() {
  choicesContainer.classList.add("hidden");
  nextButton.classList.add("hidden");
  moralTextEl.textContent = currentStory.moral;
  moralContainer.classList.remove("hidden");
}

// Return to story selection panel
returnButton.addEventListener("click", () => {
  speechSynth.cancel();
  backgroundMusic.pause();
  showPanel("story-selection");
  initStorySelection();
  moralContainer.classList.add("hidden");
  nextButton.classList.remove("hidden");
  choicesContainer.classList.remove("hidden");
  currentStory = null;
  currentStepIndex = 0;
  historyStack = [];
  selectedChoice = null;
});

// Play background music with mute policy handling
function playBackgroundMusic() {
  backgroundMusic.volume = 0.4;
  backgroundMusic.muted = false;
  const playPromise = backgroundMusic.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      document.body.addEventListener(
        "click",
        function unlockAudio() {
          backgroundMusic.play();
          document.body.removeEventListener("click", unlockAudio);
        },
        { once: true }
      );
    });
  }
}

// Initialize app on load
window.onload = () => {
  initStorySelection();

  // Enable 3D hover effects on image (optional extra)
  storyImageEl.addEventListener("mousemove", (e) => {
    const rect = storyImageEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    storyImageEl.style.transform = `rotateY(${dx * 10}deg) rotateX(${
      -dy * 10
    }deg) scale(1.05)`;
  });
  storyImageEl.addEventListener("mouseleave", () => {
    storyImageEl.style.transform = "rotateY(0deg) rotateX(0deg) scale(1)";
  });
};
