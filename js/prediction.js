// Word prediction functionality

import { state, elements } from "./core.js";

// Common English words for testing
const commonWords = {
  QWE: ["queen", "question", "quest"],
  ASD: ["ask", "aside", "assembly"],
  WER: ["were", "west", "western"],
  ERT: ["earth", "certain", "erupt"],
  TY: ["try", "type", "typical"],
  ASDF: ["asked", "assist", "assemble"],
  QWERTY: ["qwerty"],
  THE: ["the", "them", "they"],
  AND: ["and", "android", "andrew"],
  ING: ["ing", "ingot", "ingress"],
  YOU: ["you", "young", "your"],
  HELLO: ["hello", "hellos"],
  WORLD: ["world", "worlds"],
  HJ: ["hi", "him", "his"],
  JK: ["joke", "jack", "just"],
  FG: ["fog", "fig", "for"],
  CV: ["cave", "cover", "civic"],
  BN: ["been", "bin", "ban"],
  TGB: ["tag", "toggle", "tight"],
  YHN: ["yarn", "yawn", "young"],
  TGHE: ["the", "they", "them"],
  YUOU: ["you", "your", "yours"],
};

// Fuzzy matching function to find the closest patterns
function findPredictions(sequence) {
  // Direct match
  if (commonWords[sequence]) {
    return commonWords[sequence];
  }

  // Find closest match by calculating similarity
  let bestMatch = [];
  let highestSimilarity = 0;

  for (const pattern in commonWords) {
    // Calculate a simple similarity score
    const similarity = calculateSimilarity(sequence, pattern);

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = commonWords[pattern];
    }
  }

  // If we found a good match, return it
  if (highestSimilarity > 0.5) {
    return bestMatch;
  }

  // Default predictions if no match found
  return ["word", "text", "next"];
}

// Simple similarity calculation between two strings
function calculateSimilarity(str1, str2) {
  // Normalize strings for comparison
  const s1 = str1.toUpperCase();
  const s2 = str2.toUpperCase();

  // Count matching characters
  let matches = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s2.includes(s1[i])) {
      matches++;
    }
  }

  // Length similarity factor
  const lengthDiff = Math.abs(s1.length - s2.length);
  const lengthFactor = 1 - lengthDiff / Math.max(s1.length, s2.length);

  // Calculate final similarity score (0-1)
  return (matches / Math.max(s1.length, s2.length)) * lengthFactor;
}

// Get predictions using the test dictionary
async function getPredictions(sequence) {
  // Simulate network delay for realism
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(findPredictions(sequence));
    }, 300);
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
  selectedWordsElement.textContent +=
    (selectedWordsElement.textContent ? " " : "") + word;

  // Clear the current sequence and suggestions
  state.swipeSequence = [];
  elements.sequenceDisplay.innerText = "";
  elements.wordSuggestionsContainer.innerHTML = "";
}

// Get predictions based on current mode
async function getPredictionsBasedOnMode(sequence) {
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

export { getPredictionsBasedOnMode, displaySuggestions, selectWord };
