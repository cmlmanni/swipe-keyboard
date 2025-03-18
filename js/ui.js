// UI elements and visualizations

import {
  state,
  elements,
  settings,
  resetHighlighting,
  resetSequence,
  updateDebugInfo,
} from "./core.js";
import { getPredictionsBasedOnMode, displaySuggestions } from "./prediction.js";

// Canvas for path visualization
let canvas;
let ctx;
const pathPoints = [];

// Initialize UI elements
function initUI() {
  // Set up canvas for path visualization
  setupCanvas();

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
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (pathPoints.length < 2) return;

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
  pathPoints.push({ x, y });
  drawPath();
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
  modeToggle.style.borderRadius = "4px";
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

// Set up capture toggle button
function setupCaptureToggle() {
  elements.captureToggle.addEventListener("click", async function () {
    state.isCapturing = !state.isCapturing;
    this.classList.toggle("active");

    if (state.isCapturing) {
      resetSequence();
      state.captureMethod = "Hover/Dwell";
      this.textContent = "Stop Capturing";
      clearPath();
    } else {
      resetHighlighting();
      this.textContent = "Start Capturing";
      console.log("Final Swipe Sequence:", state.swipeSequence.join(""));

      // Get word predictions when capturing stops
      if (state.swipeSequence.length > 0) {
        const sequence = state.swipeSequence.join("");
        const suggestedWords = await getPredictionsBasedOnMode(sequence);
        displaySuggestions(suggestedWords);
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
    <div id="accessibilityHelp" style="margin: 15px 0; padding: 10px; background: #f0f7ff; border-radius: 5px; max-width: 600px;">
      <h3 style="margin-top: 0;">Accessibility Settings</h3>
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

export { initUI, clearPath };
