// UI elements and visualizations

import {
  state,
  elements,
  settings,
  resetHighlighting,
  resetSequence,
  updateDebugInfo,
} from "./core.js";
import {
  getPredictionsBasedOnMode,
  displaySuggestions,
  replaceLastWord,
} from "./prediction.js";

// Canvas for path visualization
let canvas;
let ctx;
const pathPoints = [];

// Keyboard boundaries for capture restriction
let keyboardBoundary = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  padding: 10, // Padding in pixels around keyboard
};

// Initialize UI elements
function initUI() {
  // Set up canvas for path visualization
  setupCanvas();

  // Calculate keyboard boundaries
  calculateKeyboardBoundaries();

  // Visualize keyboard boundary (helpful during development)
  visualizeKeyboardBoundary();

  // Set up mode toggle button
  setupModeToggle();

  // Set up capture toggle button
  setupCaptureToggle();

  // Set up accessibility help
  setupAccessibilityHelp();

  // Initialize UI values
  updateUIValues();

  // Listen for mouse position updates (from input.js)
  window.addEventListener("mousePositionUpdate", handleMousePositionUpdate);

  // Listen for window resize to recalculate keyboard boundaries
  window.addEventListener(
    "resize",
    debounce(() => {
      calculateKeyboardBoundaries();
      visualizeKeyboardBoundary();
    }, 250)
  );

  // Add continuous mode toggle
  setupContinuousMode();

  // Listen for word selection to clear the path
  window.addEventListener("wordSelected", () => {
    clearPath();
  });

  // Listen for continuous mode path clearing
  window.addEventListener("resetPathForContinuous", () => {
    clearPath();
  });
}

// Calculate keyboard boundaries for limiting capture area
function calculateKeyboardBoundaries() {
  const keyboardElement = elements.keyboard;
  if (!keyboardElement) return;

  const rect = keyboardElement.getBoundingClientRect();
  const padding = keyboardBoundary.padding;

  keyboardBoundary = {
    top: rect.top - padding,
    left: rect.left - padding,
    right: rect.right + padding,
    bottom: rect.bottom + padding,
    padding: padding,
  };

  console.log("Keyboard boundaries calculated:", keyboardBoundary);
}

// Visualize the keyboard boundary
function visualizeKeyboardBoundary() {
  // First remove any existing boundary visualization
  const existingBoundary = document.querySelector(".keyboard-boundary");
  if (existingBoundary) {
    existingBoundary.remove();
  }

  // Create a boundary visualization element
  const boundaryElement = document.createElement("div");
  boundaryElement.className = "keyboard-boundary";
  elements.keyboard.appendChild(boundaryElement);
}

// Check if a point is within the keyboard boundary
function isWithinKeyboardBoundary(x, y) {
  return (
    x >= keyboardBoundary.left &&
    x <= keyboardBoundary.right &&
    y >= keyboardBoundary.top &&
    y <= keyboardBoundary.bottom
  );
}

// Debounce function for resize events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Set up canvas for path visualization
function setupCanvas() {
  canvas = document.createElement("canvas");
  canvas.id = "pathCanvas";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "1000";
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");

  // Resize canvas when window resizes
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawPath();
  });
}

// Clear path visualization
function clearPath() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pathPoints.length = 0;
  }
}

// Draw the current path
function drawPath() {
  if (!ctx || pathPoints.length < 2) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ff5722";

  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (let i = 1; i < pathPoints.length; i++) {
    ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
  }

  ctx.stroke();
}

// Handle mouse position updates (from input.js)
function handleMousePositionUpdate(event) {
  const { x, y } = event.detail;

  // Only add points if within keyboard boundary
  if (isWithinKeyboardBoundary(x, y)) {
    pathPoints.push({ x, y });
    drawPath();
  }
}

