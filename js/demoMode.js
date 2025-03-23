import { state, elements, addKeyToSequence, resetSequence } from "./core.js";
import { clearPath } from "./ui.js";

// Demo state
let demoActive = false;
let demoInterval;
let currentDemoScenario = 0;
let demoPhrase = "";
let demoStep = 0; // Track which step of the demo we're on
let demoMode = "word"; // "word" or "sentence"
let meetingContext = 0; // To track which meeting context we're in

// AI engineering meeting contexts to make demo more realistic
const meetingContexts = [
  "Team discussing neural network implementation",
  "Project planning for computer vision system",
  "AI ethics review meeting",
  "Technical discussion about transformer models",
  "Progress review on reinforcement learning project",
];

// AI engineering related terms and scenarios for Phil's demo
const demoScenarios = [
  // Scenario 1: Neural Network
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
      "neural network architecture needs optimization",
      "neural network training is showing promising results",
      "neural network implementation should be prioritized",
    ],
    useSentence: true,
    selectedSentence: 1,
  },

  // Scenario 3: Data Science (was originally at index 2)
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
      "data science methodology must be documented properly",
      "data science team needs additional compute resources",
      "data science project timeline should be extended",
    ],
    useSentence: true,
    selectedSentence: 0,
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

  predictions.forEach((sentence, index) => {
    const element = document.createElement("div");
    element.classList.add("sentence-suggestion");
    element.textContent = sentence;
    if (index === 0) element.classList.add("primary-suggestion");
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
      // Visual flash to show selection
      suggestion.style.backgroundColor = "#ffd700";
      setTimeout(() => {
        suggestion.style.backgroundColor = "";
      }, 300);
    } else {
      suggestion.classList.remove("suggestion-selected");
    }
  });

  // Add to demo phrase
  demoPhrase += (demoPhrase ? " " : "") + word;
}

// Function to simulate selecting a sentence
function simulateSentenceSelection(sentenceIndex, sentences) {
  if (!sentences || sentences.length === 0) return;

  const sentence = sentences[sentenceIndex];
  const selectedWordsElement = elements.selectedWordsContainer;

  // Simply replace the entire content with the sentence
  // This works better for the demo flow
  selectedWordsElement.textContent = sentence;

  // Highlight the selected sentence in suggestions
  const sentenceSuggestions = document.querySelectorAll(".sentence-suggestion");
  sentenceSuggestions.forEach((suggestion, index) => {
    if (index === sentenceIndex) {
      suggestion.classList.add("selected-sentence");
      // Visual flash to show selection
      suggestion.style.backgroundColor = "#90ee90";
      setTimeout(() => {
        suggestion.style.backgroundColor = "";
      }, 500);
    } else {
      suggestion.classList.remove("selected-sentence");
    }
  });

  // Update demo phrase
  demoPhrase = selectedWordsElement.textContent;
}

// Add tremor to a point to simulate MND movement
function addTremor(point, strength = 2) {
  return {
    x: point.x + (Math.random() * 2 - 1) * strength,
    y: point.y + (Math.random() * 2 - 1) * strength,
  };
}

// Creates a wavy path with realistic MND movement patterns
function createWavyPath(pathPoints, tremulousness = 8) {
  if (pathPoints.length < 2) return pathPoints;

  const wavyPath = [];
  const basePoints = [...pathPoints];

  // First, interpolate between base points to create a smoother path
  for (let i = 0; i < basePoints.length - 1; i++) {
    const start = basePoints[i];
    const end = basePoints[i + 1];

    // Add the start point
    wavyPath.push({ ...start });

    // Calculate vector between points
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Add more points for longer distances
    const pointCount = Math.max(3, Math.floor(distance / 15));

    for (let j = 1; j < pointCount; j++) {
      const ratio = j / pointCount;

      // Basic interpolation
      const baseX = start.x + dx * ratio;
      const baseY = start.y + dy * ratio;

      // Add some waviness perpendicular to the movement direction
      const perpX = -dy / distance;
      const perpY = dx / distance;
      const waveFactor = Math.sin(ratio * Math.PI * 2) * tremulousness;

      // Add small random tremors to simulate MND
      const tremorX = (Math.random() * 2 - 1) * (tremulousness * 0.4);
      const tremorY = (Math.random() * 2 - 1) * (tremulousness * 0.4);

      // Occasionally add larger tremor (simulate muscle spasm)
      const spasm = Math.random() > 0.9 ? tremulousness * 1.5 : 0;
      const spasmX = spasm * (Math.random() * 2 - 1);
      const spasmY = spasm * (Math.random() * 2 - 1);

      wavyPath.push({
        x: baseX + perpX * waveFactor + tremorX + spasmX,
        y: baseY + perpY * waveFactor + tremorY + spasmY,
      });
    }
  }

  // Add the final point
  wavyPath.push({ ...basePoints[basePoints.length - 1] });

  return wavyPath;
}

