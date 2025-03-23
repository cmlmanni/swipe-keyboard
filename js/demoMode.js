import { state, elements, addKeyToSequence, resetSequence } from "./core.js";
import { clearPath } from "./ui.js";

// Demo state
let demoActive = false;
let demoInterval;
let currentDemoScenario = 0;
let demoPhrase = "";

// AI engineering related terms and scenarios for Phil's demo
const demoScenarios = [
  {
    swipe: "NRLNTWRK",
    predictedWords: [
      "neural",
      "network",
      "naturally",
      "neural network",
      "normally",
    ],
    selectedWord: "neural",
    followUp: {
      swipe: "NTWRK",
      predictedWords: ["network", "networks", "networking", "networked", "net"],
      selectedWord: "network",
    },
    sentencePredictions: [
      "neural network architecture",
      "neural network optimization techniques",
      "neural network training method",
    ],
  },
  {
    swipe: "MACHNLRN",
    predictedWords: [
      "machine",
      "learning",
      "machining",
      "machine learning",
      "machinery",
    ],
    selectedWord: "machine",
    followUp: {
      swipe: "LRNG",
      predictedWords: ["learning", "learner", "learn", "learned", "learnings"],
      selectedWord: "learning",
    },
    sentencePredictions: [
      "machine learning algorithms",
      "machine learning model performance",
      "machine learning implementation",
    ],
  },
  {
    swipe: "DTSCNC",
    predictedWords: [
      "data",
      "science",
      "dataset",
      "data science",
      "disciplines",
    ],
    selectedWord: "data",
    followUp: {
      swipe: "SCNC",
      predictedWords: [
        "science",
        "scientist",
        "scientific",
        "sciences",
        "sciency",
      ],
      selectedWord: "science",
    },
    sentencePredictions: [
      "data science methodology",
      "data science project proposal",
      "data science team collaboration",
    ],
  },
  {
    swipe: "ARTFCLNTLGNC",
    predictedWords: [
      "artificial",
      "intelligence",
      "artifact",
      "artificial intelligence",
      "articulate",
    ],
    selectedWord: "artificial",
    followUp: {
      swipe: "NTLGNC",
      predictedWords: [
        "intelligence",
        "intelligent",
        "intelligently",
        "intellect",
        "intellectual",
      ],
      selectedWord: "intelligence",
    },
    sentencePredictions: [
      "artificial intelligence research",
      "artificial intelligence ethics considerations",
      "artificial intelligence implementation challenges",
    ],
  },
  {
    swipe: "CPVSVN",
    predictedWords: [
      "computer",
      "vision",
      "compute",
      "computer vision",
      "capability",
    ],
    selectedWord: "computer",
    followUp: {
      swipe: "VSN",
      predictedWords: [
        "vision",
        "visual",
        "visionary",
        "visualize",
        "visibility",
      ],
      selectedWord: "vision",
    },
    sentencePredictions: [
      "computer vision algorithm",
      "computer vision image recognition",
      "computer vision processing framework",
    ],
  },
  {
    swipe: "NTRLNGGPRCSNG",
    predictedWords: [
      "natural",
      "language",
      "naturally",
      "natural language",
      "naturalize",
    ],
    selectedWord: "natural",
    followUp: {
      swipe: "LNGGPRCSNG",
      predictedWords: [
        "language",
        "processing",
        "language processing",
        "languages",
        "linguistic",
      ],
      selectedWord: "language processing",
    },
    sentencePredictions: [
      "natural language processing systems",
      "natural language processing techniques",
      "natural language processing with transformers",
    ],
  },
];

// Display custom word predictions for demo mode
function displayDemoPredictions(predictions) {
  const suggestionContainer = document.querySelector(
    "#wordSuggestions .suggestions-scroll-container"
  );
  if (!suggestionContainer) return;

  suggestionContainer.innerHTML = "";

  predictions.forEach((word, index) => {
    const suggestionBtn = document.createElement("button");
    suggestionBtn.className = "suggestion";
    if (index === 0) suggestionBtn.classList.add("suggestion-primary");
    suggestionBtn.textContent = word;
    suggestionContainer.appendChild(suggestionBtn);
  });
}