// Set up toggle button for test/Azure mode
function setupModeToggle() {
  const modeToggle = document.createElement("button");
  modeToggle.id = "modeToggle";
  modeToggle.textContent = "Using: Test Mode";
  modeToggle.style.margin = "10px";
  modeToggle.style.padding = "8px 12px";
  modeToggle.style.backgroundColor = "#4CAF50";
  modeToggle.style.color = "white";
  modeToggle.style.border = "none";
  modeToggle.style.borderRadius = "5px";
  modeToggle.style.cursor = "pointer";

  elements.captureToggle.insertAdjacentElement("afterend", modeToggle);

  // Toggle between test mode and Azure AI
  modeToggle.addEventListener("click", function () {
    state.useTestMode = !state.useTestMode;
    this.textContent = state.useTestMode
      ? "Using: Test Mode"
      : "Using: Azure AI";
    this.style.backgroundColor = state.useTestMode ? "#4CAF50" : "#2196F3";
  });
}

// Modify the setupCaptureToggle function

function setupCaptureToggle() {
  elements.captureToggle.addEventListener("click", async function () {
    state.isCapturing = !state.isCapturing;
    this.classList.toggle("active");

    if (state.isCapturing) {
      resetSequence();
      state.captureMethod = "Hover/Dwell";
      this.textContent = "Stop Capturing";
      clearPath();
      // Clear suggestions at start of new capture
      elements.wordSuggestionsContainer.innerHTML = "";
    } else {
      resetHighlighting();
      this.textContent = "Start Capturing";
      console.log("Final Swipe Sequence:", state.swipeSequence.join(""));

      // Get final word predictions when capturing stops
      if (state.swipeSequence.length > 0) {
        const sequence = state.swipeSequence.join("");
        const suggestedWords = await getPredictionsBasedOnMode(sequence);
        displaySuggestions(suggestedWords);

        // Keep the path visible slightly longer to give visual feedback
        setTimeout(() => clearPath(), 500);
      }
    }

    updateDebugInfo();
  });
}

// Set up the accessibility help section
function setupAccessibilityHelp() {
  elements.accessibilityControls.insertAdjacentHTML(
    "beforebegin",
    `
    <div id="accessibilityHelp">
      <h3>Accessibility Settings</h3>
      <p><strong>Dwell Time:</strong> How long (in milliseconds) you need to hover over a key before it's selected. 
         Increase this if you're making accidental selections, decrease if selection feels too slow.</p>
      <p><strong>Movement Tolerance:</strong> How much your cursor can move while still counting as "hovering" on the same spot. 
         Increase this if you experience tremors or have difficulty keeping the cursor still.</p>
    </div>
  `
  );
}

// Update UI with current values
function updateUIValues() {
  elements.dwellTimeValue.textContent = `${settings.dwellTime}ms`;
  elements.toleranceValue.textContent = settings.movementTolerance;
}

function setupContinuousMode() {
  const continuousModeToggle = document.createElement("button");
  continuousModeToggle.id = "continuousModeToggle";
  continuousModeToggle.textContent = "Continuous Mode: Off";
  continuousModeToggle.style.margin = "10px";
  continuousModeToggle.style.padding = "8px 12px";
  continuousModeToggle.style.backgroundColor = "#9e9e9e";
  continuousModeToggle.style.color = "white";
  continuousModeToggle.style.border = "none";
  continuousModeToggle.style.borderRadius = "5px";
  continuousModeToggle.style.cursor = "pointer";

  // Insert after the mode toggle
  if (document.getElementById("modeToggle")) {
    document
      .getElementById("modeToggle")
      .insertAdjacentElement("afterend", continuousModeToggle);
  } else {
    elements.captureToggle.insertAdjacentElement(
      "afterend",
      continuousModeToggle
    );
  }

  // Toggle continuous mode
  continuousModeToggle.addEventListener("click", function () {
    state.continuousMode = !state.continuousMode;
    this.textContent = state.continuousMode
      ? "Continuous Mode: On"
      : "Continuous Mode: Off";
    this.style.backgroundColor = state.continuousMode ? "#673ab7" : "#9e9e9e";
  });

  // Listen for special events for continuous mode
  window.addEventListener("resetPathForContinuous", () => {
    clearPath();
  });
}

export {
  initUI,
  clearPath,
  isWithinKeyboardBoundary,
  calculateKeyboardBoundaries,
};
