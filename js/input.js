// Input capture methods (mouse, touch, dwell)

import {
  state,
  elements,
  settings,
  highlightKey,
  addKeyToSequence,
  updateDebugInfo,
} from "./core.js";
import { clearPath, isWithinKeyboardBoundary } from "./ui.js";
import { getRealtimePredictions, deleteLastWord } from "./prediction.js";

// State for input tracking
const inputState = {
  dwellTimer: null,
  currentDwellElement: null,
  lastPosition: { x: 0, y: 0 },
  predictionDebounceTimer: null,
};

// Initialize input handlers
function initInputHandlers() {
  // Touch input
  initTouchHandlers();
  // Mouse hover input
  initMouseHoverHandlers();
  // Dwell input
  initDwellHandlers();

  // Add handler for action keys (backspace)
  document.querySelectorAll(".key[data-action]").forEach((key) => {
    key.addEventListener("click", function () {
      const action = this.getAttribute("data-action");
      if (action === "backspace") {
        deleteLastWord();
      }
    });
  });
}

// Touch event handlers
function initTouchHandlers() {
  elements.keyboard.addEventListener("touchstart", function (event) {
    if (!state.isCapturing) return;
    state.captureMethod = "Touch";

    // Clear the previous path
    window.dispatchEvent(new CustomEvent("clearSwipePath"));

    // Add first point to the path
    const touch = event.touches[0];
    window.dispatchEvent(
      new CustomEvent("mousePositionUpdate", {
        detail: { x: touch.clientX, y: touch.clientY },
      })
    );

    updateDebugInfo();
    event.preventDefault();
  });

  elements.keyboard.addEventListener("touchmove", function (event) {
    if (!state.isCapturing) return;
    const touch = event.touches[0];

    // Add point to the path
    window.dispatchEvent(
      new CustomEvent("mousePositionUpdate", {
        detail: { x: touch.clientX, y: touch.clientY },
      })
    );

    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.classList.contains("key")) {
      const letter = target.getAttribute("data-letter");
      highlightKey(target);
      if (addKeyToSequence(letter)) {
        // If sequence was changed, update real-time predictions
        debounceRealtimePredictions();
      }
    }
    event.preventDefault();
  });

  elements.keyboard.addEventListener("touchend", function (event) {
    if (!state.isCapturing) return;
    console.log("Final Swipe Sequence:", state.swipeSequence.join(""));
    updateDebugInfo();

    // Add fade-out animation to the path
    window.dispatchEvent(new CustomEvent("fadeSwipePath"));

    event.preventDefault();
  });
}

// Function to debounce real-time predictions
function debounceRealtimePredictions() {
  clearTimeout(inputState.predictionDebounceTimer);
  inputState.predictionDebounceTimer = setTimeout(() => {
    getRealtimePredictions();
  }, 200); // Debounce time in ms
}

// Mouse hover event handlers
function initMouseHoverHandlers() {
  document.querySelectorAll(".key").forEach((key) => {
    key.addEventListener("mouseenter", function () {
      if (!state.isCapturing) return;
      const letter = this.getAttribute("data-letter");
      highlightKey(this);
      if (addKeyToSequence(letter)) {
        // If sequence was changed, update real-time predictions
        debounceRealtimePredictions();
      }
    });
  });
}

// Dwell functionality
function initDwellHandlers() {
  // Dwell settings controls
  elements.dwellTimeSlider.addEventListener("input", function () {
    settings.dwellTime = parseInt(this.value);
    elements.dwellTimeValue.textContent = `${settings.dwellTime}ms`;
    clearTimeout(inputState.dwellTimer);
  });

  elements.toleranceSlider.addEventListener("input", function () {
    settings.movementTolerance = parseInt(this.value);
    elements.toleranceValue.textContent = settings.movementTolerance;
  });

  // Mouse movement with dwell capability
  document.addEventListener("mousemove", handleMouseMovement);
}

// Handle mouse movement for dwell functionality
function handleMouseMovement(event) {
  const x = event.clientX;
  const y = event.clientY;

  // Only process if within keyboard boundary or if we're already capturing
  if (state.isCapturing && isWithinKeyboardBoundary(x, y)) {
    // Update path if capturing (handled in UI module)
    window.dispatchEvent(
      new CustomEvent("mousePositionUpdate", {
        detail: { x, y },
      })
    );

    // Calculate movement distance
    const distance = Math.sqrt(
      Math.pow(x - inputState.lastPosition.x, 2) +
        Math.pow(y - inputState.lastPosition.y, 2)
    );

    // Update last position
    inputState.lastPosition.x = x;
    inputState.lastPosition.y = y;

    // Get element under cursor
    const targetElement = document.elementFromPoint(x, y);

    // If movement is greater than tolerance or target changed, reset dwell timer
    if (
      distance > settings.movementTolerance ||
      targetElement !== inputState.currentDwellElement
    ) {
      clearTimeout(inputState.dwellTimer);
      inputState.currentDwellElement = targetElement;

      // Only process keys during active capture
      if (
        state.isCapturing &&
        targetElement &&
        targetElement.classList.contains("key")
      ) {
        inputState.dwellTimer = setTimeout(() => {
          const letter = targetElement.getAttribute("data-letter");
          highlightKey(targetElement);

          // Flash effect to indicate selection
          targetElement.classList.add("dwell-selected");
          setTimeout(() => {
            targetElement.classList.remove("dwell-selected");
          }, 400);

          // If sequence was changed, update real-time predictions
          if (addKeyToSequence(letter)) {
            debounceRealtimePredictions();
          }
        }, settings.dwellTime);
      }
    }
  } else {
    // If outside keyboard boundary, clear dwell timer
    clearTimeout(inputState.dwellTimer);
    inputState.currentDwellElement = null;
  }
}

export { initInputHandlers };
