import { state, elements, addKeyToSequence, resetSequence } from "./core.js";
import { clearPath } from "./ui.js";
import { deleteLastWord } from "./prediction.js";

// Setup a fixed demo panel on the left
function setupDemoPanel() {
  // Remove any existing panel
  const existingPanel = document.getElementById("demoLeftPanel");
  if (existingPanel) existingPanel.remove();

  const demoPanel = document.createElement("div");
  demoPanel.id = "demoLeftPanel";
  demoPanel.style.position = "fixed";
  demoPanel.style.left = "10px";
  demoPanel.style.top = "10px";
  demoPanel.style.width = "280px";
  demoPanel.style.height = "calc(100vh - 20px)";
  demoPanel.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
  demoPanel.style.borderRadius = "8px";
  demoPanel.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
  demoPanel.style.zIndex = "9995";
  demoPanel.style.display = "flex";
  demoPanel.style.flexDirection = "column";
  demoPanel.style.overflow = "hidden";

  // Header section
  const header = document.createElement("div");
  header.style.padding = "15px";
  header.style.backgroundColor = "#ff5722";
  header.style.color = "white";
  header.style.borderTopLeftRadius = "8px";
  header.style.borderTopRightRadius = "8px";
  header.style.textAlign = "center";
  header.style.fontWeight = "bold";
  header.innerHTML = "DEMO MODE: Phil's AI Assistant";
  demoPanel.appendChild(header);

  // Context section
  const contextDiv = document.createElement("div");
  contextDiv.id = "demoPanelContext";
  contextDiv.style.padding = "12px";
  contextDiv.style.borderBottom = "1px solid #ddd";
  contextDiv.style.backgroundColor = "#333";
  contextDiv.style.color = "white";
  demoPanel.appendChild(contextDiv);

  // Message section
  const messageDiv = document.createElement("div");
  messageDiv.id = "demoPanelMessage";
  messageDiv.style.padding = "15px";
  messageDiv.style.borderBottom = "1px solid #ddd";
  messageDiv.style.backgroundColor = "#1976d2";
  messageDiv.style.color = "white";
  demoPanel.appendChild(messageDiv);

  // Content area (scrollable)
  const contentDiv = document.createElement("div");
  contentDiv.id = "demoPanelContent";
  contentDiv.style.padding = "15px";
  contentDiv.style.flex = "1";
  contentDiv.style.overflowY = "auto";
  demoPanel.appendChild(contentDiv);

  // Action area (for buttons)
  const actionDiv = document.createElement("div");
  actionDiv.id = "demoPanelActions";
  actionDiv.style.padding = "15px";
  actionDiv.style.borderTop = "1px solid #ddd";
  actionDiv.style.backgroundColor = "#f5f5f5";
  demoPanel.appendChild(actionDiv);

  document.body.appendChild(demoPanel);

  return demoPanel;
}