// Function to simulate a swipe pattern with realistic MND movement patterns
function simulateSwipe(
  swipePattern,
  predictedWords,
  selectedWord,
  sentencePredictions,
  useSentence = false,
  selectedSentenceIndex = 0
) {
  resetSequence();
  clearPath();

  // Don't display predictions immediately - we'll do this after the path animation
  // to mimic how it works in real use

  // Add letters to sequence one by one with delay
  const letters = swipePattern.split("");
  let index = 0;

  // Create base path points from letter positions
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

  // Create realistic wavy path with MND characteristics
  const tremulousness = Math.random() * 5 + 5; // Random tremor level between 5-10
  const wavyPath = createWavyPath(pathPoints, tremulousness);

  // Animate the swipe path with variable speed (realistic for MND)
  let pointIndex = 0;

  // Variable speed to make movement more realistic
  function getNextPointDelay() {
    // Slower base delay for more natural animation
    const baseDelay = 50; // Increased from 30
    const variability = 40; // Increased from 25
    return baseDelay + Math.random() * variability;
  }

  // Find the nearest letter position for a given point
  function findNearestLetterPosition(point, tolerance = 20) {
    for (let i = 0; i < letters.length; i++) {
      const keyEl = document.querySelector(`.key[data-letter="${letters[i]}"]`);
      if (keyEl) {
        const keyRect = keyEl.getBoundingClientRect();
        const keyCenter = {
          x: keyRect.left + keyRect.width / 2,
          y: keyRect.top + keyRect.height / 2,
        };

        const distance = Math.sqrt(
          Math.pow(point.x - keyCenter.x, 2) +
            Math.pow(point.y - keyCenter.y, 2)
        );

        if (distance < tolerance) {
          return i;
        }
      }
    }
    return -1;
  }

  // Track which letters have already been added
  const addedLetters = new Set();

  function animateNextPoint() {
    if (pointIndex < wavyPath.length) {
      const point = wavyPath[pointIndex];

      // Visualize path point
      window.dispatchEvent(
        new CustomEvent("mousePositionUpdate", {
          detail: { x: point.x, y: point.y },
        })
      );

      // Check if we're near a letter key
      const nearestLetterIndex = findNearestLetterPosition(point);

      // If we're near a letter key and haven't added it yet
      if (nearestLetterIndex >= 0 && !addedLetters.has(nearestLetterIndex)) {
        // 90% chance to add the letter (10% miss chance)
        if (Math.random() > 0.1) {
          addedLetters.add(nearestLetterIndex);
          const letter = letters[nearestLetterIndex];

          // Add slight pause before adding letter for more natural timing
          setTimeout(() => {
            if (demoActive) {
              addKeyToSequence(letter);

              // Highlight the key with longer duration
              const keyEl = document.querySelector(
                `.key[data-letter="${letter}"]`
              );
              if (keyEl) {
                keyEl.classList.add("active");
                setTimeout(() => {
                  if (demoActive) {
                    keyEl.classList.remove("active");
                  }
                }, 250); // Increased from 150ms
              }
            }
          }, 50);
        }
      }

      pointIndex++;

      // Variable delay for next point to simulate MND movement
      setTimeout(animateNextPoint, getNextPointDelay());
    } else {
      // Ensure all letters are added before completing
      const missingLetters = [];
      for (let i = 0; i < letters.length; i++) {
        if (!addedLetters.has(i)) {
          missingLetters.push(i);
        }
      }

      // Add any missing letters with sequential delays
      if (missingLetters.length > 0) {
        missingLetters.forEach((letterIndex, i) => {
          setTimeout(() => {
            if (demoActive) {
              const letter = letters[letterIndex];
              addKeyToSequence(letter);

              const keyEl = document.querySelector(
                `.key[data-letter="${letter}"]`
              );
              if (keyEl) {
                keyEl.classList.add("active");
                setTimeout(() => {
                  if (demoActive) {
                    keyEl.classList.remove("active");
                  }
                }, 250);
              }
            }
          }, i * 200);
        });

        // After adding missing letters, then show predictions and proceed to word selection
        setTimeout(() => {
          if (demoActive) {
            // Now display the predictions AFTER completing the path
            showPredictionsWithTypingEffect(
              predictedWords,
              sentencePredictions,
              () => {
                // After predictions are shown, complete the action
                afterAnimationComplete();
              }
            );
          }
        }, missingLetters.length * 200 + 400);
      } else {
        // Show predictions after path completion
        setTimeout(() => {
          if (demoActive) {
            showPredictionsWithTypingEffect(
              predictedWords,
              sentencePredictions,
              () => {
                // After predictions are shown, complete the action
                afterAnimationComplete();
              }
            );
          }
        }, 600);
      }
    }
  }

  // Show predictions with a typing effect to make it more realistic
  function showPredictionsWithTypingEffect(
    wordPredictions,
    sentencePredictions,
    callback
  ) {
    // Clear any existing predictions
    const wordContainer = document.querySelector(
      "#wordSuggestions .suggestions-scroll-container"
    );
    const sentenceContainer = document.querySelector(
      "#sentenceSuggestions .suggestions-container"
    );
    if (wordContainer) wordContainer.innerHTML = "";
    if (sentenceContainer) sentenceContainer.innerHTML = "";

    // Add a small thinking delay
    setTimeout(() => {
      // Show word predictions first with typing effect
      let wordIndex = 0;

      function addNextWordPrediction() {
        if (wordIndex < wordPredictions.length) {
          const word = wordPredictions[wordIndex];
          const suggestionBtn = document.createElement("button");
          suggestionBtn.className = "suggestion";
          if (wordIndex === 0)
            suggestionBtn.classList.add("suggestion-primary");
          suggestionBtn.textContent = word;
          if (wordContainer) wordContainer.appendChild(suggestionBtn);

          wordIndex++;
          setTimeout(addNextWordPrediction, 100); // Add words with a slight delay
        } else {
          // After all words are added, show sentence predictions
          addSentencePredictions();
        }
      }

      function addSentencePredictions() {
        // Add all sentence predictions at once since they're longer
        if (sentenceContainer) {
          sentencePredictions.forEach((sentence, index) => {
            const element = document.createElement("div");
            element.classList.add("sentence-suggestion");
            element.textContent = sentence;
            if (index === 0) element.classList.add("primary-suggestion");
            sentenceContainer.appendChild(element);
          });
        }

        // Call the callback after predictions are shown
        setTimeout(callback, 300);
      }

      // Start showing predictions
      addNextWordPrediction();
    }, 400); // Mimic "thinking" time
  }

  function afterAnimationComplete() {
    if (demoActive) {
      // If this scenario uses a sentence suggestion
      if (useSentence) {
        // First select the base word
        simulateWordSelection(selectedWord);

        // Then after a delay, select the full sentence
        setTimeout(() => {
          if (demoActive) {
            simulateSentenceSelection(
              selectedSentenceIndex,
              sentencePredictions
            );
          }
        }, 1800); // Increased from 1500
      } else {
        // Just select the word normally
        simulateWordSelection(selectedWord);
      }
    }
  }

  // Start the animation
  animateNextPoint();
}