// Display custom sentence predictions for demo mode
function displayDemoSentencePredictions(predictions) {
  const container = document.querySelector(
    "#sentenceSuggestions .suggestions-container"
  );
  if (!container) return;

  container.innerHTML = "";

  predictions.forEach((sentence) => {
    const element = document.createElement("div");
    element.classList.add("sentence-suggestion");
    element.textContent = sentence;
    container.appendChild(element);
  });
}

// Function to simulate selecting a word
function simulateWordSelection(word) {
  // Add to output area
  const selectedWordsElement = elements.selectedWordsContainer;
  selectedWordsElement.textContent +=
    (selectedWordsElement.textContent ? " " : "") + word;

  // Highlight the selected word in suggestions
  const suggestions = document.querySelectorAll(".suggestion");
  suggestions.forEach((suggestion) => {
    if (suggestion.textContent === word) {
      suggestion.classList.add("suggestion-selected");
    } else {
      suggestion.classList.remove("suggestion-selected");
    }
  });

  // Add to demo phrase
  demoPhrase += (demoPhrase ? " " : "") + word;
}

// Function to simulate a swipe pattern with nice visual path
function simulateSwipe(
  swipePattern,
  predictedWords,
  selectedWord,
  sentencePredictions
) {
  resetSequence();
  clearPath();

  // First display the predictions (as if they appeared in real-time)
  displayDemoPredictions(predictedWords);
  displayDemoSentencePredictions(sentencePredictions);

  // Add letters to sequence one by one with delay
  const letters = swipePattern.split("");
  let index = 0;

  // Create path points for more realistic visualization
  const keyboardEl = elements.keyboard;
  const keyboardRect = keyboardEl.getBoundingClientRect();
  const pathPoints = [];

  // Generate path points
  letters.forEach((letter) => {
    const keyEl = document.querySelector(`.key[data-letter="${letter}"]`);
    if (keyEl) {
      const keyRect = keyEl.getBoundingClientRect();
      // Center of the key
      pathPoints.push({
        x: keyRect.left + keyRect.width / 2,
        y: keyRect.top + keyRect.height / 2,
      });
    }
  });

  // Add intermediate points for smoother path
  const smoothedPoints = [];
  for (let i = 0; i < pathPoints.length - 1; i++) {
    smoothedPoints.push(pathPoints[i]);
    // Add midpoint
    smoothedPoints.push({
      x: (pathPoints[i].x + pathPoints[i + 1].x) / 2,
      y: (pathPoints[i].y + pathPoints[i + 1].y) / 2,
    });
  }
  if (pathPoints.length > 0) {
    smoothedPoints.push(pathPoints[pathPoints.length - 1]);
  }

  // Animate the swipe path
  let pointIndex = 0;
  const pathInterval = setInterval(() => {
    if (pointIndex < smoothedPoints.length) {
      const point = smoothedPoints[pointIndex];

      // Add letter to sequence when we hit a key point
      if (pointIndex % 2 === 0 && index < letters.length) {
        addKeyToSequence(letters[index]);

        // Highlight the key
        const keyEl = document.querySelector(
          `.key[data-letter="${letters[index]}"]`
        );
        if (keyEl) {
          keyEl.classList.add("active");
          setTimeout(() => keyEl.classList.remove("active"), 150);
        }
        index++;
      }

      // Visualize path point
      window.dispatchEvent(
        new CustomEvent("mousePositionUpdate", {
          detail: { x: point.x, y: point.y },
        })
      );

      pointIndex++;
    } else {
      clearInterval(pathInterval);

      // After swipe completes, simulate selecting the word
      setTimeout(() => {
        if (demoActive) {
          simulateWordSelection(selectedWord);
        }
      }, 800);
    }
  }, 50);
}