// Setup a right-side introduction panel
function setupIntroPanel() {
  // Remove any existing intro panel
  const existingPanel = document.getElementById("demoIntroPanel");
  if (existingPanel) existingPanel.remove();

  const introPanel = document.createElement("div");
  introPanel.id = "demoIntroPanel";
  introPanel.style.position = "fixed";
  introPanel.style.right = "10px";
  introPanel.style.top = "10px";
  introPanel.style.width = "280px";
  introPanel.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
  introPanel.style.borderRadius = "8px";
  introPanel.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
  introPanel.style.zIndex = "9994";
  introPanel.style.padding = "15px";
  introPanel.style.maxHeight = "calc(100vh - 350px)";
  introPanel.style.overflowY = "auto";

  // Add introduction content
  introPanel.innerHTML = `
    <h3 style="margin-top:0;margin-bottom:12px;color:#ff5722;">Context-aware Swipe Keyboard for Phil</h3>
    <p>Phil works in tech and has MND (Motor Neuron Disease) affecting his mobility.</p>
    <p>Currently, Phil uses a swipe keyboard on mobile phone, which is placed on his lap, to communicate with his colleagues. As a result, it requires him to look down at his phone all the time.</p>
    <p>Since mobile phone's screen is a plain surface, it's hard for Phil to use with only his thumb. When it's used for a prolonged period, it causes discomfort and pain in his thumb, as well as neck and back pain.</p>
    <p>It's also difficult for him to keep up with the pace of the conversation in technical meetings.</p>
    <p>This specialized keyboard, to be used with a trackball that is ergonomically designed for Phil, allows him to participate in technical meetings with better interaction:</p>
    <p>It is also linked to ElevenLabs' API to provide customised text-to-speech services.</p>
    <ul>
      <li>Specialized AI term recognition</li>
      <li>Minimal physical movement required</li>
      <li>Keeps eyes on colleagues on the monitor</li>
      <li>Sentence suggestion keeps pace with discussions</li>
    </ul>
    <p>This interface is also designed as a transition tool for Phil to use a gaze-controlled system in the future as it invites Phil to look at the screen more often.</p>
  `;

  document.body.appendChild(introPanel);
  return introPanel;
}

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
                currentDemoScenario++;
                if (currentDemoScenario >= demoScenarios.length) {
                  // We've shown all scenarios, now show backspace demo
                  showBackspaceDemo();
                  return; // Exit the current demo loop
                }
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

        // Now show the message (after clearing, so it won't get cleared)
        showDemoMessage(
          "STEP 2: Context-Aware Sentence Prediction",
          "Watch how the system learns from the selected word to predict full sentences"
        );

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
                            currentDemoScenario++;
                            if (currentDemoScenario >= demoScenarios.length) {
                              // We've shown all scenarios, now show backspace demo
                              showBackspaceDemo();
                              return; // Exit the current demo loop
                            }
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
          currentDemoScenario++;
          if (currentDemoScenario >= demoScenarios.length) {
            // We've shown all scenarios, now show backspace demo
            showBackspaceDemo();
            return; // Exit the current demo loop
          }
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

  const contentDiv = document.getElementById("demoPanelContent");
  if (!contentDiv) return;

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.style.marginTop = "15px";
  buttonContainer.style.marginBottom = "15px";

  const continueButton = document.createElement("button");
  continueButton.id = "demoContinueButton";
  continueButton.textContent = "Continue to Next Step →";
  continueButton.style.padding = "10px 16px";
  continueButton.style.backgroundColor = "#4CAF50";
  continueButton.style.color = "white";
  continueButton.style.border = "none";
  continueButton.style.borderRadius = "4px";
  continueButton.style.fontSize = "14px";
  continueButton.style.fontWeight = "bold";
  continueButton.style.cursor = "pointer";
  continueButton.style.width = "100%";

  // Add pulse animation
  continueButton.style.animation = "pulse 1.5s infinite";
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);

  // Add click handler
  continueButton.addEventListener("click", () => {
    buttonContainer.remove();
    demoStep = 1;
    runNextDemoScenario();
  });

  buttonContainer.appendChild(continueButton);
  contentDiv.appendChild(buttonContainer);

  // Scroll to show the button
  contentDiv.scrollTop = contentDiv.scrollHeight;
}