// Run the next demo scenario with a clearer step-by-step approach
function runNextDemoScenario() {
  if (!demoActive) return;

  // Get current scenario
  const scenario = demoScenarios[currentDemoScenario];

  // Clear any existing UI elements to prevent overlapping
  clearAllDemoUIElements();

  // At the start of a new scenario, clear everything and show intro
  if (demoStep === 0) {
    // Clear the UI completely
    clearDemoUI();

    // Show scenario title and context
    showScenarioIntro(currentDemoScenario);

    // Pause to let user read the intro (3 seconds)
    setTimeout(() => {
      if (demoActive) continueDemo();
    }, 3000);
  } else {
    continueDemo();
  }

  function continueDemo() {
    // STEP 1: Basic word prediction with clear explanation
    if (demoStep === 0) {
      // Clear previous content
      elements.selectedWordsContainer.textContent = "";
      clearPath();

      // Show clear explanation of what's about to happen
      showDemoMessage(
        "STEP 1: Basic Word Prediction",
        "Watch how the system recognizes AI terminology from a swipe pattern"
      );

      // Add an arrow pointing to the keyboard to draw attention
      showKeyboardPointer("Swipe across keys to form words");

      // Wait a moment for user to read the message
      setTimeout(() => {
        if (demoActive) {
          // Run single word demonstration
          simulateSwipe(
            scenario.swipe,
            scenario.predictedWords,
            scenario.selectedWord,
            scenario.sentencePredictions,
            false
          );

          // Show "Continue" button after word selection only for first scenario
          setTimeout(() => {
            if (currentDemoScenario === 0) {
              showContinueButton();
            } else if (scenario.useSentence) {
              // Auto-advance to step 2 for other scenarios after 3 seconds
              demoStep = 1;
              setTimeout(() => {
                if (demoActive) runNextDemoScenario();
              }, 3000);
            } else {
              // Move to next scenario if no sentence prediction
              setTimeout(() => {
                currentDemoScenario =
                  (currentDemoScenario + 1) % demoScenarios.length;
                demoStep = 0;
                if (demoActive) runNextDemoScenario();
              }, 3000);
            }
          }, 3000);
        }
      }, 2000);

      // STEP 2: Sentence prediction with better context explanation
    } else if (demoStep === 1) {
      if (scenario.useSentence) {
        // Don't clear previous word - we need it for the sentence prediction
        clearPath();

        // First, clear any existing explanations
        clearAllDemoUIElements();

        // Show the context-aware explanation
        showContextAwareExplanation(scenario);

        // Wait a moment for user to read explanation - increased delay
        setTimeout(() => {
          if (demoActive) {
            // First, display the sentence predictions
            displayDemoSentencePredictions(scenario.sentencePredictions);

            // Add additional delay before highlighting word
            setTimeout(() => {
              if (demoActive) {
                // Highlight the selected word as context
                highlightWordAsContext(scenario.selectedWord);

                // After a delay, simulate selecting the sentence
                setTimeout(() => {
                  if (demoActive) {
                    // Show explanation of why this specific sentence was chosen
                    showSentenceSelectionReasoning(
                      scenario.selectedSentence,
                      scenario.sentencePredictions,
                      meetingContexts[meetingContext]
                    );

                    // Increased delay before sentence selection
                    setTimeout(() => {
                      if (demoActive) {
                        simulateSentenceSelection(
                          scenario.selectedSentence,
                          scenario.sentencePredictions
                        );

                        // Rest of the function remains the same...
                        // Show "Next Scenario" button for first scenario,
                        // auto-advance for others
                        setTimeout(() => {
                          if (currentDemoScenario === 0) {
                            showNextScenarioButton();
                          } else {
                            // Auto-advance to next scenario
                            demoStep = 0;
                            currentDemoScenario =
                              (currentDemoScenario + 1) % demoScenarios.length;
                            // Clean up
                            elements.selectedWordsContainer.textContent = "";
                            clearPath();
                            resetSequence();
                            // Go to next scenario
                            setTimeout(() => {
                              if (demoActive) runNextDemoScenario();
                            }, 2000);
                          }
                        }, 2000);
                      }
                    }, 2500);
                  }
                }, 1500);
              }
            }, 1500);
          }
        }, 2000);
      } else {
        // Skip to next scenario for scenarios without sentence prediction
        if (currentDemoScenario === 0) {
          showNextScenarioButton();
        } else {
          // Auto-advance to next scenario
          demoStep = 0;
          currentDemoScenario =
            (currentDemoScenario + 1) % demoScenarios.length;
          setTimeout(() => {
            if (demoActive) runNextDemoScenario();
          }, 2000);
        }
      }
    }
  }
}

