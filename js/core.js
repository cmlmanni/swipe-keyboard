// Core functionality and shared variables

// Shared state
const state = {
  swipeSequence: [],
  isCapturing: false,
  captureMethod: "None",
  suggestedWords: [],
  useTestMode: true,
  continuousMode: false, // Add this line for continuous mode
};

// DOM element references
const elements = {
  keyboard: document.getElementById("keyboard"),
  sequenceDisplay: document.getElementById("sequence"),
  statusDisplay: document.getElementById("status"),
  captureMethodDisplay: document.getElementById("captureMethod"),
  lastKeyDisplay: document.getElementById("lastKey"),
  completeSequenceDisplay: document.getElementById("completeSequence"),
  captureToggle: document.getElementById("captureToggle"),
  wordSuggestionsContainer: document.getElementById("wordSuggestions"),
  selectedWordsContainer: document.getElementById("selectedWords"),
  dwellTimeSlider: document.getElementById("dwellTime"),
  dwellTimeValue: document.getElementById("dwellTimeValue"),
  toleranceSlider: document.getElementById("tolerance"),
  toleranceValue: document.getElementById("toleranceValue"),
  accessibilityControls: document.getElementById("accessibilityControls"),
};

// Settings
const settings = {
  dwellTime: parseInt(elements.dwellTimeSlider.value) || 500,
  movementTolerance: parseInt(elements.toleranceSlider.value) || 3,
};

// Update debug info panel
function updateDebugInfo(letter) {
  elements.statusDisplay.textContent = state.isCapturing ? "Capturing" : "Idle";
  elements.captureMethodDisplay.textContent = state.captureMethod;
  if (letter) {
    elements.lastKeyDisplay.textContent = letter;
  }
  elements.completeSequenceDisplay.textContent = state.swipeSequence.join("");
}

// Manage key highlighting
function highlightKey(element) {
  if (element && element.classList.contains("key")) {
    // Remove active class from all keys
    document.querySelectorAll(".key.active").forEach((key) => {
      key.classList.remove("active");
    });
    // Add active class to current key
    element.classList.add("active");
  }
}

function resetHighlighting() {
  document.querySelectorAll(".key.active").forEach((key) => {
    key.classList.remove("active");
  });
}

// Add a key to the swipe sequence
function addKeyToSequence(letter) {
  if (
    !state.swipeSequence.length ||
    state.swipeSequence[state.swipeSequence.length - 1] !== letter
  ) {
    state.swipeSequence.push(letter);
    elements.sequenceDisplay.innerText = state.swipeSequence.join("");
    updateDebugInfo(letter);
    return true;
  }
  return false;
}

// Reset the current sequence
function resetSequence() {
  state.swipeSequence = [];
  elements.sequenceDisplay.innerText = "";
}

// Export objects and functions
export {
  state,
  elements,
  settings,
  updateDebugInfo,
  highlightKey,
  resetHighlighting,
  addKeyToSequence,
  resetSequence,
};
