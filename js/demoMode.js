import { state, elements, addKeyToSequence, resetSequence } from "./core.js";
import { getRealtimePredictions, selectWord } from "./prediction.js";
import { clearPath } from "./ui.js";

// Demo state
let demoActive = false;
let demoInterval;
let currentDemoScenario = 0;

// AI engineering related terms and phrases for Phil's demo
const demoScenarios = [
  {
    swipe: "NRLFCLINTLGN",
    word: "neural",
    followUp: ["network", "processing", "architecture"],
  },
  {
    swipe: "MACHNJKRLNG",
    word: "machine",
    followUp: ["learning", "model", "algorithm"],
  },
  {
    swipe: "DTSDVBNCT",
    word: "data",
    followUp: ["science", "analysis", "processing"],
  },
  {
    swipe: "ATRFCLINTLGN",
    word: "artificial",
    followUp: ["intelligence", "systems", "agents"],
  },
  {
    swipe: "DEEPRLNG",
    word: "deep",
    followUp: ["learning", "neural", "networks"],
  },
  {
    swipe: "CPTVTR",
    word: "computer",
    followUp: ["vision", "science", "processing"],
  },
  {
    swipe: "NLTRLNG",
    word: "natural",
    followUp: ["language", "processing", "understanding"],
  },
  {
    swipe: "ALGRTHM",
    word: "algorithm",
    followUp: ["design", "analysis", "optimization"],
  },
  {
    swipe: "MDLTRNG",
    word: "model",
    followUp: ["training", "evaluation", "tuning"],
  },
];

// Function to simulate a swipe pattern
function simulateSwipe(swipePattern) {
  resetSequence();

  // Add letters to sequence one by one with delay
  const letters = swipePattern.split("");
  let index = 0;

  const letterInterval = setInterval(() => {
    if (index < letters.length) {
      addKeyToSequence(letters[index]);
      // Highlight the corresponding key
      const key = document.querySelector(
        `.key[data-letter="${letters[index]}"]`
      );
      if (key) {
        key.classList.add("active");
        setTimeout(() => key.classList.remove("active"), 150);
      }
      index++;

      // Update predictions in real-time
      if (index % 2 === 0) {
        getRealtimePredictions();
      }
    } else {
      clearInterval(letterInterval);
      // Final prediction after complete swipe
      getRealtimePredictions();

      // Wait and then select the word
      setTimeout(() => {
        if (demoActive) {
          selectWord(demoScenarios[currentDemoScenario].word);

          // Wait and select a follow-up word
          setTimeout(() => {
            if (demoActive) {
              const followUpWord =
                demoScenarios[currentDemoScenario].followUp[
                  Math.floor(
                    Math.random() *
                      demoScenarios[currentDemoScenario].followUp.length
                  )
                ];

              // Simulate typing the follow-up word
              simulateFollowUpWord(followUpWord);
            }
          }, 1200);
        }
      }, 800);
    }
  }, 150);
}

// Function to simulate typing a follow-up word
function simulateFollowUpWord(word) {
  // Create a simplified swipe pattern for the follow-up word
  const swipePattern = word.toUpperCase().replace(/[AEIOU]/g, "");
  simulateSwipe(swipePattern);
}

// Start the demo mode
function startDemoMode() {
  if (demoActive) return;

  demoActive = true;
  state.isCapturing = true;
  state.continuousMode = true;

  elements.captureToggle.classList.add("active");
  elements.captureToggle.textContent = "Stop Demo";

  // Create a visual indicator for demo mode
  const demoIndicator = document.createElement("div");
  demoIndicator.id = "demoModeIndicator";
  demoIndicator.textContent = "DEMO MODE ACTIVE";
  demoIndicator.style.position = "fixed";
  demoIndicator.style.top = "10px";
  demoIndicator.style.right = "10px";
  demoIndicator.style.backgroundColor = "#ff5722";
  demoIndicator.style.color = "white";
  demoIndicator.style.padding = "5px 10px";
  demoIndicator.style.borderRadius = "5px";
  demoIndicator.style.zIndex = "9999";
  document.body.appendChild(demoIndicator);

  // Start the demo sequence
  runNextDemoScenario();

  // Set interval to continue demo
  demoInterval = setInterval(runNextDemoScenario, 5000);
}

// Run the next demo scenario
function runNextDemoScenario() {
  if (!demoActive) return;

  // Clear any existing paths
  clearPath();

  // Move to next scenario, loop back to start if necessary
  currentDemoScenario = (currentDemoScenario + 1) % demoScenarios.length;

  // Simulate the swipe for this scenario
  simulateSwipe(demoScenarios[currentDemoScenario].swipe);
}

// Stop the demo mode
function stopDemoMode() {
  if (!demoActive) return;

  demoActive = false;
  clearInterval(demoInterval);

  // Remove the visual indicator
  const indicator = document.getElementById("demoModeIndicator");
  if (indicator) {
    indicator.remove();
  }

  // Reset UI state
  elements.captureToggle.textContent = "Start Capturing";
  elements.captureToggle.classList.remove("active");
}

// Toggle the demo mode
function toggleDemoMode() {
  if (demoActive) {
    stopDemoMode();
  } else {
    startDemoMode();
  }
}

export { startDemoMode, stopDemoMode, toggleDemoMode };