// Create and show a next scenario button
function showNextScenarioButton() {
  if (!demoActive) return;

  const contentDiv = document.getElementById("demoPanelContent");
  if (!contentDiv) return;

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.style.marginTop = "15px";
  buttonContainer.style.marginBottom = "15px";

  const nextButton = document.createElement("button");
  nextButton.id = "demoNextButton";
  nextButton.textContent = "Next Scenario →";
  nextButton.style.padding = "10px 16px";
  nextButton.style.backgroundColor = "#2196F3";
  nextButton.style.color = "white";
  nextButton.style.border = "none";
  nextButton.style.borderRadius = "4px";
  nextButton.style.fontSize = "14px";
  nextButton.style.fontWeight = "bold";
  nextButton.style.cursor = "pointer";
  nextButton.style.width = "100%";
  nextButton.style.animation = "pulse 1.5s infinite";

  // Add click handler
  nextButton.addEventListener("click", () => {
    buttonContainer.remove();
    demoStep = 0;
    currentDemoScenario++;
    if (currentDemoScenario >= demoScenarios.length) {
      // We've shown all scenarios, now show backspace demo
      showBackspaceDemo();
      return; // Exit the current demo loop
    }
    // Programmatically press the clear all button
    triggerClearAll();
    // Run next scenario after a short delay
    setTimeout(() => {
      if (demoActive) runNextDemoScenario();
    }, 1000);
  });

  buttonContainer.appendChild(nextButton);
  contentDiv.appendChild(buttonContainer);

  // Scroll to show the button
  contentDiv.scrollTop = contentDiv.scrollHeight;
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
  const scenarioTitles = [
    "Neural Network Architecture",
    "Data Science Methodology",
  ];

  const title =
    scenarioTitles[scenarioIndex] || `AI Scenario ${scenarioIndex + 1}`;

  // Update context in panel
  const contextDiv = document.getElementById("demoPanelContext");
  if (contextDiv) {
    contextDiv.innerHTML = `<strong>Meeting Context:</strong><br>${meetingContexts[meetingContext]}`;
  }

  // Update content in panel
  const contentDiv = document.getElementById("demoPanelContent");
  if (contentDiv) {
    contentDiv.innerHTML = `
      <h3 style="margin-top:0;">Scenario ${scenarioIndex + 1}: ${title}</h3>
      <p>Watch how Phil can efficiently contribute to this discussion using the swipe keyboard with specialized AI features.</p>
    `;
  }
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
  const messageDiv = document.getElementById("demoPanelMessage");
  const contentDiv = document.getElementById("demoPanelContent");
  const actionDiv = document.getElementById("demoPanelActions");

  if (messageDiv) messageDiv.innerHTML = "";
  if (contentDiv) contentDiv.innerHTML = "";
  if (actionDiv) actionDiv.innerHTML = "";

  // Still remove any elements that might be lingering outside the panels
  document.querySelectorAll(".demo-temp-element").forEach((el) => el.remove());

  // Clear any highlight styles from sentences
  document.querySelectorAll(".sentence-suggestion").forEach((el) => {
    el.style.border = "";
  });

  // Clear any ongoing animations or timeouts from UI interactions
  // But don't clear the main demo flow timeouts
  const buttons = document.querySelectorAll(
    "#demoContinueButton, #demoNextButton"
  );
  buttons.forEach((btn) => {
    if (btn.parentNode) btn.parentNode.remove();
  });
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
  const messageEl = document.getElementById("demoPanelMessage");
  if (!messageEl) return;

  messageEl.innerHTML = `<h4 style="margin-top:0;margin-bottom:8px;">${title}</h4>
                         <p style="margin:0;">${message}</p>`;
}

// Similarly update other UI element creation functions
function showKeyboardPointer(message) {
  const contentDiv = document.getElementById("demoPanelContent");
  if (!contentDiv) return;

  // Append to content (don't replace)
  contentDiv.innerHTML += `
    <div style="margin-top:15px;padding:10px;background-color:#f0f0f0;border-left:4px solid #333;border-radius:4px;">
      <strong>Action:</strong><br>${message}
    </div>
  `;

  // Scroll to bottom
  contentDiv.scrollTop = contentDiv.scrollHeight;
}

