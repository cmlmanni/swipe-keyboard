// Array to store the swipe sequence
let swipeSequence = [];
// Flag to track if capture is active
let isCapturing = false;
// Track the capture method
let captureMethod = "None";

const keyboard = document.getElementById("keyboard");
const sequenceDisplay = document.getElementById("sequence");
const statusDisplay = document.getElementById("status");
const captureMethodDisplay = document.getElementById("captureMethod");
const lastKeyDisplay = document.getElementById("lastKey");
const completeSequenceDisplay = document.getElementById("completeSequence");
const captureToggle = document.getElementById("captureToggle");

// Function to update the debug info
function updateDebugInfo(letter) {
  statusDisplay.textContent = isCapturing ? "Capturing" : "Idle";
  captureMethodDisplay.textContent = captureMethod;
  if (letter) {
    lastKeyDisplay.textContent = letter;
  }
  completeSequenceDisplay.textContent = swipeSequence.join("");
}

// Function to highlight the current key
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

// Function to reset key highlighting
function resetHighlighting() {
  document.querySelectorAll(".key.active").forEach((key) => {
    key.classList.remove("active");
  });
}

// Toggle capture mode
captureToggle.addEventListener("click", function () {
  isCapturing = !isCapturing;
  this.classList.toggle("active");

  if (isCapturing) {
    swipeSequence = [];
    sequenceDisplay.innerText = "";
    captureMethod = "Hover";
    this.textContent = "Stop Capturing";
  } else {
    resetHighlighting();
    this.textContent = "Start Capturing";
    console.log("Final Swipe Sequence:", swipeSequence.join(""));
  }

  updateDebugInfo();
});

// Touch Events
keyboard.addEventListener("touchstart", function (event) {
  if (!isCapturing) return;
  swipeSequence = [];
  captureMethod = "Touch";
  updateDebugInfo();
  event.preventDefault();
});

keyboard.addEventListener("touchmove", function (event) {
  if (!isCapturing) return;
  const touch = event.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target && target.classList.contains("key")) {
    const letter = target.getAttribute("data-letter");
    highlightKey(target);
    if (swipeSequence[swipeSequence.length - 1] !== letter) {
      swipeSequence.push(letter);
      sequenceDisplay.innerText = swipeSequence.join("");
      updateDebugInfo(letter);
    }
  }
  event.preventDefault();
});

keyboard.addEventListener("touchend", function (event) {
  if (!isCapturing) return;
  resetHighlighting();
  console.log("Final Swipe Sequence:", swipeSequence.join(""));
  updateDebugInfo();
  event.preventDefault();
});

// Mouse Hover Events
document.querySelectorAll(".key").forEach((key) => {
  key.addEventListener("mouseenter", function () {
    if (!isCapturing) return;

    const letter = this.getAttribute("data-letter");
    highlightKey(this);

    if (swipeSequence[swipeSequence.length - 1] !== letter) {
      swipeSequence.push(letter);
      sequenceDisplay.innerText = swipeSequence.join("");
      updateDebugInfo(letter);
    }
  });
});

// Initialize debug display
updateDebugInfo();
