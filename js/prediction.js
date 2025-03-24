// Word prediction functionality

import { state, elements, resetSequence } from "./core.js";
import { findBestMatches } from "./dictionary.js";
import { clearDwellTimers } from "./input.js";

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

// Azure OpenAI integration
async function getAzurePredictions(sequence, type = "word") {
  try {
    const client = new OpenAIClient(/* config */);

    // Different prompts for words vs sentences
    let prompt;
    if (type === "word") {
      prompt = `Predict likely words for the swipe pattern: ${sequence}`;
    } else {
      const context = contextHistory.getContext();
      prompt = `Complete this text in a natural way: ${context}`;
    }

    const response = await client.getCompletions({
      prompt: prompt,
      maxTokens: type === "word" ? 20 : 50,
      temperature: type === "word" ? 0.3 : 0.7,
    });

    // Process response differently based on type
    if (type === "word") {
      return response.choices.map((c) => c.text.trim()).slice(0, 5);
    } else {
      return response.choices
        .map((c) => `${context} ${c.text.trim()}`)
        .slice(0, 3);
    }
  } catch (error) {
    console.error("Azure prediction error:", error);
    // Fallback to dictionary or placeholder predictions
    return type === "word"
      ? getPredictions(sequence)
      : getPlaceholderSentencePredictions();
  }
}

// Function to display word suggestions in a scrollable container
function displaySuggestions(words) {
  // This is the issue - we're targeting the wrong container
  // Instead of the main container, we need to target the inner scroll container
  const suggestionContainer = document.querySelector(
    "#wordSuggestions .suggestions-scroll-container"
  );

  if (!suggestionContainer) {
    console.error("Word suggestions container not found");
    return;
  }

  suggestionContainer.innerHTML = "";

  // Cancel any pending auto-selection
  clearTimeout(autoSelectionTimer);

  if (words && words.length > 0) {
    words.forEach((word, index) => {
      if (word && word.trim()) {
        const suggestionBtn = document.createElement("button");
        suggestionBtn.className = "suggestion";
        if (index === 0) suggestionBtn.classList.add("suggestion-primary");
        suggestionBtn.textContent = word.trim();
        suggestionBtn.addEventListener("click", () => selectWord(word.trim()));
        suggestionContainer.appendChild(suggestionBtn);
      }
    });

    // Start auto-selection timer for the first suggestion
    if (words.length > 0 && state.isCapturing) {
      autoSelectionTimer = setTimeout(() => {
        selectWord(words[0]);
      }, AUTO_SELECT_DELAY);
    }
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

  // NEW: Force clear any pending dwell timers
  clearDwellTimers();

  const selectedWordsElement = elements.selectedWordsContainer;

  // Add space automatically if not the first word
  selectedWordsElement.textContent +=
    (selectedWordsElement.textContent ? " " : "") + word;

  // Set the currently selected word in state (for potential replacement)
  state.lastSelectedWord = word;
  state.lastSelectionIndex = selectedWordsElement.textContent.lastIndexOf(word);

  // Add selected word to context history
  contextHistory.addWord(word);

  // Trigger history update when a complete sentence is formed
  // This event will be captured by the history module
  if (word.endsWith(".") || word.endsWith("!") || word.endsWith("?")) {
    document.dispatchEvent(
      new CustomEvent("sentenceSelected", {
        detail: { sentence: selectedWordsElement.textContent },
      })
    );
  }

  // If the selected words container has content and ends with punctuation, consider it a complete sentence
  const selectedText = elements.selectedWordsContainer.textContent;
  if (
    selectedText &&
    (selectedText.endsWith(".") ||
      selectedText.endsWith("!") ||
      selectedText.endsWith("?"))
  ) {
    document.dispatchEvent(
      new CustomEvent("sentenceSelected", {
        detail: { sentence: selectedText },
      })
    );
  }

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

// Add this function for clearing all text
function deleteAllText() {
  const selectedWordsElement = elements.selectedWordsContainer;

  // Clear the displayed text
  selectedWordsElement.textContent = "";

  // Clear context history
  contextHistory.clear();

  // Reset the last selected word tracking
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

// Function to display sentence suggestions
function displaySentenceSuggestions(suggestions) {
  const container = document.querySelector(
    "#sentenceSuggestions .suggestions-container"
  );
  if (!container) return;

  container.innerHTML = "";

  suggestions.forEach((suggestion) => {
    const element = document.createElement("div");
    element.classList.add("sentence-suggestion");
    element.textContent = suggestion;
    element.addEventListener("click", () => selectSentence(suggestion));
    container.appendChild(element);
  });

  // No longer need to add scroll buttons
}

// Function to generate placeholder sentence predictions for offline testing
async function getPlaceholderSentencePredictions() {
  const context = contextHistory.getContext();

  // Placeholder sentences based on context
  const placeholderSentences = [
    `${context} is really interesting`,
    `I think ${context} might work well`,
    `Can you explain more about ${context}?`,
    `Let's discuss ${context} further`,
    `${context} reminds me of something`,
  ];

  // Filter empty predictions or duplicates
  return placeholderSentences
    .filter((s) => s && s.trim() !== "")
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 3); // Limit to 3 suggestions
}

// Function to select an entire sentence
function selectSentence(sentence) {
  const selectedWordsElement = elements.selectedWordsContainer;

  // Replace all current text with the selected sentence
  selectedWordsElement.textContent = sentence;

  // Update context with all words from the sentence
  const words = sentence.split(" ").filter((w) => w.trim() !== "");
  contextHistory.clear();
  words.forEach((word) => contextHistory.addWord(word));

  // Update UI state
  state.lastSelectedWord = words[words.length - 1];
  state.lastSelectionIndex = selectedWordsElement.textContent.lastIndexOf(
    state.lastSelectedWord
  );

  // Highlight the selected sentence
  const sentences = document.querySelectorAll(".sentence-suggestion");
  sentences.forEach((s) => {
    if (s.textContent === sentence) {
      s.classList.add("sentence-suggestion-selected");
    } else {
      s.classList.remove("sentence-suggestion-selected");
    }
  });

  // Reset capturing state
  resetSequence();
  state.isCapturing = false;
  elements.captureToggle.textContent = "Start Capturing";
  elements.captureToggle.classList.remove("active");
  window.dispatchEvent(new CustomEvent("sentenceSelected"));
}

// New function for real-time predictions during swiping
async function getRealtimePredictions() {
  if (state.swipeSequence.length === 0) return;

  const sequence = state.swipeSequence.join("");

  // Get word predictions
  const suggestedWords = await getPredictionsBasedOnMode(sequence);
  displaySuggestions(suggestedWords);

  // Get sentence predictions - only if we have context
  if (contextHistory.recentWords.length > 0) {
    const sentenceSuggestions = await getPlaceholderSentencePredictions();
    displaySentenceSuggestions(sentenceSuggestions);
  }
}

// Update exports to include new functions
export {
  getPredictionsBasedOnMode,
  displaySuggestions,
  displaySentenceSuggestions,
  selectWord,
  selectSentence,
  replaceLastWord,
  getRealtimePredictions,
  deleteLastWord,
  deleteAllText, // Add this
  contextHistory,
};