// Update the showContextAwareExplanation function with improved timing management
function showContextAwareExplanation(scenario) {
  const contentDiv = document.getElementById("demoPanelContent");
  if (!contentDiv) return;

  // Get context message
  const contextMessage = getContextSpecificExplanation(
    meetingContexts[meetingContext],
    scenario.selectedWord
  );

  contentDiv.innerHTML += `
    <div style="margin-top:15px;padding:12px;background-color:rgba(25, 118, 210, 0.1);border-radius:4px;border-left:4px solid #1976d2;">
      <strong>How Sentence Prediction Works:</strong>
      <ul style="margin-top:8px;padding-left:20px;">
        <li>Base word: <strong>${scenario.selectedWord}</strong></li>
        <li>Current meeting context: <strong>${meetingContexts[meetingContext]}</strong></li>
        <li>${contextMessage}</li>
      </ul>
    </div>
  `;

  // Scroll to bottom
  contentDiv.scrollTop = contentDiv.scrollHeight;
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
  if (!sentences || sentences.length === 0) return;

  const sentence = sentences[sentenceIndex];
  const contentDiv = document.getElementById("demoPanelContent");
  if (!contentDiv) return;

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

  contentDiv.innerHTML += `
    <div style="margin-top:15px;padding:12px;background-color:rgba(76, 175, 80, 0.1);border-radius:4px;border-left:4px solid #4CAF50;">
      <strong>Why this suggestion:</strong><br>
      ${reason}
    </div>
  `;

  // Scroll to bottom
  contentDiv.scrollTop = contentDiv.scrollHeight;
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

  // Setup the demo panel on the left
  setupDemoPanel();

  // Don't create a new intro panel - just ensure it exists
  if (!document.getElementById("demoIntroPanel")) {
    setupIntroPanel();
  }

  // Update context in panel
  const contextDiv = document.getElementById("demoPanelContext");
  if (contextDiv) {
    contextDiv.innerHTML = `<strong>Meeting Context:</strong><br>${meetingContexts[meetingContext]}`;
  }

  // Update content in panel with task information
  const contentDiv = document.getElementById("demoPanelContent");
  if (contentDiv) {
    contentDiv.innerHTML = `
      <h3 style="margin-top:0;">Demo Instructions</h3>
      <p>This demonstration will show how Phil uses the keyboard during technical meetings:</p>
      <ol>
        <li>Word prediction from swipe patterns</li>
        <li>Sentence suggestions based on context</li>
        <li>Backspace functionality</li>
      </ol>
      <p>Follow along with each step shown in this panel.</p>
    `;
  }
}

// Stop the demo mode
function stopDemoMode() {
  if (!demoActive) return;

  demoActive = false;
  clearTimeout(demoInterval); // Clear any pending timeouts

  // Remove only the left demo panel
  const demoPanel = document.getElementById("demoLeftPanel");
  if (demoPanel) demoPanel.remove();

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

// Add this function to implement the backspace demo

function showBackspaceDemo() {
  // Clear previous content but leave text to delete
  clearPath();
  elements.selectedWordsContainer.textContent = "Neural network architecture";

  // Show explanation in panel
  showDemoMessage(
    "Backspace Demo",
    "Watch how the backspace key can be used to delete words"
  );

  // Update content in panel
  const contentDiv = document.getElementById("demoPanelContent");
  if (contentDiv) {
    contentDiv.innerHTML = `
      <h3 style="margin-top:0;">Backspace Feature</h3>
      <p>The backspace function allows Phil to quickly delete the last word entered.</p>
      <div style="margin-top:15px;padding:10px;background-color:#f0f0f0;border-left:4px solid #333;border-radius:4px;">
        <strong>Action:</strong><br>Press backspace to delete words
      </div>
    `;
  }

  // After a delay, simulate pressing the backspace key
  setTimeout(() => {
    if (!demoActive) return;

    // Find and highlight the backspace key
    const backspaceKey = document.querySelector(
      '.key[data-action="backspace"]'
    );
    if (backspaceKey) {
      backspaceKey.classList.add("active");

      // Simulate backspace action
      deleteLastWord();

      // Remove highlight after a delay
      setTimeout(() => {
        backspaceKey.classList.remove("active");

        // Update content to show completion
        if (contentDiv) {
          contentDiv.innerHTML += `
            <div style="margin-top:15px;padding:10px;background-color:rgba(76, 175, 80, 0.1);border-radius:4px;border-left:4px solid #4CAF50;">
              <strong>Demo Complete!</strong><br>
              All features have been demonstrated
            </div>
          `;
          contentDiv.scrollTop = contentDiv.scrollHeight;
        }

        // End the demo after a delay
        setTimeout(() => {
          stopDemoMode();
        }, 3000);
      }, 500);
    }
  }, 3000);
}

export { startDemoMode, stopDemoMode, toggleDemoMode, setupIntroPanel };