// Start the demo mode
function startDemoMode() {
  if (demoActive) return;

  demoActive = true;
  state.isCapturing = true;
  state.continuousMode = true;
  demoPhrase = "";

  // Clear existing text
  elements.selectedWordsContainer.textContent = "";

  // Update UI
  elements.captureToggle.classList.add("active");
  elements.captureToggle.textContent = "Demo Active";

  // Create a visual indicator for demo mode
  const demoIndicator = document.createElement("div");
  demoIndicator.id = "demoModeIndicator";
  demoIndicator.innerHTML = `<span>DEMO MODE: Phil's AI Engineering Assistant</span>`;
  demoIndicator.style.position = "fixed";
  demoIndicator.style.top = "10px";
  demoIndicator.style.right = "10px";
  demoIndicator.style.backgroundColor = "#ff5722";
  demoIndicator.style.color = "white";
  demoIndicator.style.padding = "8px 15px";
  demoIndicator.style.borderRadius = "5px";
  demoIndicator.style.zIndex = "9999";
  demoIndicator.style.fontWeight = "bold";
  demoIndicator.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  document.body.appendChild(demoIndicator);

  // Add explanatory text
  const demoExplanation = document.createElement("div");
  demoExplanation.id = "demoExplanation";
  demoExplanation.innerHTML = `
    <h3>Demo: AI Terminology Swipe Keyboard</h3>
    <p>This keyboard helps Phil, an AI engineer with mobility limitations, to type specialized technical terms.</p>
    <p>The demo simulates swiping patterns and shows predictive text suggestions.</p>
  `;
  demoExplanation.style.position = "fixed";
  demoExplanation.style.top = "60px";
  demoExplanation.style.right = "10px";
  demoExplanation.style.width = "280px";
  demoExplanation.style.backgroundColor = "#fff";
  demoExplanation.style.color = "#333";
  demoExplanation.style.padding = "15px";
  demoExplanation.style.borderRadius = "5px";
  demoExplanation.style.zIndex = "9999";
  demoExplanation.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  demoExplanation.style.lineHeight = "1.4";
  document.body.appendChild(demoExplanation);

  // Start the demo sequence
  runNextDemoScenario();

  // Set interval to continue demo
  demoInterval = setInterval(runNextDemoScenario, 8000);
}

// Run the next demo scenario
function runNextDemoScenario() {
  if (!demoActive) return;

  // Clear any existing paths
  clearPath();

  // Move to next scenario, loop back to start if necessary
  currentDemoScenario = (currentDemoScenario + 1) % demoScenarios.length;
  const scenario = demoScenarios[currentDemoScenario];

  // Simulate the first swipe
  simulateSwipe(
    scenario.swipe,
    scenario.predictedWords,
    scenario.selectedWord,
    scenario.sentencePredictions
  );

  // After a delay, simulate the follow-up word
  setTimeout(() => {
    if (demoActive) {
      simulateSwipe(
        scenario.followUp.swipe,
        scenario.followUp.predictedWords,
        scenario.followUp.selectedWord,
        [] // No sentence predictions for follow-up
      );
    }
  }, 4000);
}

// Stop the demo mode
function stopDemoMode() {
  if (!demoActive) return;

  demoActive = false;
  clearInterval(demoInterval);

  // Remove UI elements
  const indicator = document.getElementById("demoModeIndicator");
  if (indicator) indicator.remove();

  const explanation = document.getElementById("demoExplanation");
  if (explanation) explanation.remove();

  // Reset UI state
  elements.captureToggle.textContent = "Start Capturing";
  elements.captureToggle.classList.remove("active");

  // Clear existing paths
  clearPath();
}

// Toggle the demo mode
function toggleDemoMode() {
  if (demoActive) {
    stopDemoMode();
  } else {
    startDemoMode();
  }
}

export { startDemoMode, stopDemoMode, toggleDemoMode };
