// Word prediction functionality

import { state, elements, resetSequence } from "./core.js";
import { findBestMatches } from "./dictionary.js";

// Keeps track of recent words for context
const contextHistory = {
  recentWords: [],
  maxHistoryLength: 10,

  addWord(word) {
    this.recentWords.push(word);
    if (this.recentWords.length > this.maxHistoryLength) {
      this.recentWords.shift();
    }
    return this.recentWords;
  },

  getContext() {
    return this.recentWords.join(" ");
  },

  clear() {
    this.recentWords = [];
  },
};

// Auto-selection timer
let autoSelectionTimer;
const AUTO_SELECT_DELAY = 800; // Time in ms before auto-selecting the first suggestion

// Get predictions using the local dictionary
async function getPredictions(sequence) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get more suggestions for the scrollable list (up to 10)
      const results = findBestMatches(sequence, 10);
      resolve(results);
    }, 100);
  });
}

// Azure OpenAI integration (placeholder for future implementation)
async function getAzurePredictions(sequence) {
  try {
    console.log("Azure OpenAI would process:", sequence);
    return await getPredictions(sequence);
  } catch (error) {
    console.error("Azure AI error:", error);
    throw error;
  }
}

// Function to display word suggestions in a scrollable container
function displaySuggestions(words) {
  const suggestionContainer = elements.wordSuggestionsContainer;
  suggestionContainer.innerHTML = "";

  // Cancel any pending auto-selection
  clearTimeout(autoSelectionTimer);

  if (words && words.length > 0) {
    // Create a scrollable container
    const scrollContainer = document.createElement("div");
    scrollContainer.className = "suggestions-scroll-container";

    words.forEach((word, index) => {
      if (word && word.trim()) {
        const suggestionBtn = document.createElement("button");
        suggestionBtn.className = "suggestion";
        if (index === 0) suggestionBtn.classList.add("suggestion-primary");
        suggestionBtn.textContent = word.trim();
        suggestionBtn.addEventListener("click", () => selectWord(word.trim()));
        scrollContainer.appendChild(suggestionBtn);
      }
    });

    suggestionContainer.appendChild(scrollContainer);

    // Start auto-selection timer for the first suggestion
    if (words.length > 0 && state.isCapturing) {
      autoSelectionTimer = setTimeout(() => {
        selectWord(words[0]);
      }, AUTO_SELECT_DELAY);
    }

    // Add scroll buttons for better navigation
    addScrollButtons(suggestionContainer, scrollContainer);
  } else {
    suggestionContainer.innerHTML =
      '<span class="no-suggestions">No suggestions available</span>';
  }
}

// Add scroll buttons for horizontal navigation
function addScrollButtons(parentContainer, scrollContainer) {
  // Add scroll indicators/buttons
  const leftScrollBtn = document.createElement("button");
  leftScrollBtn.className = "scroll-btn scroll-left";
  leftScrollBtn.innerHTML = "&lt;";
  leftScrollBtn.addEventListener("click", () => {
    scrollContainer.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  });

  const rightScrollBtn = document.createElement("button");
  rightScrollBtn.className = "scroll-btn scroll-right";
  rightScrollBtn.innerHTML = "&gt;";
  rightScrollBtn.addEventListener("click", () => {
    scrollContainer.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  });

  parentContainer.appendChild(leftScrollBtn);
  parentContainer.appendChild(rightScrollBtn);

  // Update scroll button visibility based on scroll position
  scrollContainer.addEventListener("scroll", () => {
    updateScrollButtonVisibility(
      scrollContainer,
      leftScrollBtn,
      rightScrollBtn
    );
  });

  // Initial visibility check
  setTimeout(() => {
    updateScrollButtonVisibility(
      scrollContainer,
      leftScrollBtn,
      rightScrollBtn
    );
  }, 100);
}

// Update visibility of scroll buttons based on scroll position
function updateScrollButtonVisibility(container, leftBtn, rightBtn) {
  const isAtStart = container.scrollLeft <= 10;
  const isAtEnd =
    container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;

  leftBtn.style.opacity = isAtStart ? "0.3" : "1";
  leftBtn.style.cursor = isAtStart ? "default" : "pointer";

  rightBtn.style.opacity = isAtEnd ? "0.3" : "1";
  rightBtn.style.cursor = isAtEnd ? "default" : "pointer";
}

