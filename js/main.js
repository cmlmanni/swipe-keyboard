// Main entry point that initializes everything

import { updateDebugInfo } from "./core.js";
import { initInputHandlers } from "./input.js";
import { initUI } from "./ui.js";

// Initialize the application
function initApp() {
  // Initialize UI components
  initUI();

  // Initialize input handlers
  initInputHandlers();

  // Initialize debug info
  updateDebugInfo();

  console.log("Swipe Keyboard initialized");
}

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);

// Export for direct script use
export { initApp };
