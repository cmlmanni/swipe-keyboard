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
  deleteAllText,
} from "./prediction.js";
import { toggleDemoMode } from "./demoMode.js";

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

  // Add prediction order preference
  setupPredictionOrderPreference();

  // Setup drag scrolling for suggestion areas
  setupDragScrolling();

  // Listen for path clearing
  window.addEventListener("clearSwipePath", () => {
    clearPath();
  });

  // Listen for path fade-out
  window.addEventListener("fadeSwipePath", () => {
    // Add fade-out class to canvas
    canvas.classList.add("path-fade-out");

    // Clear path after animation
    setTimeout(() => {
      clearPath();
      canvas.classList.remove("path-fade-out");
    }, 800);
  });

  // Setup delete all button
  setupDeleteAllButton();

  // Add demo mode toggle
  setupDemoModeToggle();
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
  canvas = initPathCanvas();
  ctx = canvas.getContext("2d");
}

// Clear path visualization
function clearPath() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pathPoints.length = 0;
  }
}

// Update the drawPath function
function drawPath() {
  if (!ctx || pathPoints.length < 2) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the main path
  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#ff5722"; // Bright orange
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (let i = 1; i < pathPoints.length; i++) {
    ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
  }
  ctx.stroke();

  // Add glow effect
  ctx.shadowColor = "#ff5722";
  ctx.shadowBlur = 8;
  ctx.stroke();

  // Draw circles at key points
  drawPathDots();
}

// Add a function to draw dots at key points
function drawPathDots() {
  // Only draw dots at every 5th point to avoid overcrowding
  for (let i = 0; i < pathPoints.length; i += 5) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 87, 34, 0.6)";
    ctx.arc(pathPoints[i].x, pathPoints[i].y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Update handleMousePositionUpdate function
function handleMousePositionUpdate(event) {
  const { x, y } = event.detail;

  // Get direct keyboard boundaries
  const keyboardRect = elements.keyboard.getBoundingClientRect();

  // Only add points if directly within keyboard area, not just the padding
  const isDirectlyOverKeyboard =
    x >= keyboardRect.left &&
    x <= keyboardRect.right &&
    y >= keyboardRect.top &&
    y <= keyboardRect.bottom;

  if (isDirectlyOverKeyboard) {
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

// Add this after the setupAccessibilityHelp function
function setupPredictionOrderPreference() {
  const predictionOrderToggle = document.createElement("button");
  predictionOrderToggle.id = "predictionOrderToggle";
  predictionOrderToggle.textContent = "Swap Prediction Order";
  predictionOrderToggle.style.margin = "10px";
  predictionOrderToggle.style.padding = "8px 12px";
  predictionOrderToggle.style.backgroundColor = "#6c757d";
  predictionOrderToggle.style.color = "white";
  predictionOrderToggle.style.border = "none";
  predictionOrderToggle.style.borderRadius = "5px";
  predictionOrderToggle.style.cursor = "pointer";

  // Insert after the mode toggle
  if (document.getElementById("continuousModeToggle")) {
    document
      .getElementById("continuousModeToggle")
      .insertAdjacentElement("afterend", predictionOrderToggle);
  } else {
    elements.captureToggle.insertAdjacentElement(
      "afterend",
      predictionOrderToggle
    );
  }

  // Toggle prediction order
  predictionOrderToggle.addEventListener("click", function () {
    const wordSuggestions = document.getElementById("wordSuggestions");
    const sentenceSuggestions = document.getElementById("sentenceSuggestions");
    const outputArea = document.getElementById("outputArea");

    // Get the element that comes after outputArea
    const nextAfterOutput = outputArea.nextElementSibling;

    if (nextAfterOutput === sentenceSuggestions) {
      // If sentence is first, swap to word first
      outputArea.insertAdjacentElement("afterend", wordSuggestions);
    } else {
      // If word is first, swap to sentence first
      outputArea.insertAdjacentElement("afterend", sentenceSuggestions);
    }
  });
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

// Update the function that initializes the path canvas
function initPathCanvas() {
  const canvas = document.createElement("canvas");
  canvas.id = "pathCanvas";

  // Remove any existing canvas to prevent duplication
  const existingCanvas = document.getElementById("pathCanvas");
  if (existingCanvas) {
    existingCanvas.parentNode.removeChild(existingCanvas);
  }

  // Append to body for full screen coverage
  document.body.appendChild(canvas);

  // Set canvas to full viewport size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";

  // Update on window resize
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  return canvas;
}

// Add this function to the initUI function
function setupDragScrolling() {
  // Apply drag scrolling to both suggestion containers
  enableDragScroll(
    document.querySelector("#wordSuggestions .suggestions-scroll-container")
  );
  enableDragScroll(
    document.querySelector("#sentenceSuggestions .suggestions-container")
  );
}

// Function to enable drag-to-scroll on containers
function enableDragScroll(element) {
  if (!element) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  // Enable cursor feedback
  element.style.cursor = "grab";

  element.addEventListener("mousedown", (e) => {
    isDown = true;
    element.style.cursor = "grabbing";
    startX = e.pageX - element.offsetLeft;
    scrollLeft = element.scrollLeft;
    e.preventDefault(); // Prevent text selection during drag
  });

  element.addEventListener("mouseleave", () => {
    isDown = false;
    element.style.cursor = "grab";
  });

  element.addEventListener("mouseup", () => {
    isDown = false;
    element.style.cursor = "grab";
  });

  element.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - element.offsetLeft;
    // Use a multiplier for sensitivity (adjust for MND users)
    const walk = (x - startX) * 1.5;
    element.scrollLeft = scrollLeft - walk;
  });
}

// Add this function to your ui.js file
function setupDeleteAllButton() {
  const deleteAllBtn = document.getElementById("deleteAllBtn");
  if (!deleteAllBtn) return;

  deleteAllBtn.addEventListener("click", function () {
    deleteAllText();
  });
}

// Add this function to the ui.js file
function setupDemoModeToggle() {
  const demoModeToggle = document.createElement("button");
  demoModeToggle.id = "demoModeToggle";
  demoModeToggle.textContent = "Start Demo Mode";
  demoModeToggle.style.backgroundColor = "#ff9800";
  demoModeToggle.style.color = "white";
  demoModeToggle.style.border = "none";
  demoModeToggle.style.borderRadius = "5px";
  demoModeToggle.style.cursor = "pointer";
  demoModeToggle.style.padding = "8px 12px";
  demoModeToggle.style.margin = "10px";

  // Add the button to control buttons
  const controlButtons = document.getElementById("controlButtons");
  controlButtons.appendChild(demoModeToggle);

  // Toggle demo mode on click
  demoModeToggle.addEventListener("click", function () {
    toggleDemoMode();
    this.textContent =
      this.textContent === "Start Demo Mode"
        ? "Stop Demo Mode"
        : "Start Demo Mode";
    this.style.backgroundColor =
      this.textContent === "Stop Demo Mode" ? "#e65100" : "#ff9800";
  });
}

// Find the handler for the "Say This!" button and add:

function handleEnterAction() {
  const text = elements.selectedWordsContainer.textContent.trim();
  if (text) {
    // Existing code for speech synthesis...

    // Add to history
    document.dispatchEvent(
      new CustomEvent("sentenceSelected", {
        detail: { sentence: text },
      })
    );
  }
}

export {
  initUI,
  clearPath,
  isWithinKeyboardBoundary,
  calculateKeyboardBoundaries,
};