// Create and show a continue button
function showContinueButton() {
  if (!demoActive) return;

  // Remove existing button if any
  const existingButton = document.getElementById("demoContinueButton");
  if (existingButton) existingButton.remove();

  const continueButton = document.createElement("button");
  continueButton.id = "demoContinueButton";
  continueButton.textContent = "Continue to Next Step →";
  continueButton.style.position = "fixed";
  continueButton.style.bottom = "80px";
  continueButton.style.left = "50%";
  continueButton.style.transform = "translateX(-50%)";
  continueButton.style.padding = "12px 24px";
  continueButton.style.backgroundColor = "#4CAF50";
  continueButton.style.color = "white";
  continueButton.style.border = "none";
  continueButton.style.borderRadius = "5px";
  continueButton.style.fontSize = "16px";
  continueButton.style.fontWeight = "bold";
  continueButton.style.cursor = "pointer";
  continueButton.style.zIndex = "10000";
  continueButton.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";

  // Pulse animation to draw attention
  continueButton.style.animation = "pulse 1.5s infinite";
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0% { transform: translateX(-50%) scale(1); }
      50% { transform: translateX(-50%) scale(1.05); }
      100% { transform: translateX(-50%) scale(1); }
    }
  `;
  document.head.appendChild(style);

  // Add click handler to proceed to next step
  continueButton.addEventListener("click", () => {
    continueButton.remove();
    demoStep = 1;
    runNextDemoScenario();
  });

  document.body.appendChild(continueButton);
}

// Create and show a next scenario button
function showNextScenarioButton() {
  if (!demoActive) return;

  // Remove existing button if any
  const existingButton = document.getElementById("demoContinueButton");
  if (existingButton) existingButton.remove();

  const nextButton = document.createElement("button");
  nextButton.id = "demoContinueButton";
  nextButton.textContent = "Next Scenario →";
  nextButton.style.position = "fixed";
  nextButton.style.bottom = "80px";
  nextButton.style.left = "50%";
  nextButton.style.transform = "translateX(-50%)";
  nextButton.style.padding = "12px 24px";
  nextButton.style.backgroundColor = "#2196F3";
  nextButton.style.color = "white";
  nextButton.style.border = "none";
  nextButton.style.borderRadius = "5px";
  nextButton.style.fontSize = "16px";
  nextButton.style.fontWeight = "bold";
  nextButton.style.cursor = "pointer";
  nextButton.style.zIndex = "10000";
  nextButton.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  nextButton.style.animation = "pulse 1.5s infinite";

  // Add click handler to proceed to next scenario
  nextButton.addEventListener("click", () => {
    nextButton.remove();
    demoStep = 0;
    currentDemoScenario = (currentDemoScenario + 1) % demoScenarios.length;
    // Programmatically press the clear all button
    triggerClearAll();
    // Run next scenario after a short delay
    setTimeout(() => {
      if (demoActive) runNextDemoScenario();
    }, 1000);
  });

  document.body.appendChild(nextButton);
}

// Programmatically trigger the Clear All button
function triggerClearAll() {
  // Find the clear all button
  const clearAllButton = document.querySelector(".clear-all-btn");
  if (clearAllButton) {
    // Create a visual effect showing it being pressed
    clearAllButton.classList.add("active");
    setTimeout(() => {
      clearAllButton.classList.remove("active");
    }, 300);

    // Perform the clear operation
    elements.selectedWordsContainer.textContent = "";
    clearPath();
    resetSequence();
  }
}

// Show intro for each scenario
function showScenarioIntro(scenarioIndex) {
  // Create a title for the current scenario
  const scenarioTitles = [
    "Neural Network Architecture",
    "Data Science Methodology",
  ];

  const title =
    scenarioTitles[scenarioIndex] || `AI Scenario ${scenarioIndex + 1}`;

  // Create an overlay with the scenario info
  const overlay = document.createElement("div");
  overlay.id = "scenarioIntroOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "10000";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 0.5s";

  overlay.innerHTML = `
    <div style="background-color: #fff; padding: 30px; border-radius: 10px; max-width: 80%; text-align: center;">
      <h2 style="margin-top: 0; color: #333;">Scenario ${
        scenarioIndex + 1
      }: ${title}</h2>
      <p style="font-size: 18px; margin-bottom: 10px;">Meeting Context: ${
        meetingContexts[meetingContext]
      }</p>
      <p style="font-size: 16px; color: #666;">Watch how Phil can efficiently contribute to this discussion</p>
    </div>
  `;

  document.body.appendChild(overlay);

  // Fade in
  setTimeout(() => {
    overlay.style.opacity = "1";
  }, 100);

  // Fade out after 2.5 seconds
  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 500);
  }, 2500);
}

// Clear all demo UI elements
function clearDemoUI() {
  // Clear the text area
  elements.selectedWordsContainer.textContent = "";

  // Clear any paths
  clearPath();

  // Reset sequence
  resetSequence();

  // Remove all demo UI elements
  clearAllDemoUIElements();
}

// Update the clearAllDemoUIElements function to be more comprehensive
function clearAllDemoUIElements() {
  // List of all temporary UI element IDs that might be present
  const elementsToRemove = [
    "demoContinueButton",
    "scenarioIntroOverlay",
    "demoMessage",
    "keyboardPointer",
    "contextExplanation",
    "wordContextHighlight",
    "sentenceReasoning",
    "demoStepExplanation",
    "nextScenarioButton",
  ];

  // Remove each element if it exists
  elementsToRemove.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.remove();
  });

  // Also remove any elements with specific classes that might be lingering
  document.querySelectorAll(".demo-temp-element").forEach((el) => el.remove());

  // Clear any highlight styles from sentences
  document.querySelectorAll(".sentence-suggestion").forEach((el) => {
    el.style.border = "";
  });

  // Clear any ongoing animations or timeouts
  const highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }
}

// Show step-specific explanation
function showStepExplanation() {
  // Remove any existing explanation
  const existingExplanation = document.getElementById("demoStepExplanation");
  if (existingExplanation) existingExplanation.remove();

  // Create new explanation
  const stepExplanation = document.createElement("div");
  stepExplanation.id = "demoStepExplanation";
  stepExplanation.style.position = "fixed";
  stepExplanation.style.bottom = "20px";
  stepExplanation.style.left = "50%";
  stepExplanation.style.transform = "translateX(-50%)";
  stepExplanation.style.backgroundColor = "#333";
  stepExplanation.style.color = "white";
  stepExplanation.style.padding = "10px 20px";
  stepExplanation.style.borderRadius = "5px";
  stepExplanation.style.zIndex = "9999";
  stepExplanation.style.fontWeight = "bold";
  stepExplanation.style.opacity = "0";
  stepExplanation.style.transition = "opacity 0.5s";

  // Set step-specific content
  if (demoStep === 0) {
    stepExplanation.innerHTML =
      "STEP 1: Demonstrating word prediction from swipe pattern";
  } else {
    stepExplanation.innerHTML =
      "STEP 2: Demonstrating sentence completion for technical discussions";
  }

  document.body.appendChild(stepExplanation);

  // Fade in
  setTimeout(() => {
    stepExplanation.style.opacity = "1";
  }, 100);
}

// Add a class to all temporary elements for easier cleanup
function addTempElementClass(element) {
  element.classList.add("demo-temp-element");
  return element;
}

// Show demo message
function showDemoMessage(title, message) {
  // Remove existing message if present
  const existingMessage = document.getElementById("demoMessage");
  if (existingMessage) existingMessage.remove();

  // Create message element
  const messageEl = document.createElement("div");
  messageEl.id = "demoMessage";
  addTempElementClass(messageEl); // Add temp class

  messageEl.innerHTML = `<h4>${title}</h4><p>${message}</p>`;
  messageEl.style.position = "fixed";
  messageEl.style.top = "140px";
  messageEl.style.left = "50%";
  messageEl.style.transform = "translateX(-50%)";
  messageEl.style.backgroundColor = "#1976d2";
  messageEl.style.color = "white";
  messageEl.style.padding = "15px 20px";
  messageEl.style.borderRadius = "5px";
  messageEl.style.zIndex = "9999";
  messageEl.style.boxShadow = "0 3px 10px rgba(0,0,0,0.2)";
  messageEl.style.textAlign = "center";
  messageEl.style.opacity = "0";
  messageEl.style.transition = "opacity 0.5s";

  document.body.appendChild(messageEl);

  // Fade in
  setTimeout(() => {
    messageEl.style.opacity = "1";
  }, 100);

  // Fade out after a few seconds
  setTimeout(() => {
    messageEl.style.opacity = "0";
    setTimeout(() => {
      if (messageEl.parentNode) messageEl.remove();
    }, 500);
  }, 4000);
}

// Similarly update other UI element creation functions
function showKeyboardPointer(message) {
  // Remove existing pointer if present
  const existingPointer = document.getElementById("keyboardPointer");
  if (existingPointer) existingPointer.remove();

  const keyboardEl = elements.keyboard;
  const keyboardRect = keyboardEl.getBoundingClientRect();

  // Create the pointer element
  const pointer = document.createElement("div");
  pointer.id = "keyboardPointer";
  addTempElementClass(pointer); // Add temp class

  pointer.style.position = "fixed";
  pointer.style.left = `${keyboardRect.left + keyboardRect.width / 2 - 100}px`;
  pointer.style.top = `${keyboardRect.top - 70}px`;
  pointer.style.zIndex = "9997"; // Make sure z-index is lower than other elements
  pointer.innerHTML = `
    <div style="background-color: #333; color: white; padding: 8px 15px; border-radius: 5px; text-align: center;">
      ${message}
      <div style="width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; 
           border-top: 10px solid #333; margin: 0 auto;"></div>
    </div>
  `;
  pointer.style.animation = "bounce 1.5s infinite";

  // Add bounce animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(pointer);

  // Remove after a few seconds
  setTimeout(() => {
    if (pointer.parentNode) pointer.remove();
  }, 5000);
}

// Update the showContextAwareExplanation function with improved timing management
function showContextAwareExplanation(scenario) {
  // First, thoroughly clear any existing UI elements
  clearAllDemoUIElements();

  // Now show the new message
  showDemoMessage(
    "STEP 2: Context-Aware Sentence Prediction",
    "The system analyzes meeting context to suggest complete technical phrases"
  );

  // Wait longer before showing the context explanation
  setTimeout(() => {
    if (!demoActive) return;

    // Create context explanation
    const contextEl = document.createElement("div");
    contextEl.id = "contextExplanation";
    addTempElementClass(contextEl);

    contextEl.style.position = "fixed";
    contextEl.style.top = "200px";
    contextEl.style.left = "50%";
    contextEl.style.transform = "translateX(-50%)";
    contextEl.style.backgroundColor = "rgba(25, 118, 210, 0.9)";
    contextEl.style.color = "white";
    contextEl.style.padding = "15px 20px";
    contextEl.style.borderRadius = "5px";
    contextEl.style.zIndex = "9998";
    contextEl.style.maxWidth = "600px";
    contextEl.style.textAlign = "left";
    contextEl.style.boxShadow = "0 3px 10px rgba(0,0,0,0.2)";

    // Customize explanation based on current meeting context
    const contextMessage = getContextSpecificExplanation(
      meetingContexts[meetingContext],
      scenario.selectedWord
    );

    contextEl.innerHTML = `
      <div style="margin-bottom: 10px;"><strong>How Sentence Prediction Works:</strong></div>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.4;">
        <li>Base word: <strong>${scenario.selectedWord}</strong></li>
        <li>Current meeting context: <strong>${meetingContexts[meetingContext]}</strong></li>
        <li>${contextMessage}</li>
      </ul>
    `;

    document.body.appendChild(contextEl);

    // Remove contextEl explicitly after a shorter time to avoid overlap
    setTimeout(() => {
      if (contextEl && contextEl.parentNode) {
        contextEl.style.opacity = "0";
        contextEl.style.transition = "opacity 0.5s";
        setTimeout(() => {
          if (contextEl.parentNode) contextEl.remove();
        }, 500);
      }
    }, 1500); // Reduced from 6000ms to 4000ms
  }, 3500); // Increased from 1500ms to 2000ms
}

// Get context-specific explanation for why sentences are suggested
function getContextSpecificExplanation(context, baseWord) {
  // Custom explanations based on meeting context and base word
  if (context.includes("neural network")) {
    return "AI suggests completions relevant to neural network architecture or training";
  } else if (context.includes("computer vision")) {
    return "Suggests vision-related technical phrases based on real-time project needs";
  } else if (context.includes("ethics")) {
    return "Prioritizes ethical considerations relevant to AI development discussions";
  } else if (context.includes("transformer")) {
    return "Recommends transformer architecture terminology based on technical context";
  } else if (context.includes("reinforcement")) {
    return "Suggests RL-specific terminology to keep pace with technical discussion";
  } else {
    return "Analyzes meeting topics to prioritize relevant technical completions";
  }
}

// Highlight the selected word as context for sentence prediction
function highlightWordAsContext(word) {
  // Find the word in the text area
  const textElement = elements.selectedWordsContainer;
  const text = textElement.textContent;

  if (text.endsWith(word)) {
    // Create a highlight effect
    const highlight = document.createElement("div");
    highlight.id = "wordContextHighlight";
    addTempElementClass(highlight); // Add temp class

    const textRect = textElement.getBoundingClientRect();

    // Calculate position for the word (rough estimate at end of text)
    highlight.style.position = "absolute";
    highlight.style.left = `${textRect.right - 80}px`;
    highlight.style.top = `${textRect.top - 3}px`;
    highlight.style.padding = "3px 5px";
    highlight.style.backgroundColor = "rgba(255, 235, 59, 0.7)";
    highlight.style.borderRadius = "3px";
    highlight.style.zIndex = "9997";
    highlight.style.pointerEvents = "none";
    highlight.style.animation = "pulse-highlight 1.5s infinite";

    // Add pulse animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse-highlight {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 0.3; }
      }
    `;
    document.head.appendChild(style);

    // Size the highlight to cover the word
    highlight.style.width = `${word.length * 12}px`;
    highlight.style.height = "24px";

    document.body.appendChild(highlight);

    // Remove after the animation completes
    setTimeout(() => {
      if (highlight.parentNode) highlight.remove();
    }, 3000);
  }
}

