// Input capture methods (mouse, touch, dwell)

import {
  state,
  elements,
  settings,
  highlightKey,
  addKeyToSequence,
  updateDebugInfo,
} from "./core.js";
import { clearPath } from "./ui.js";

// State for input tracking
const inputState = {
  dwellTimer: null,
  currentDwellElement: null,
  lastPosition: { x: 0, y: 0 },
};

// Initialize input handlers
function initInputHandlers() {
  // Touch input
  initTouchHandlers();
  // Mouse hover input
  initMouseHoverHandlers();
  // Dwell input
  initDwellHandlers();
}

// Touch event handlers
function initTouchHandlers() {
  elements.keyboard.addEventListener("touchstart", function (event) {
    if (!state.isCapturing) return;
    state.captureMethod = "Touch";
    updateDebugInfo();
    event.preventDefault();
  });

  elements.keyboard.addEventListener("touchmove", function (event) {
    if (!state.isCapturing) return;
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.classList.contains("key")) {
      const letter = target.getAttribute("data-letter");
      highlightKey(target);
      addKeyToSequence(letter);
    }
    event.preventDefault();
  });

  elements.keyboard.addEventListener("touchend", function (event) {
    if (!state.isCapturing) return;
    console.log("Final Swipe Sequence:", state.swipeSequence.join(""));
    updateDebugInfo();
    event.preventDefault();
  });
}

// Mouse hover event handlers
function initMouseHoverHandlers() {
  document.querySelectorAll(".key").forEach((key) => {
    key.addEventListener("mouseenter", function () {
      if (!state.isCapturing) return;
      const letter = this.getAttribute("data-letter");
      highlightKey(this);
      addKeyToSequence(letter);
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
  // Update path if capturing (handled in UI module)
  if (state.isCapturing) {
    window.dispatchEvent(
      new CustomEvent("mousePositionUpdate", {
        detail: { x: event.clientX, y: event.clientY },
      })
    );
  }

  // Calculate movement distance
  const distance = Math.sqrt(
    Math.pow(event.clientX - inputState.lastPosition.x, 2) +
      Math.pow(event.clientY - inputState.lastPosition.y, 2)
  );

  // Update last position
  inputState.lastPosition.x = event.clientX;
  inputState.lastPosition.y = event.clientY;

  // Get element under cursor
  const targetElement = document.elementFromPoint(event.clientX, event.clientY);

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
        targetElement.style.transition = "background-color 0.1s";
        const originalColor = targetElement.style.backgroundColor;
        targetElement.style.backgroundColor = "#ffcc00";

        setTimeout(() => {
          targetElement.style.backgroundColor = originalColor;
        }, 200);

        addKeyToSequence(letter);
      }, settings.dwellTime);
    }
  }
}

export { initInputHandlers };