// Function to select a word from suggestions
function selectWord(word) {
  // Clear any pending auto-selection
  clearTimeout(autoSelectionTimer);

  const selectedWordsElement = elements.selectedWordsContainer;

  // Add space automatically if not the first word
  selectedWordsElement.textContent +=
    (selectedWordsElement.textContent ? " " : "") + word;

  // Set the currently selected word in state (for potential replacement)
  state.lastSelectedWord = word;
  state.lastSelectionIndex = selectedWordsElement.textContent.lastIndexOf(word);

  // Add selected word to context history
  contextHistory.addWord(word);

  // Check if we're in continuous mode
  if (state.continuousMode) {
    // Just clear sequence but keep capturing
    resetSequence();
    window.dispatchEvent(new CustomEvent("resetPathForContinuous"));
  } else {
    // Traditional behavior - stop capturing
    resetSequence();
    state.isCapturing = false;
    elements.captureToggle.textContent = "Start Capturing";
    elements.captureToggle.classList.remove("active");
    window.dispatchEvent(new CustomEvent("wordSelected"));
  }

  // Keep the suggestions visible for possible replacement
  // but highlight the selected one
  const suggestions = document.querySelectorAll(".suggestion");
  suggestions.forEach((suggestion) => {
    if (suggestion.textContent === word) {
      suggestion.classList.add("suggestion-selected");
    } else {
      suggestion.classList.remove("suggestion-selected");
    }
  });
}

// New function to replace the last selected word
function replaceLastWord(newWord) {
  if (!state.lastSelectedWord || state.lastSelectionIndex === undefined) return;

  const selectedWordsElement = elements.selectedWordsContainer;
  const currentContent = selectedWordsElement.textContent;

  // Replace the last selected word with the new one
  const beforeWord = currentContent.substring(0, state.lastSelectionIndex);
  const afterWord = currentContent.substring(
    state.lastSelectionIndex + state.lastSelectedWord.length
  );
  selectedWordsElement.textContent = beforeWord + newWord + afterWord;

  // Update the stored last word
  state.lastSelectedWord = newWord;

  // Update selection highlighting
  const suggestions = document.querySelectorAll(".suggestion");
  suggestions.forEach((suggestion) => {
    if (suggestion.textContent === newWord) {
      suggestion.classList.add("suggestion-selected");
    } else {
      suggestion.classList.remove("suggestion-selected");
    }
  });
}

// Add this function to handle backspace action
function deleteLastWord() {
  const selectedWordsElement = elements.selectedWordsContainer;
  const content = selectedWordsElement.textContent;

  if (!content) return; // Nothing to delete

  // Find the last space or start of text
  const lastSpaceIndex = content.lastIndexOf(" ");

  if (lastSpaceIndex === -1) {
    // No spaces, clear everything
    selectedWordsElement.textContent = "";
  } else {
    // Remove the last word
    selectedWordsElement.textContent = content.substring(0, lastSpaceIndex);
  }

  // Update context history
  if (contextHistory.recentWords.length > 0) {
    contextHistory.recentWords.pop();
  }

  // Reset last selected word tracking
  state.lastSelectedWord = null;
  state.lastSelectionIndex = null;
}

// Get predictions based on current mode
async function getPredictionsBasedOnMode(sequence) {
  if (!sequence) return [];

  try {
    if (state.useTestMode) {
      return await getPredictions(sequence);
    } else {
      return await getAzurePredictions(sequence);
    }
  } catch (error) {
    console.error("Prediction error:", error);
    return await getPredictions(sequence); // Fallback to test mode
  }
}

// New function for real-time predictions during swiping
async function getRealtimePredictions() {
  if (state.swipeSequence.length === 0) return;

  const sequence = state.swipeSequence.join("");
  const suggestedWords = await getPredictionsBasedOnMode(sequence);
  displaySuggestions(suggestedWords);
}

export {
  getPredictionsBasedOnMode,
  displaySuggestions,
  selectWord,
  replaceLastWord,
  getRealtimePredictions,
  deleteLastWord, // Add this export
};
