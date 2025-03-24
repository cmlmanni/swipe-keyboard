// Main entry point that initializes everything

import { state, updateDebugInfo } from "./core.js";
import { initInputHandlers } from "./input.js";
import { initUI } from "./ui.js";
import { startDemoMode, stopDemoMode } from "./demoMode.js"; // Add this import
import { initHistoryPanel, setupHistoryListeners } from "./history.js";

// Initialize the application
function initApp() {
  // Initialize UI components
  initUI();

  // Initialize input handlers
  initInputHandlers();

  // Initialize debug info
  updateDebugInfo();

  // Initialize the history panel
  initHistoryPanel();
  setupHistoryListeners();

  // NEW: Always start in capture mode with continuous mode on
  const captureToggle = document.getElementById("captureToggle");
  const continuousModeToggle = document.getElementById("continuousModeToggle");

  // Set capture mode on
  if (captureToggle && !state.isCapturing) {
    state.isCapturing = true;
    captureToggle.classList.add("active");
    captureToggle.textContent = "Stop Capturing";
  }

  // Set continuous mode on
  if (continuousModeToggle) {
    state.continuousMode = true;
    continuousModeToggle.textContent = "Continuous Mode: On";
    continuousModeToggle.style.backgroundColor = "#673ab7";
  }

  console.log("Swipe Keyboard initialized in capture mode");
}

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);

// Export for direct script use
export { initApp };

// Add this to your initialization function
function init() {
  // Other initializations...

  // Initialize history panel
  initHistoryPanel();
  setupHistoryListeners();
}