// Show explanation of why this specific sentence was chosen
function showSentenceSelectionReasoning(sentenceIndex, sentences, context) {
  // Remove existing reasoning if present
  const existingReasoning = document.getElementById("sentenceReasoning");
  if (existingReasoning) existingReasoning.remove();

  if (!sentences || sentences.length === 0) return;

  const sentence = sentences[sentenceIndex];

  // Determine reason based on sentence content and context
  let reason = "";
  if (sentence.includes("needs") || sentence.includes("requires")) {
    reason =
      "This suggestion addresses a resource need mentioned earlier in the meeting";
  } else if (sentence.includes("should")) {
    reason = "Suggests a course of action based on previous discussion points";
  } else if (sentence.includes("exceeds") || sentence.includes("promising")) {
    reason = "Highlights positive progress relevant to the current topic";
  } else if (
    sentence.includes("implementation") ||
    sentence.includes("architecture")
  ) {
    reason = "Focuses on technical implementation details being discussed";
  } else {
    reason = "Provides technical context relevant to the current discussion";
  }

  // Create reasoning bubble
  const reasoningEl = document.createElement("div");
  reasoningEl.id = "sentenceReasoning";
  addTempElementClass(reasoningEl); // Add temp class

  // Get sentence suggestions container position
  const sentenceSuggestionsEl = document.querySelector("#sentenceSuggestions");
  const containerRect = sentenceSuggestionsEl.getBoundingClientRect();

  reasoningEl.style.position = "fixed";
  reasoningEl.style.left = `${containerRect.left + 20}px`;
  reasoningEl.style.top = `${containerRect.top - 60}px`;
  reasoningEl.style.backgroundColor = "rgba(76, 175, 80, 0.9)";
  reasoningEl.style.color = "white";
  reasoningEl.style.padding = "8px 15px";
  reasoningEl.style.borderRadius = "5px";
  reasoningEl.style.zIndex = "9996"; // Consistent z-index
  reasoningEl.style.maxWidth = "500px";
  reasoningEl.innerHTML = `<strong>Why this suggestion:</strong> ${reason}`;

  // Add arrow pointing to sentences
  reasoningEl.innerHTML += `
    <div style="position:absolute; bottom:-10px; left:20px; width:0; 
         height:0; border-left:10px solid transparent; 
         border-right:10px solid transparent; 
         border-top:10px solid rgba(76, 175, 80, 0.9);"></div>
  `;

  document.body.appendChild(reasoningEl);

  // Highlight the specific sentence being chosen
  const sentenceSuggestions = document.querySelectorAll(".sentence-suggestion");
  if (sentenceSuggestions[sentenceIndex]) {
    sentenceSuggestions[sentenceIndex].style.border = "2px dashed #4CAF50";
  }

  // Remove after a delay
  setTimeout(() => {
    if (reasoningEl.parentNode) reasoningEl.remove();

    // Remove border from sentence
    if (sentenceSuggestions[sentenceIndex]) {
      sentenceSuggestions[sentenceIndex].style.border = "";
    }
  }, 2000);
}

