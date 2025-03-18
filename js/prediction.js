// Word prediction functionality

import { state, elements } from "./core.js";
import { findBestMatches } from "./dictionary.js";

// Get predictions using the local dictionary
async function getPredictions(sequence) {
  // Simulate network delay for realism
  return new Promise((resolve) => {
    setTimeout(() => {
      // Use the enhanced dictionary function
      const results = findBestMatches(sequence);
      resolve(results);
    }, 100); // Faster response time for better UX
  });
}

// Azure OpenAI integration (placeholder for future implementation)
async function getAzurePredictions(sequence) {
  try {
    // This would be replaced with actual Azure OpenAI API call
    console.log("Azure OpenAI would process:", sequence);
    // For now, just use the local dictionary
    return await getPredictions(sequence);
  } catch (error) {
    console.error("Azure AI error:", error);
    throw error;
  }
}

// Function to display word suggestions
function displaySuggestions(words) {
  const suggestionContainer = elements.wordSuggestionsContainer;
  suggestionContainer.innerHTML = "";

  if (words && words.length > 0) {
    words.forEach((word) => {
      if (word && word.trim()) {
        const suggestionBtn = document.createElement("button");
        suggestionBtn.className = "suggestion";
        suggestionBtn.textContent = word.trim();
        suggestionBtn.addEventListener("click", () => selectWord(word.trim()));
        suggestionContainer.appendChild(suggestionBtn);
      }
    });
  } else {
    suggestionContainer.innerHTML = "<span>No suggestions available</span>";
  }
}

// Function to select a word from suggestions
function selectWord(word) {
  const selectedWordsElement = elements.selectedWordsContainer;

  // Add space automatically if not the first word
  selectedWordsElement.textContent +=
    (selectedWordsElement.textContent ? " " : "") + word;

  // Check if we're in continuous mode
  if (state.continuousMode) {
    // Just clear sequence but keep capturing
    state.swipeSequence = [];
    elements.sequenceDisplay.innerText = "";
    elements.wordSuggestionsContainer.innerHTML = "";
    window.dispatchEvent(new CustomEvent("resetPathForContinuous"));
  } else {
    // Traditional behavior - clear everything
    state.swipeSequence = [];
    elements.sequenceDisplay.innerText = "";
    elements.wordSuggestionsContainer.innerHTML = "";
    window.dispatchEvent(new CustomEvent("wordSelected"));
  }
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
  getRealtimePredictions,
};
