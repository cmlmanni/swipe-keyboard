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
import {
  getRealtimePredictions,
  deleteLastWord,
  deleteAllText,
} from "./prediction.js";

// State for input tracking
const inputState = {
  dwellTimer: null,
  currentDwellElement: null,
  lastPosition: { x: 0, y: 0 },
  predictionDebounceTimer: null,
  guardPeriod: false,
};

const backspaceState = {
  isPressed: false,
  initialDelay: 700, // Wait this long before starting continuous deletion
  repeatDelay: 250, // Delete every X ms after initial delay
  deleteTimer: null,
};

// Initialize input handlers
function initInputHandlers() {
  // Touch input
  initTouchHandlers();
  // Mouse hover input
  initMouseHoverHandlers();
  // Dwell input
  initDwellHandlers();
  // Initialize action key handlers (includes backspace)
  initActionKeysHandlers();
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

// Add this function to clear all dwell timers
function clearDwellTimers() {
  clearTimeout(inputState.dwellTimer);
  inputState.currentDwellElement = null;

  // Also reset highlighted keys
  document.querySelectorAll(".key.active").forEach((key) => {
    key.classList.remove("active");
  });

  // Add a short guard period to prevent immediate re-capture
  inputState.guardPeriod = true;
  setTimeout(() => {
    inputState.guardPeriod = false;
  }, 500); // 500ms guard period
}

// Handle mouse movement for dwell functionality
function handleMouseMovement(event) {
  // Skip during guard period
  if (inputState.guardPeriod) return;

  const x = event.clientX;
  const y = event.clientY;

  // Get the actual keyboard element's boundaries
  const keyboardRect = elements.keyboard.getBoundingClientRect();

  // Check if mouse is directly over the keyboard, not just within the larger boundary
  const isDirectlyOverKeyboard =
    x >= keyboardRect.left &&
    x <= keyboardRect.right &&
    y >= keyboardRect.top &&
    y <= keyboardRect.bottom;

  // Only process if directly over the keyboard
  if (state.isCapturing && isDirectlyOverKeyboard) {
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

// Update initBackspaceHandlers to handle all action keys
function initActionKeysHandlers() {
  // Get all action keys
  const actionKeys = document.querySelectorAll(".key[data-action]");

  actionKeys.forEach((key) => {
    const action = key.getAttribute("data-action");

    // Handle mousedown
    key.addEventListener("mousedown", function (e) {
      e.preventDefault();

      switch (action) {
        case "backspace":
          // Handle backspace
          backspaceState.isPressed = true;
          deleteLastWord();
          backspaceState.deleteTimer = setTimeout(function () {
            startContinuousDelete();
          }, backspaceState.initialDelay);
          break;

        case "delete-all":
          // Handle delete all
          deleteAllText();
          break;

        case "space":
          // Handle space key
          const selectedWordsElement = elements.selectedWordsContainer;

          if (selectedWordsElement.textContent) {
            // Only add space if the last character isn't already a space
            const currentText = selectedWordsElement.textContent;
            if (currentText[currentText.length - 1] !== " ") {
              selectedWordsElement.textContent += " ";

              // Add visual feedback for the space action
              key.classList.add("active");
              setTimeout(() => key.classList.remove("active"), 150);

              // If we're in capturing mode, stop capturing like other actions
              if (state.isCapturing && !state.continuousMode) {
                state.isCapturing = false;
                elements.captureToggle.textContent = "Start Capturing";
                elements.captureToggle.classList.remove("active");
              }
            }
          }
          break;
      }
    });

    // Handle mouseup for keys that need it
    if (action === "backspace") {
      ["mouseup", "mouseleave"].forEach((event) => {
        key.addEventListener(event, function () {
          stopContinuousDelete();
        });
      });
    }

    // Handle touch events
    key.addEventListener("touchstart", function (e) {
      e.preventDefault();

      switch (action) {
        case "backspace":
          backspaceState.isPressed = true;
          deleteLastWord();
          backspaceState.deleteTimer = setTimeout(function () {
            startContinuousDelete();
          }, backspaceState.initialDelay);
          break;

        case "delete-all":
          deleteAllText();
          break;

        case "space":
          const selectedWordsElement = elements.selectedWordsContainer;

          if (selectedWordsElement.textContent) {
            // Only add space if the last character isn't already a space
            const currentText = selectedWordsElement.textContent;
            if (currentText[currentText.length - 1] !== " ") {
              selectedWordsElement.textContent += " ";

              // Add visual feedback
              key.classList.add("active");
              setTimeout(() => key.classList.remove("active"), 150);

              // If we're in capturing mode, stop capturing
              if (state.isCapturing && !state.continuousMode) {
                state.isCapturing = false;
                elements.captureToggle.textContent = "Start Capturing";
                elements.captureToggle.classList.remove("active");
              }
            }
          }
          break;
      }
    });

    if (action === "backspace") {
      ["touchend", "touchcancel"].forEach((event) => {
        key.addEventListener(event, function () {
          stopContinuousDelete();
        });
      });
    }
  });
}

// Function to start continuous deletion
function startContinuousDelete() {
  if (!backspaceState.isPressed) return;

  // Delete a word
  deleteLastWord();

  // Schedule the next deletion
  backspaceState.deleteTimer = setTimeout(function () {
    startContinuousDelete();
  }, backspaceState.repeatDelay);
}

// Function to stop continuous deletion
function stopContinuousDelete() {
  backspaceState.isPressed = false;
  clearTimeout(backspaceState.deleteTimer);
}

export {
  initInputHandlers,
  clearDwellTimers, // Add this export
};