// Start the demo mode
function startDemoMode() {
  if (demoActive) return;

  demoActive = true;
  state.isCapturing = true;
  state.continuousMode = true;
  demoPhrase = "";
  demoStep = 0; // Reset step
  currentDemoScenario = 0; // Start from first scenario

  // Clear existing text
  elements.selectedWordsContainer.textContent = "";

  // Update UI
  elements.captureToggle.classList.add("active");
  elements.captureToggle.textContent = "Demo Active";

  // Setup demo UI elements
  setupDemoUI();

  // Start the demo sequence
  runNextDemoScenario();

  // No need for interval since we're using step timeouts
  // demoInterval = setInterval(runNextDemoScenario, 10000);
}

// Setup demo UI elements
function setupDemoUI() {
  // Randomly select a meeting context
  meetingContext = Math.floor(Math.random() * meetingContexts.length);

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

  // Add context banner
  const contextBanner = document.createElement("div");
  contextBanner.id = "demoContextBanner";
  contextBanner.innerHTML = `<strong>Meeting Context:</strong> ${meetingContexts[meetingContext]}`;
  contextBanner.style.position = "fixed";
  contextBanner.style.top = "60px";
  contextBanner.style.left = "50%";
  contextBanner.style.transform = "translateX(-50%)";
  contextBanner.style.backgroundColor = "#333";
  contextBanner.style.color = "white";
  contextBanner.style.padding = "10px 20px";
  contextBanner.style.borderRadius = "5px";
  contextBanner.style.zIndex = "9999";
  contextBanner.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
  document.body.appendChild(contextBanner);

  // Add explanatory text
  const demoExplanation = document.createElement("div");
  demoExplanation.id = "demoExplanation";
  demoExplanation.innerHTML = `
    <h3>Demo: AI Terminology Swipe Keyboard for Phil</h3>
    <p>Phil works in tech and MND (Motor Neuron Disease) affects his mobility.</p>
    <p>Currently, Phil use a swipe keyboard on mobile phone to interact with colleagues.</p>
    <p>The phone is placed on his lap and he has to focus on his mobile and he cannot look at his colleagues on screen (vice versa).</p>
    <p>The plain swipe keyboard is not designed ergonomically for use with just his thumb. After a prolonged period, Phil feels tired.</p>
    <p>We have developed a on-screen keyboard and a trackball so that Phil can use with his thumb.</p>
    <p>Moving from a small mobile mobile screen to a larger screen with a trackball will be a big improvement for Phil in terms of gesture of his neck, as well as prepare him for AAC (Augmentative and Alternative Communication) devices.</p>
    <p>This keyboard allows him to participate in technical meetings with better interaction:</p>
    <ul>
      <li>Specialized AI term recognition</li>
      <li>Minimal physical movement required</li>
      <li>Keeps eyes on colleagues instead of on-screen mobile keyboard</li>
      <li>Sentence suggestion keeps pace with discussions</li>
    </ul>
  `;
  demoExplanation.style.position = "fixed";
  demoExplanation.style.top = "110px";
  demoExplanation.style.right = "10px";
  demoExplanation.style.width = "300px";
  demoExplanation.style.backgroundColor = "#fff";
  demoExplanation.style.color = "#333";
  demoExplanation.style.padding = "15px";
  demoExplanation.style.borderRadius = "5px";
  demoExplanation.style.zIndex = "9999";
  demoExplanation.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  demoExplanation.style.lineHeight = "1.4";
  document.body.appendChild(demoExplanation);
}

// Stop the demo mode
function stopDemoMode() {
  if (!demoActive) return;

  demoActive = false;
  clearTimeout(demoInterval); // Clear any pending timeouts

  // Remove UI elements
  const elementsToRemove = [
    "demoModeIndicator",
    "demoExplanation",
    "demoContextBanner",
    "demoStepExplanation",
    "demoMessage",
  ];

  elementsToRemove.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.remove();
  });

  // Reset UI state
  elements.captureToggle.textContent = "Start Capturing";
  elements.captureToggle.classList.remove("active");

  // Clear existing paths
  clearPath();
  elements.selectedWordsContainer.textContent = "";
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
